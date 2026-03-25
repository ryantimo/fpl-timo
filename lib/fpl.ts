// lib/fpl.ts — FPL API client + data processing (server-side only)

const BASE = "https://fantasy.premierleague.com/api"
const UA   = "Mozilla/5.0 (compatible; FPL-Timo/1.0)"

async function get<T>(path: string, params?: Record<string,string>): Promise<T> {
  const url = new URL(`${BASE}${path}`)
  if (params) Object.entries(params).forEach(([k,v]) => url.searchParams.set(k,v))
  const r = await fetch(url.toString(), {
    headers: { "User-Agent": UA },
    next: { revalidate: 300 },
  })
  if (!r.ok) throw new Error(`FPL API ${path} → ${r.status}`)
  return r.json()
}

// ── Raw API ───────────────────────────────────────────────────────────────────

export const fetchBootstrap   = () => get<any>("/bootstrap-static/")
export const fetchLive        = (gw: number) => get<any>(`/event/${gw}/live/`)
export const fetchFixtures    = () => get<any[]>("/fixtures/")
export const fetchPicks       = (tid: number, gw: number) =>
  get<any>(`/entry/${tid}/event/${gw}/picks/`).catch(() => null)
export const fetchTransfers   = (tid: number) => get<any[]>(`/entry/${tid}/transfers/`)
export const fetchHistory     = (tid: number) => get<any>(`/entry/${tid}/history/`)
export const fetchStandings   = (lid: number, page: number) =>
  get<any>(`/leagues-classic/${lid}/standings/`, { page_standings: String(page) })

export async function fetchAllTeams(lid: number): Promise<[any[], any]> {
  const teams: any[] = []
  let page = 1, meta: any = {}
  while (true) {
    const d = await fetchStandings(lid, page)
    meta = d.league
    teams.push(...d.standings.results)
    if (!d.standings.has_next) break
    page++
  }
  return [teams, meta]
}

// ── Types ─────────────────────────────────────────────────────────────────────

export interface Standing {
  rank: number; manager: string; teamName: string
  gwPts: number | null; total: number; gap: string; chip: string
  transferCost: number
}

export interface CaptainRow {
  player: string; team: string; position: string
  count: number; pct: number; gwPts: number; captainPts: number; vcCount: number
}

export interface CaptainDetail {
  manager: string; teamName: string; captain: string; gwPts: number; captainPts: number
}

export interface OwnershipRow {
  player: string; team: string; position: string; price: string
  leagueCount: number; leaguePct: number; globalPct: number
  form: number; gwPts: number; epNext: number
}

export interface TransferRow {
  manager: string; teamName: string
  out: string; outPts: number; in: string; inPts: number; net: number; result: string
}

export interface RankPoint {
  manager: string; gw: number; total: number; projected: boolean; rank: number
}

export interface FixtureCell { label: string; fdr: number | null }

export interface FixtureTeamRow { team: string; fixtures: Record<string, FixtureCell> }

export interface ProjectionRow {
  manager: string; teamName: string
  gw1: number; gw2: number; gw3: number; total3: number; rank: number
}

export interface TargetRow {
  player: string; team: string; position: string; price: string
  epNext: number; form: number; leaguePct: number; globalPct: number; fdrs: string
}

