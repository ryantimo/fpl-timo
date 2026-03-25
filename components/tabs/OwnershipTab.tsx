"use client"
import { useState } from "react"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts"
import type { OwnershipRow } from "@/lib/fpl"

const POSITIONS = ["GKP","DEF","MID","FWD"]
const POS_COLOR: Record<string,string> = { GKP:"#f59e0b", DEF:"#3b82f6", MID:"#00ff85", FWD:"#ef4444" }
const TOOLTIP_STYLE = { background:"#111120", border:"1px solid rgba(255,255,255,0.1)", borderRadius:8, color:"#e5e7eb", fontSize:12 }

export default function OwnershipTab({ ownership }: { ownership: OwnershipRow[] }) {
  const [pos, setPos] = useState<string[]>(["GKP","DEF","MID","FWD"])

  const filtered = ownership.filter(r => pos.includes(r.position))
  const top15    = filtered.slice(0, 15)

  return (
    <div className="fade-in space-y-6">
      {/* Filter */}
      <div className="flex items-center gap-2">
        <span className="text-xs font-medium" style={{ color:"#6b6b8b" }}>Position:</span>
        {POSITIONS.map(p => (
          <button key={p} onClick={() => setPos(prev => prev.includes(p) ? prev.filter(x=>x!==p) : [...prev,p])}
            className="px-3 py-1 rounded-full text-xs font-semibold transition-all"
            style={pos.includes(p)
              ? { background: POS_COLOR[p]+"33", color: POS_COLOR[p], border:`1px solid ${POS_COLOR[p]}44` }
              : { background:"#111120", color:"#4b4b6b", border:"1px solid rgba(255,255,255,0.06)" }
            }>{p}</button>
        ))}
      </div>

      {/* Bar chart */}
      <div className="card p-5">
        <h3 className="font-semibold text-white text-sm mb-4">Top 15 — % owned in league</h3>
        <ResponsiveContainer width="100%" height={360}>
          <BarChart data={[...top15].reverse()} layout="vertical" margin={{ left: 90, right: 50 }}>
            <XAxis type="number" stroke="#2a2a42" tick={{ fill:"#6b6b8b", fontSize:11 }} unit="%" />
            <YAxis type="category" dataKey="player" width={88} tick={{ fill:"#8b8b9e", fontSize:12 }} />
            <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v:any) => [`${v}%`, "League ownership"]} />
            <Bar dataKey="leaguePct" radius={[0,4,4,0]}>
              {top15.map((r, i) => <Cell key={i} fill={POS_COLOR[r.position] ?? "#1e1e3a"} fillOpacity={0.8} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Full table */}
      <div className="card overflow-hidden">
        <div className="px-5 py-3.5 border-b" style={{ borderColor:"rgba(255,255,255,0.06)" }}>
          <h3 className="font-semibold text-white text-sm">All owned players ({filtered.length})</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead><tr>
              <th>Player</th><th>Pos</th><th>Team</th><th>Price</th>
              <th>In league</th><th>% League</th><th>% Global</th>
              <th>Form</th><th>GW Pts</th><th>ep_next</th>
            </tr></thead>
            <tbody>
              {filtered.map(r => (
                <tr key={r.player}>
                  <td className="font-medium text-white">{r.player}</td>
                  <td>
                    <span className="badge" style={{ background: POS_COLOR[r.position]+"22", color: POS_COLOR[r.position] }}>
                      {r.position}
                    </span>
                  </td>
                  <td style={{ color:"#8b8b9e" }}>{r.team}</td>
                  <td style={{ color:"#6b6b8b" }}>{r.price}</td>
                  <td className="font-semibold text-white">{r.leagueCount}</td>
                  <td>
                    <div className="flex items-center gap-2">
                      <div className="h-1 rounded-full bg-green-900/40 w-16 overflow-hidden">
                        <div className="h-full rounded-full" style={{ width:`${Math.min(r.leaguePct,100)}%`, background:"#00ff85" }} />
                      </div>
                      <span className="text-white font-semibold">{r.leaguePct}%</span>
                    </div>
                  </td>
                  <td style={{ color:"#6b6b8b" }}>{r.globalPct}%</td>
                  <td style={{ color:"#8b8b9e" }}>{r.form}</td>
                  <td>
                    <span className="font-bold" style={{ color: r.gwPts >= 10 ? "#00ff85" : r.gwPts >= 6 ? "#fbbf24" : "#c5c5d8" }}>
                      {r.gwPts}
                    </span>
                  </td>
                  <td style={{ color:"#8b5cf6" }}>{r.epNext}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
