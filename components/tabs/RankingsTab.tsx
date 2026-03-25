"use client"
import { LineChart, Line, XAxis, YAxis, Tooltip, ReferenceLine, ResponsiveContainer, Legend } from "recharts"
import type { RankPoint } from "@/lib/fpl"

const COLORS = [
  "#00ff85","#7c3aed","#3b82f6","#f59e0b","#ef4444",
  "#06b6d4","#84cc16","#f97316","#ec4899","#14b8a6",
  "#8b5cf6","#22c55e","#eab308","#0ea5e9","#d946ef",
  "#64748b","#a855f7","#10b981","#f43f5e","#6366f1",
]

const TOOLTIP_STYLE = { background:"#111120", border:"1px solid rgba(255,255,255,0.1)", borderRadius:8, color:"#e5e7eb", fontSize:12 }

export default function RankingsTab({ rankings, currentGw }: { rankings: RankPoint[]; currentGw: number }) {
  const managers = [...new Set(rankings.map(r => r.manager))]
  const rankMap  = new Map(rankings.map(r => [r.manager, r.rank]))

  // Pivot to wide format for Recharts
  const allGws = [...new Set(rankings.map(r => r.gw))].sort((a,b)=>a-b)
  const chartData = allGws.map(gw => {
    const row: Record<string,any> = { gw, isProjected: gw > currentGw }
    for (const r of rankings.filter(x => x.gw === gw)) row[r.manager] = r.total
    return row
  })

  // Sorted by rank
  const sorted = [...managers].sort((a,b) => (rankMap.get(a)??99) - (rankMap.get(b)??99))

  // Top 9 cut-off value at current GW
  const rank9Manager = sorted[8]
  const rank9Point   = rankings.find(r => r.manager === rank9Manager && r.gw === currentGw)
  const rank9Total   = rank9Point?.total

  // Projected standings
  const projFinal = sorted.map(m => {
    const pts = rankings.filter(r => r.manager === m && r.projected).sort((a,b)=>b.gw-a.gw)[0]?.total ?? 0
    return { manager: m, projected: pts, currentRank: rankMap.get(m)! }
  }).sort((a,b) => b.projected - a.projected).map((r,i) => ({ ...r, projRank: i+1 }))

  return (
    <div className="fade-in space-y-6">
      <div className="card p-5">
        <div className="flex items-center justify-between mb-1">
          <h3 className="font-semibold text-white text-sm">Points Trajectory</h3>
          <div className="flex items-center gap-4 text-xs" style={{ color:"#6b6b8b" }}>
            <span>── Actual</span>
            <span style={{ letterSpacing:3 }}>··· Projected</span>
            <span style={{ color:"gold" }}>── Top 9 cut-off</span>
          </div>
        </div>
        <p className="text-xs mb-5" style={{ color:"#4b4b6b" }}>
          Top 9 shown with thicker lines. Dotted = projected via ep_next + form × FDR.
        </p>
        <ResponsiveContainer width="100%" height={520}>
          <LineChart data={chartData} margin={{ right: 120, top: 10, bottom: 10 }}>
            <XAxis dataKey="gw" stroke="#2a2a42" tick={{ fill:"#6b6b8b", fontSize:11 }}
              tickFormatter={v => `GW${v}`} />
            <YAxis stroke="#2a2a42" tick={{ fill:"#6b6b8b", fontSize:11 }} width={50} />
            <Tooltip contentStyle={TOOLTIP_STYLE} labelFormatter={v => `GW ${v}`}
              formatter={(v:any, name:string) => [`${v} pts`, name]} />
            <ReferenceLine x={currentGw} stroke="rgba(255,255,255,0.15)" strokeDasharray="4 4"
              label={{ value:"Now", position:"top", fill:"rgba(255,255,255,0.3)", fontSize:11 }} />
            {rank9Total && (
              <ReferenceLine y={rank9Total} stroke="rgba(255,215,0,0.4)" strokeDasharray="3 3"
                label={{ value:"Top 9", position:"right", fill:"gold", fontSize:11 }} />
            )}
            {sorted.map((m, i) => {
              const rank = rankMap.get(m)!
              const isTop9 = rank <= 9
              const color  = COLORS[i % COLORS.length]
              return (
                <Line key={m} type="monotone" dataKey={m}
                  stroke={color} strokeWidth={isTop9 ? 2.5 : 1.2}
                  strokeOpacity={isTop9 ? 1 : 0.55}
                  dot={false} activeDot={{ r: 4 }}
                  strokeDasharray={chartData.some(d => d[m] && d.isProjected) ? undefined : undefined}
                  name={`${isTop9?"⭐ ":""}#${rank} ${m}`}
                  connectNulls
                />
              )
            })}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Projected standings */}
      <div className="card overflow-hidden">
        <div className="px-5 py-3.5 border-b" style={{ borderColor:"rgba(255,255,255,0.06)" }}>
          <h3 className="font-semibold text-white text-sm">Projected Standings (+5 GWs)</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead><tr><th>Proj #</th><th>Manager</th><th>Proj Total</th><th>Current #</th><th>Movement</th></tr></thead>
            <tbody>
              {projFinal.map(r => {
                const moved = r.currentRank - r.projRank
                return (
                  <tr key={r.manager}>
                    <td className="font-bold text-white">{r.projRank}</td>
                    <td className="font-medium text-white">
                      {r.projRank <= 9 && <span className="mr-1">⭐</span>}{r.manager}
                    </td>
                    <td className="font-bold" style={{ color:"#00ff85" }}>{r.projected}</td>
                    <td style={{ color:"#6b6b8b" }}>{r.currentRank}</td>
                    <td>
                      {moved > 0
                        ? <span className="badge" style={{ background:"rgba(0,255,133,0.1)", color:"#00ff85" }}>▲ {moved}</span>
                        : moved < 0
                        ? <span className="badge" style={{ background:"rgba(239,68,68,0.1)", color:"#f87171" }}>▼ {Math.abs(moved)}</span>
                        : <span style={{ color:"#4b4b6b" }}>–</span>
                      }
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
