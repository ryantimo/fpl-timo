"use client"
import { useEffect, useState, useCallback } from "react"
import { RefreshCw, ChevronDown } from "lucide-react"
import Sidebar from "@/components/Sidebar"
import StandingsTab    from "@/components/tabs/StandingsTab"
import RankingsTab     from "@/components/tabs/RankingsTab"
import CaptainsTab     from "@/components/tabs/CaptainsTab"
import OwnershipTab    from "@/components/tabs/OwnershipTab"
import DifferentialsTab from "@/components/tabs/DifferentialsTab"
import TransfersTab    from "@/components/tabs/TransfersTab"
import ForecastTab     from "@/components/tabs/ForecastTab"
import type { LeagueData } from "@/lib/fpl"

export default function Page() {
  const [tab, setTab]      = useState("standings")
  const [data, setData]    = useState<LeagueData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]  = useState<string | null>(null)
  const [gw, setGw]        = useState<number | null>(null)

  const load = useCallback(async (gwOverride?: number) => {
    setLoading(true); setError(null)
    try {
      const url = gwOverride ? `/api/fpl?gw=${gwOverride}` : "/api/fpl"
      const res = await fetch(url)
      if (!res.ok) throw new Error(await res.text())
      const d: LeagueData = await res.json()
      setData(d)
      setGw(d.currentGw)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const gws = data ? Array.from({length: data.currentGw}, (_, i) => data.currentGw - i) : []

  return (
    <div className="flex min-h-screen" style={{ background:"#07070f" }}>
      <Sidebar active={tab} onChange={setTab}
        leagueName={data?.league.name ?? "Loading…"}
        gw={data?.currentGw ?? 0} />

      {/* Main */}
      <main className="flex-1 ml-56 min-h-screen flex flex-col">
        {/* Top bar */}
        <header className="sticky top-0 z-30 flex items-center justify-between px-8 py-4"
          style={{ background:"rgba(7,7,15,0.85)", backdropFilter:"blur(12px)", borderBottom:"1px solid rgba(255,255,255,0.06)" }}>
          <div>
            <h1 className="font-bold text-white text-lg capitalize">{tab}</h1>
            {data && <p className="text-xs mt-0.5" style={{ color:"#4b4b6b" }}>{data.league.name} · GW{data.currentGw}</p>}
          </div>

          <div className="flex items-center gap-3">
            {/* GW selector */}
            {gws.length > 0 && (
              <div className="relative">
                <select value={gw ?? ""} onChange={e => { const v = parseInt(e.target.value); setGw(v); load(v) }}
                  className="appearance-none pl-3 pr-8 py-1.5 rounded-lg text-sm font-medium cursor-pointer"
                  style={{ background:"#111120", color:"#c5c5d8", border:"1px solid rgba(255,255,255,0.08)" }}>
                  {gws.map(g => <option key={g} value={g}>GW {g}</option>)}
                </select>
                <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color:"#6b6b8b" }} />
              </div>
            )}

            <button onClick={() => load(gw ?? undefined)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
              style={{ background:"rgba(0,255,133,0.1)", color:"#00ff85", border:"1px solid rgba(0,255,133,0.2)" }}>
              <RefreshCw size={12} className={loading ? "animate-spin" : ""} />
              Refresh
            </button>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 px-8 py-6">
          {error && (
            <div className="card p-5 mb-6" style={{ borderColor:"rgba(239,68,68,0.3)", background:"rgba(239,68,68,0.05)" }}>
              <p className="text-sm" style={{ color:"#f87171" }}>⚠️ {error}</p>
            </div>
          )}

          {loading && !data && (
            <div className="space-y-4">
              {[...Array(3)].map((_,i) => (
                <div key={i} className="card p-6 animate-pulse" style={{ height: i===0?96:280 }}>
                  <div className="h-3 w-1/4 rounded" style={{ background:"#1a1a2e" }} />
                </div>
              ))}
            </div>
          )}

          {data && !loading && (
            <>
              {tab === "standings"     && <StandingsTab standings={data.standings} gw={data.currentGw} />}
              {tab === "rankings"      && <RankingsTab  rankings={data.rankings}   currentGw={data.currentGw} />}
              {tab === "captains"      && <CaptainsTab  captains={data.captains}   details={data.captainDetails} gw={data.currentGw} />}
              {tab === "ownership"     && <OwnershipTab ownership={data.ownership} />}
              {tab === "differentials" && <DifferentialsTab differentials={data.differentials} />}
              {tab === "transfers"     && <TransfersTab transfers={data.transfers} gw={data.currentGw} />}
              {tab === "forecast"      && <ForecastTab ticker={data.fixtureTicker} projections={data.projections} targets={data.targets} nextGw={data.currentGw+1} />}
            </>
          )}
        </div>
      </main>
    </div>
  )
}