export interface LeagueData {
  league: { id: number; name: string }
  currentGw: number
  standings: Standing[]
  captains: CaptainRow[]
  captainDetails: CaptainDetail[]
  ownership: OwnershipRow[]
  differentials: OwnershipRow[]
  transfers: TransferRow[]
  rankings: RankPoint[]
  fixtureTicker: FixtureTeamRow[]
  projections: ProjectionRow[]
  targets: TargetRow[]
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function getCurrentGw(boot: any): number {
  for (const e of boot.events) if (e.is_current) return e.id
  for (let i = boot.events.length - 1; i >= 0; i--) if (boot.events[i].finished) return boot.events[i].id
  return 1
}

function buildPlayerMap(boot: any, live: any): Map<number, any> {
  const teams: Record<number,string> = {}
  for (const t of boot.teams) teams[t.id] = t.short_name
  const pos: Record<number,string> = {1:"GKP",2:"DEF",3:"MID",4:"FWD"}
  const livePts: Record<number,number> = {}
  if (live) for (const el of live.elements) livePts[el.id] = el.stats.total_points

  const map = new Map<number,any>()
  for (const p of boot.elements) {
    map.set(p.id, {
      name: p.web_name, fullName: `${p.first_name} ${p.second_name}`,
      team: teams[p.team], teamId: p.team,
      position: pos[p.element_type],
      price: p.now_cost / 10,
      form: parseFloat(p.form || "0"),
      globalOwn: parseFloat(p.selected_by_percent || "0"),
      gwPts: livePts[p.id] ?? p.event_points ?? 0,
      epNext: parseFloat(p.ep_next || "0"),
      epThis: parseFloat(p.ep_this || "0"),
    })
  }
  return map
}

type FixMap = Map<number, Map<number, Array<{fdr:number; oppId:number; home:boolean}>>>

function buildFixMap(fixtures: any[], fromGw: number, count: number): FixMap {
  const target = new Set(Array.from({length:count}, (_,i) => fromGw+i))
  const map: FixMap = new Map()
  for (const f of fixtures) {
    if (!target.has(f.event)) continue
    for (const [tid, opp, fdr, home] of [
      [f.team_h, f.team_a, f.team_h_difficulty, true],
      [f.team_a, f.team_h, f.team_a_difficulty, false],
    ] as [number,number,number,boolean][]) {
      if (!map.has(tid)) map.set(tid, new Map())
      const gwMap = map.get(tid)!
      if (!gwMap.has(f.event)) gwMap.set(f.event, [])
      gwMap.get(f.event)!.push({ fdr, oppId: opp, home })
    }
  }
  return map
}

// ── Standings ─────────────────────────────────────────────────────────────────

function processStandings(teams: any[], picksMap: Map<number,any>): Standing[] {
  const rows: Standing[] = []
  let leader = 0
  for (const t of teams) if (t.total > leader) leader = t.total

  for (const t of teams) {
    const picks = picksMap.get(t.entry)
    rows.push({
      rank: t.rank,
      manager: t.player_name,
      teamName: t.entry_name,
      gwPts: picks?.entry_history?.points ?? null,
      total: t.total,
      gap: t.total < leader ? `-${leader - t.total}` : "–",
      chip: picks?.active_chip ?? "–",
      transferCost: picks?.entry_history?.event_transfers_cost ?? 0,
    })
  }
  return rows.sort((a,b) => a.rank - b.rank)
}

// ── Captains ──────────────────────────────────────────────────────────────────

function processCaptains(teams: any[], picksMap: Map<number,any>, pmap: Map<number,any>): [CaptainRow[], CaptainDetail[]] {
  const capCounts = new Map<number,number>()
  const vcCounts  = new Map<number,number>()
  const details: CaptainDetail[] = []
  let n = 0

  for (const t of teams) {
    const picks = picksMap.get(t.entry)
    if (!picks) continue
    n++
    for (const p of picks.picks) {
      if (p.is_captain) {
        capCounts.set(p.element, (capCounts.get(p.element) ?? 0) + 1)
        const info = pmap.get(p.element)
        details.push({
          manager: t.player_name, teamName: t.entry_name,
          captain: info?.name ?? "?",
          gwPts: info?.gwPts ?? 0,
          captainPts: (info?.gwPts ?? 0) * 2,
        })
      }
      if (p.is_vice_captain) vcCounts.set(p.element, (vcCounts.get(p.element) ?? 0) + 1)
    }
  }

  const rows: CaptainRow[] = []
  for (const [pid, count] of [...capCounts.entries()].sort((a,b) => b[1]-a[1])) {
    const info = pmap.get(pid)
    rows.push({
      player: info?.name ?? "?", team: info?.team ?? "?", position: info?.position ?? "?",
      count, pct: Math.round(count/n*1000)/10,
      gwPts: info?.gwPts ?? 0, captainPts: (info?.gwPts ?? 0) * 2,
      vcCount: vcCounts.get(pid) ?? 0,
    })
  }
  return [rows, details.sort((a,b) => b.captainPts - a.captainPts)]
}

// ── Ownership ─────────────────────────────────────────────────────────────────

function processOwnership(teams: any[], picksMap: Map<number,any>, pmap: Map<number,any>): OwnershipRow[] {
  const counts = new Map<number,number>()
  const n = teams.filter(t => picksMap.get(t.entry)).length

  for (const t of teams) {
    const picks = picksMap.get(t.entry)
    if (!picks) continue
    for (const p of picks.picks) counts.set(p.element, (counts.get(p.element) ?? 0) + 1)
  }

  return [...counts.entries()]
    .sort((a,b) => b[1]-a[1])
    .map(([pid, cnt]) => {
      const info = pmap.get(pid)!
      return {
        player: info.name, team: info.team, position: info.position,
        price: `£${info.price.toFixed(1)}m`,
        leagueCount: cnt,
        leaguePct: Math.round(cnt/n*1000)/10,
        globalPct: info.globalOwn,
        form: info.form, gwPts: info.gwPts, epNext: info.epNext,
      }
    })
}

// ── Transfers ─────────────────────────────────────────────────────────────────

function processTransfers(teams: any[], transfersMap: Map<number,any[]>, pmap: Map<number,any>, gw: number): TransferRow[] {
  const rows: TransferRow[] = []
  for (const t of teams) {
    const gwT = (transfersMap.get(t.entry) ?? []).filter(tr => tr.event === gw)
    for (const tr of gwT) {
      const pIn  = pmap.get(tr.element_in)
      const pOut = pmap.get(tr.element_out)
      const net  = (pIn?.gwPts ?? 0) - (pOut?.gwPts ?? 0)
      rows.push({
        manager: t.player_name, teamName: t.entry_name,
        out: pOut?.name ?? "?", outPts: pOut?.gwPts ?? 0,
        in:  pIn?.name  ?? "?", inPts:  pIn?.gwPts  ?? 0,
        net,
        result: net > 0 ? "good" : net < 0 ? "bad" : "neutral",
      })
    }
  }
  return rows.sort((a,b) => b.net - a.net)
}

// ── Rankings chart ────────────────────────────────────────────────────────────

function projectGwScores(
  teams: any[], picksMap: Map<number,any>, pmap: Map<number,any>,
  fixMap: FixMap, fromGw: number, count: number,
): Map<number, Map<number,number>> {
  const result = new Map<number, Map<number,number>>()
  const gws = Array.from({length:count}, (_,i) => fromGw+i)
  for (const t of teams) {
    const scores = new Map<number,number>()
    const picks = picksMap.get(t.entry)
    if (picks) {
      const starters = picks.picks.filter((p:any) => (p.multiplier??0) > 0)
      for (const pick of starters) {
        const info = pmap.get(pick.element)
        if (!info) continue
        const mult = pick.multiplier ?? 1
        const tFixMap = fixMap.get(info.teamId) ?? new Map()
        for (let i=0; i<gws.length; i++) {
          const gw = gws[i]
          const fixes = tFixMap.get(gw) ?? []
          if (!fixes.length) continue
          let pts = 0
          if (i === 0) {
            pts = info.epNext * mult
          } else {
            for (const f of fixes) pts += info.form * ((6 - f.fdr) / 5) * mult
          }
          scores.set(gw, (scores.get(gw) ?? 0) + pts)
        }
      }
    }
    result.set(t.entry, scores)
  }
  return result
}

function processRankings(
  teams: any[], historiesMap: Map<number,any>, picksMap: Map<number,any>,
  pmap: Map<number,any>, fixtures: any[], currentGw: number,
): RankPoint[] {
  const fromGw   = Math.max(1, currentGw - 4)
  const nextGw   = currentGw + 1
  const fixMap   = buildFixMap(fixtures, nextGw, 5)
  const projScores = projectGwScores(
    teams.slice(0,20), picksMap, pmap, fixMap, nextGw, 5
  )

  const points: RankPoint[] = []
  for (const t of teams.slice(0,20)) {
    const hist = historiesMap.get(t.entry)
    const gwTotals = new Map<number,number>()
    for (const e of (hist?.current ?? [])) gwTotals.set(e.event, e.total_points)

    for (let gw = fromGw; gw <= currentGw; gw++) {
      const total = gwTotals.get(gw)
      if (total !== undefined) points.push({ manager: t.player_name, gw, total, projected: false, rank: t.rank })
    }

    let cumulative = t.total
    const scores = projScores.get(t.entry) ?? new Map()
    for (let i=0; i<5; i++) {
      const gw = nextGw + i
      cumulative += scores.get(gw) ?? 0
      points.push({ manager: t.player_name, gw, total: Math.round(cumulative), projected: true, rank: t.rank })
    }
  }
  return points
}

// ── Fixture ticker ────────────────────────────────────────────────────────────

function processFixtureTicker(boot: any, fixtures: any[], fromGw: number, count: number): FixtureTeamRow[] {
  const short: Record<number,string> = {}
  const name:  Record<number,string> = {}
  for (const t of boot.teams) { short[t.id] = t.short_name; name[t.id] = t.name }
  const fixMap = buildFixMap(fixtures, fromGw, count)
  const gws = Array.from({length:count}, (_,i) => fromGw+i)

  return boot.teams
    .sort((a:any,b:any) => a.name.localeCompare(b.name))
    .map((t:any) => {
      const cells: Record<string, FixtureCell> = {}
      for (const gw of gws) {
        const col = `GW${gw}`
        const fixes = fixMap.get(t.id)?.get(gw) ?? []
        if (!fixes.length) {
          cells[col] = { label: "–", fdr: null }
        } else {
          const labels = fixes.map(f => `${short[f.oppId]}(${f.home?"H":"A"})`)
          const avgFdr = Math.round(fixes.reduce((s,f)=>s+f.fdr,0) / fixes.length)
          cells[col] = { label: (fixes.length>1?"DGW ":"")+labels.join(" & "), fdr: avgFdr }
        }
      }
      return { team: name[t.id], fixtures: cells }
    })
}

// ── Squad projections ─────────────────────────────────────────────────────────

function processProjections(
  teams: any[], picksMap: Map<number,any>, pmap: Map<number,any>,
  fixtures: any[], fromGw: number,
): ProjectionRow[] {
  const fixMap = buildFixMap(fixtures, fromGw, 3)
  const scores = projectGwScores(teams, picksMap, pmap, fixMap, fromGw, 3)
  const gws = [fromGw, fromGw+1, fromGw+2]

  return teams
    .map(t => {
      const s = scores.get(t.entry) ?? new Map()
      const [g1,g2,g3] = gws.map(g => Math.round((s.get(g)??0)*10)/10)
      return { manager: t.player_name, teamName: t.entry_name, gw1:g1, gw2:g2, gw3:g3, total3: Math.round((g1+g2+g3)*10)/10, rank: t.rank }
    })
    .sort((a,b) => b.total3 - a.total3)
}

// ── Transfer targets ──────────────────────────────────────────────────────────

function processTargets(
  teams: any[], picksMap: Map<number,any>, pmap: Map<number,any>,
  fixtures: any[], fromGw: number, maxLeaguePct: number,
): TargetRow[] {
  const counts = new Map<number,number>()
  const n = teams.filter(t => picksMap.get(t.entry)).length
  for (const t of teams) {
    const picks = picksMap.get(t.entry)
    if (!picks) continue
    for (const p of picks.picks) counts.set(p.element, (counts.get(p.element)??0)+1)
  }

  const fixMap = buildFixMap(fixtures, fromGw, 3)
  const short: Record<number,string> = {}
  for (const t of (pmap as any)._boot?.teams ?? []) short[t.id] = t.short_name

  const rows: TargetRow[] = []
  for (const [pid, info] of pmap) {
    if (info.epNext < 4) continue
    const leaguePct = Math.round((counts.get(pid)??0)/n*1000)/10
    if (leaguePct >= maxLeaguePct) continue
    const tFix = fixMap.get(info.teamId) ?? new Map()
    const fdrs = [fromGw, fromGw+1, fromGw+2].map(gw => {
      const f = tFix.get(gw) ?? []
      return f.length ? f.map((x:any)=>x.fdr).join("/") : "–"
    })
    rows.push({
      player: info.name, team: info.team, position: info.position,
      price: `£${info.price.toFixed(1)}m`,
      epNext: info.epNext, form: info.form,
      leaguePct, globalPct: info.globalOwn,
      fdrs: fdrs.join(" | "),
    })
  }
  return rows.sort((a,b) => b.epNext-a.epNext).slice(0,25)
}

// ── Main entry point ──────────────────────────────────────────────────────────

export async function getLeagueData(leagueId: number, gw?: number): Promise<LeagueData> {
  const [boot, [teams, leagueMeta]] = await Promise.all([
    fetchBootstrap(),
    fetchAllTeams(leagueId),
  ])

  const currentGw = gw ?? getCurrentGw(boot)

  const [live, fixtures, ...teamData] = await Promise.all([
    fetchLive(currentGw),
    fetchFixtures(),
    ...teams.map((t, i) =>
      new Promise<any>(resolve => setTimeout(async () => {
        const [picks, transfers, history] = await Promise.all([
          fetchPicks(t.entry, currentGw),
          fetchTransfers(t.entry),
          fetchHistory(t.entry),
        ])
        resolve({ tid: t.entry, picks, transfers, history })
      }, i * 80))
    ),
  ])

  const pmap     = buildPlayerMap(boot, live)
  const picksMap = new Map<number,any>()
  const transMap = new Map<number,any[]>()
  const histMap  = new Map<number,any>()

  for (const d of teamData as any[]) {
    picksMap.set(d.tid, d.picks)
    transMap.set(d.tid, d.transfers)
    histMap.set(d.tid, d.history)
  }

  const ownership = processOwnership(teams, picksMap, pmap)
  const nextGw    = currentGw + 1

  return {
    league: { id: leagueId, name: leagueMeta.name },
    currentGw,
    standings:      processStandings(teams, picksMap),
    captains:       processCaptains(teams, picksMap, pmap)[0],
    captainDetails: processCaptains(teams, picksMap, pmap)[1],
    ownership,
    differentials:  ownership.filter(r => r.leaguePct > 0 && r.leaguePct < 50),
    transfers:      processTransfers(teams, transMap, pmap, currentGw),
    rankings:       processRankings(teams, histMap, picksMap, pmap, fixtures, currentGw),
    fixtureTicker:  processFixtureTicker(boot, fixtures, nextGw, 6),
    projections:    processProjections(teams, picksMap, pmap, fixtures, nextGw),
    targets:        processTargets(teams, picksMap, pmap, fixtures, nextGw, 30),
  }
}
