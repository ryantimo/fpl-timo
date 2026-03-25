"use client"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts"
import type { Standing } from "@/lib/fpl"

const TOOLTIP_STYLE = { background:"#111120", border:"1px solid rgba(255,255,255,0.1)", borderRadius:8, color:"#e5e7eb", fontSize:13 }

export default function StandingsTab({ standings, gw }: { standings: Standing[]; gw: number }) {
  const top3 = standings.slice(0, 3)
  const medals = ["🥇","🥈","🥉"]
  const colors = ["#00ff85","#a78bfa","#60a5fa"]

  return (
    <div className="fade-in space-y-6">
      {/* Top 3 */}
      <div className="grid grid-cols-3 gap-4">
        {top3.map((s, i) => (
          <div key={s.manager} className="card p-5" style={i === 0 ? { borderColor: "rgba(0,255,133,0.25)" } : {}}>
            <div className="text-2xl mb-2">{medals[i]}</div>
            <div className="font-semibold text-white truncate">{s.manager}</div>
            <div className="text-xs mb-3" style={{ color: "#6b6b8b" }}>{s.teamName}</div>
            <div className="text-2xl font-bold" style={{ color: colors[i] }}>{s.total}</div>
            <div className="text-xs mt-1" style={{ color: "#6b6b8b" }}>
              GW{gw}: <span className="text-white font-medium">{s.gwPts ?? "–"} pts</span>
            </div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="px-5 py-3.5 border-b" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
          <h3 className="font-semibold text-white text-sm">Full Standings — GW{gw}</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead><tr>
              <th>#</th><th>Manager</th><th>Team</th>
              <th>GW Pts</th><th>Transfer Hit</th><th>Chip</th>
              <th>Total</th><th>Gap</th>
            </tr></thead>
            <tbody>
              {standings.map(s => (
                <tr key={s.manager}>
                  <td className="font-bold text-white">{s.rank}</td>
                  <td className="font-medium text-white">{s.manager}</td>
                  <td style={{ color: "#8b8b9e" }}>{s.teamName}</td>
                  <td>
                    <span className="font-semibold text-white">{s.gwPts ?? "–"}</span>
                  </td>
                  <td>
                    {s.transferCost > 0
                      ? <span className="badge" style={{ background:"rgba(239,68,68,0.15)", color:"#f87171" }}>-{s.transferCost}</span>
                      : <span style={{ color:"#4b4b6b" }}>–</span>
                    }
                  </td>
                  <td>
                    {s.chip !== "–"
                      ? <span className="badge" style={{ background:"rgba(139,92,246,0.15)", color:"#a78bfa" }}>{s.chip}</span>
                      : <span style={{ color:"#4b4b6b" }}>–</span>
                    }
                  </td>
                  <td className="font-bold text-white">{s.total}</td>
                  <td style={{ color: s.gap === "–" ? "#00ff85" : "#6b6b8b" }}>{s.gap}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bar chart */}
      <div className="card p-5">
        <h3 className="font-semibold text-white text-sm mb-4">GW{gw} Points</h3>
        <ResponsiveContainer width="100%" height={Math.max(280, standings.length * 28)}>
          <BarChart data={[...standings].sort((a,b)=>(a.gwPts??0)-(b.gwPts??0))} layout="vertical" margin={{ left: 90, right: 30 }}>
            <XAxis type="number" stroke="#2a2a42" tick={{ fill:"#6b6b8b", fontSize:11 }} />
            <YAxis type="category" dataKey="manager" width={88} tick={{ fill:"#8b8b9e", fontSize:12 }} />
            <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v:any) => [`${v} pts`, "GW Score"]} />
            <Bar dataKey="gwPts" radius={[0,4,4,0]}>
              {standings.map((_, i) => (
                <Cell key={i} fill={i >= standings.length - 3 ? "#00ff85" : "#1e1e3a"} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
