"use client"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts"
import type { FixtureTeamRow, ProjectionRow, TargetRow } from "@/lib/fpl"

const TOOLTIP_STYLE = { background:"#111120", border:"1px solid rgba(255,255,255,0.1)", borderRadius:8, color:"#e5e7eb", fontSize:12 }
const POS_COLOR: Record<string,string> = { GKP:"#f59e0b", DEF:"#3b82f6", MID:"#00ff85", FWD:"#ef4444" }

const FDR_BG: Record<number,string>   = { 1:"#257d5a", 2:"#01fc7a", 3:"#c5c5d8", 4:"#ff1751", 5:"#80072d" }
const FDR_TEXT: Record<number,string> = { 1:"white",   2:"black",   3:"black",   4:"white",   5:"white" }

export default function ForecastTab({ ticker, projections, targets, nextGw }: {
  ticker: FixtureTeamRow[]; projections: ProjectionRow[]; targets: TargetRow[]; nextGw: number
}) {
  const gwCols = ticker[0] ? Object.keys(ticker[0].fixtures) : []
  const best  = projections[0]
  const worst = projections[projections.length - 1]

  return (
    <div className="fade-in space-y-8">

      {/* ── Fixture Ticker ── */}
      <section>
        <h3 className="font-semibold text-white text-sm mb-1">📅 Fixture Ticker — next {gwCols.length} GWs</h3>
        <p className="text-xs mb-4" style={{ color:"#4b4b6b" }}>
          FDR 1–2 = easy (green) · 3 = medium (grey) · 4–5 = hard (red) · DGW flagged
        </p>
        <div className="card overflow-x-auto">
          <table className="data-table" style={{ minWidth: 600 }}>
            <thead><tr>
              <th>Team</th>
              {gwCols.map(c => <th key={c} style={{ textAlign:"center" }}>{c}</th>)}
            </tr></thead>
            <tbody>
              {ticker.map(row => (
                <tr key={row.team}>
                  <td className="font-medium text-white whitespace-nowrap">{row.team}</td>
                  {gwCols.map(col => {
                    const cell = row.fixtures[col]
                    const fdr  = cell.fdr
                    return (
                      <td key={col} style={{ padding:0, textAlign:"center" }}>
                        <div style={{
                          padding:"8px 10px",
                          background: fdr ? FDR_BG[fdr] : "transparent",
                          color: fdr ? FDR_TEXT[fdr] : "#2a2a42",
                          fontSize: 11, fontWeight: 600,
                          whiteSpace:"nowrap",
                        }}>{cell.label}</div>
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ── Squad projections ── */}
      <section>
        <h3 className="font-semibold text-white text-sm mb-1">👥 Squad Projections — next 3 GWs</h3>
        <p className="text-xs mb-4" style={{ color:"#4b4b6b" }}>
          GW{nextGw} uses FPL ep_next. GW{nextGw+1}–{nextGw+2} use form × fixture difficulty. Captain ×2 applied. * = ep_next.
        </p>
        <div className="grid grid-cols-2 gap-4 mb-5">
          <div className="card p-5">
            <div className="text-xs mb-1" style={{ color:"#6b6b8b" }}>📈 Best 3GW outlook</div>
            <div className="font-bold text-white text-lg">{best?.manager}</div>
            <div className="text-2xl font-bold mt-1" style={{ color:"#00ff85" }}>{best?.total3} proj pts</div>
          </div>
          <div className="card p-5">
            <div className="text-xs mb-1" style={{ color:"#6b6b8b" }}>📉 Toughest run</div>
            <div className="font-bold text-white text-lg">{worst?.manager}</div>
            <div className="text-2xl font-bold mt-1" style={{ color:"#f87171" }}>{worst?.total3} proj pts</div>
          </div>
        </div>

        <div className="card p-5 mb-5">
          <ResponsiveContainer width="100%" height={Math.max(240, projections.length * 28)}>
            <BarChart data={[...projections].reverse()} layout="vertical" margin={{ left: 100, right: 50 }}>
              <XAxis type="number" stroke="#2a2a42" tick={{ fill:"#6b6b8b", fontSize:11 }} />
              <YAxis type="category" dataKey="manager" width={95} tick={{ fill:"#8b8b9e", fontSize:12 }} />
              <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v:any) => [`${v} pts`, "3GW projection"]} />
              <Bar dataKey="total3" radius={[0,4,4,0]}>
                {projections.map((_, i) => (
                  <Cell key={i} fill={i < 3 ? "#00ff85" : i > projections.length - 4 ? "#ef4444" : "#1e1e3a"} fillOpacity={0.85} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card overflow-hidden">
          <table className="data-table">
            <thead><tr>
              <th>#</th><th>Manager</th>
              <th>GW{nextGw}*</th><th>GW{nextGw+1}</th><th>GW{nextGw+2}</th><th>3GW Total</th>
            </tr></thead>
            <tbody>
              {projections.map((r, i) => (
                <tr key={r.manager}>
                  <td className="font-bold text-white">{i+1}</td>
                  <td className="font-medium text-white">{r.manager}</td>
                  <td style={{ color:"#8b5cf6" }}>{r.gw1}</td>
                  <td style={{ color:"#8b8b9e" }}>{r.gw2}</td>
                  <td style={{ color:"#8b8b9e" }}>{r.gw3}</td>
                  <td className="font-bold" style={{ color: i === 0 ? "#00ff85" : i === projections.length-1 ? "#f87171" : "#c5c5d8" }}>{r.total3}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ── Transfer targets ── */}
      <section>
        <h3 className="font-semibold text-white text-sm mb-1">🎯 Transfer Targets — high ep_next, low league ownership</h3>
        <p className="text-xs mb-4" style={{ color:"#4b4b6b" }}>
          Players with strong expected next-GW points owned by fewer than 30% of your league.
        </p>
        <div className="card overflow-x-auto">
          <table className="data-table">
            <thead><tr><th>Player</th><th>Pos</th><th>Team</th><th>Price</th><th>ep_next</th><th>Form</th><th>% League</th><th>% Global</th><th>Next 3 FDRs</th></tr></thead>
            <tbody>
              {targets.map(r => (
                <tr key={r.player}>
                  <td className="font-medium text-white">{r.player}</td>
                  <td><span className="badge" style={{ background:POS_COLOR[r.position]+"22", color:POS_COLOR[r.position] }}>{r.position}</span></td>
                  <td style={{ color:"#8b8b9e" }}>{r.team}</td>
                  <td style={{ color:"#6b6b8b" }}>{r.price}</td>
                  <td className="font-bold" style={{ color:"#8b5cf6" }}>{r.epNext}</td>
                  <td style={{ color:"#8b8b9e" }}>{r.form}</td>
                  <td style={{ color:"#fbbf24" }}>{r.leaguePct}%</td>
                  <td style={{ color:"#6b6b8b" }}>{r.globalPct}%</td>
                  <td className="font-mono text-xs" style={{ color:"#6b6b8b" }}>{r.fdrs}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
