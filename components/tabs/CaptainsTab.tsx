"use client"
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts"
import type { CaptainRow, CaptainDetail } from "@/lib/fpl"

const COLORS = ["#00ff85","#7c3aed","#3b82f6","#f59e0b","#ef4444","#06b6d4","#84cc16","#f97316"]
const TOOLTIP_STYLE = { background:"#111120", border:"1px solid rgba(255,255,255,0.1)", borderRadius:8, color:"#e5e7eb", fontSize:12 }

export default function CaptainsTab({ captains, details, gw }: { captains: CaptainRow[]; details: CaptainDetail[]; gw: number }) {
  const top = captains[0]
  const unique = captains.filter(c => c.count === 1).length

  return (
    <div className="fade-in space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Most captained", value: top?.player ?? "–", sub: `${top?.pct ?? 0}% of league`, color: "#00ff85" },
          { label: "GW pts (×2 for captains)", value: `${top?.gwPts ?? 0} pts → ${top?.captainPts ?? 0}`, sub: `+${top?.captainPts ?? 0} for captains`, color: "#7c3aed" },
          { label: "Unique choices", value: unique, sub: `across ${details.length} managers`, color: "#3b82f6" },
        ].map(s => (
          <div key={s.label} className="card p-5">
            <div className="text-xs mb-2" style={{ color:"#6b6b8b" }}>{s.label}</div>
            <div className="text-xl font-bold" style={{ color: s.color }}>{s.value}</div>
            <div className="text-xs mt-1" style={{ color:"#4b4b6b" }}>{s.sub}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Donut */}
        <div className="card p-5">
          <h3 className="font-semibold text-white text-sm mb-4">Captain distribution</h3>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={captains} dataKey="count" nameKey="player" cx="50%" cy="50%"
                innerRadius={70} outerRadius={110} paddingAngle={2}
                label={({ player, pct }) => `${player} ${pct}%`} labelLine={false}>
                {captains.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v:any) => [`${v} managers`, "Captained by"]} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Summary table */}
        <div className="card overflow-hidden">
          <div className="px-5 py-3.5 border-b" style={{ borderColor:"rgba(255,255,255,0.06)" }}>
            <h3 className="font-semibold text-white text-sm">Captain choices — GW{gw}</h3>
          </div>
          <table className="data-table">
            <thead><tr><th>Player</th><th>Team</th><th>Count</th><th>%</th><th>GW Pts</th><th>Cap Pts</th></tr></thead>
            <tbody>
              {captains.map((c, i) => (
                <tr key={c.player}>
                  <td className="font-medium text-white">
                    <span className="inline-block w-2 h-2 rounded-full mr-2" style={{ background: COLORS[i%COLORS.length] }} />
                    {c.player}
                  </td>
                  <td style={{ color:"#8b8b9e" }}>{c.team}</td>
                  <td className="font-semibold text-white">{c.count}</td>
                  <td>
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 rounded-full" style={{ width: `${c.pct}%`, maxWidth:60, background: COLORS[i%COLORS.length], opacity:0.7 }} />
                      <span style={{ color:"#8b8b9e" }}>{c.pct}%</span>
                    </div>
                  </td>
                  <td className="font-semibold text-white">{c.gwPts}</td>
                  <td>
                    <span className="font-bold" style={{ color: c.captainPts >= 12 ? "#00ff85" : c.captainPts >= 6 ? "#fbbf24" : "#6b6b8b" }}>
                      {c.captainPts}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Per-manager detail */}
      <div className="card overflow-hidden">
        <div className="px-5 py-3.5 border-b" style={{ borderColor:"rgba(255,255,255,0.06)" }}>
          <h3 className="font-semibold text-white text-sm">Per-manager captain breakdown</h3>
        </div>
        <table className="data-table">
          <thead><tr><th>Manager</th><th>Team</th><th>Captain</th><th>GW Pts</th><th>Captain Pts</th></tr></thead>
          <tbody>
            {details.map(d => (
              <tr key={d.manager}>
                <td className="font-medium text-white">{d.manager}</td>
                <td style={{ color:"#8b8b9e" }}>{d.teamName}</td>
                <td className="font-semibold text-white">{d.captain}</td>
                <td>{d.gwPts}</td>
                <td>
                  <span className="font-bold" style={{ color: d.captainPts >= 12 ? "#00ff85" : d.captainPts >= 6 ? "#fbbf24" : "#6b6b8b" }}>
                    {d.captainPts}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
