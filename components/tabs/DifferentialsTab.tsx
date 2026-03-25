"use client"
import { ScatterChart, Scatter, XAxis, YAxis, Tooltip, ResponsiveContainer, ZAxis } from "recharts"
import type { OwnershipRow } from "@/lib/fpl"

const TOOLTIP_STYLE = { background:"#111120", border:"1px solid rgba(255,255,255,0.1)", borderRadius:8, color:"#e5e7eb", fontSize:12 }
const POS_COLOR: Record<string,string> = { GKP:"#f59e0b", DEF:"#3b82f6", MID:"#00ff85", FWD:"#ef4444" }

function danger(pts: number) {
  if (pts >= 10) return { label:"🔴 High", bg:"rgba(239,68,68,0.1)", color:"#f87171" }
  if (pts >= 6)  return { label:"🟡 Medium", bg:"rgba(251,191,36,0.1)", color:"#fbbf24" }
  return { label:"🟢 Low", bg:"rgba(0,255,133,0.08)", color:"#4ade80" }
}

export default function DifferentialsTab({ differentials }: { differentials: OwnershipRow[] }) {
  const high   = differentials.filter(r => r.gwPts >= 10).length
  const medium = differentials.filter(r => r.gwPts >= 6 && r.gwPts < 10).length
  const sorted = [...differentials].sort((a,b) => b.gwPts - a.gwPts)

  const scatterData = sorted.map(r => ({ x: r.leaguePct, y: r.gwPts, z: r.gwPts + 1, name: r.player, pos: r.position }))

  return (
    <div className="fade-in space-y-6">
      <div className="grid grid-cols-3 gap-4">
        {[
          { label:"🔴 High danger", value: high, sub:"≥10 pts — gap-widening", color:"#f87171" },
          { label:"🟡 Medium danger", value: medium, sub:"6–9 pts", color:"#fbbf24" },
          { label:"Total differentials", value: differentials.length, sub:"owned by <50% of league", color:"#8b8b9e" },
        ].map(s => (
          <div key={s.label} className="card p-5">
            <div className="text-xs mb-2" style={{ color:"#6b6b8b" }}>{s.label}</div>
            <div className="text-3xl font-bold" style={{ color: s.color }}>{s.value}</div>
            <div className="text-xs mt-1" style={{ color:"#4b4b6b" }}>{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Scatter */}
      <div className="card p-5">
        <h3 className="font-semibold text-white text-sm mb-1">League ownership vs GW points</h3>
        <p className="text-xs mb-4" style={{ color:"#4b4b6b" }}>Top-right = dangerous differentials (high pts, low ownership)</p>
        <ResponsiveContainer width="100%" height={320}>
          <ScatterChart margin={{ top: 10, right: 20, bottom: 10, left: 10 }}>
            <XAxis type="number" dataKey="x" name="% League" stroke="#2a2a42" tick={{ fill:"#6b6b8b", fontSize:11 }} unit="%" label={{ value:"% owned in league", position:"bottom", fill:"#4b4b6b", fontSize:11 }} />
            <YAxis type="number" dataKey="y" name="GW Pts" stroke="#2a2a42" tick={{ fill:"#6b6b8b", fontSize:11 }} label={{ value:"GW pts", angle:-90, position:"insideLeft", fill:"#4b4b6b", fontSize:11 }} />
            <ZAxis type="number" dataKey="z" range={[30,180]} />
            <Tooltip contentStyle={TOOLTIP_STYLE} cursor={{ fill:"rgba(255,255,255,0.04)" }}
              content={({ payload }) => {
                if (!payload?.length) return null
                const d = payload[0].payload
                return <div style={TOOLTIP_STYLE} className="p-3 text-xs space-y-0.5">
                  <div className="font-bold text-white">{d.name}</div>
                  <div style={{ color:"#6b6b8b" }}>League owned: {d.x}%</div>
                  <div style={{ color:"#00ff85" }}>GW pts: {d.y}</div>
                </div>
              }} />
            <Scatter data={scatterData} fill="#00ff85">
              {scatterData.map((d, i) => (
                <Scatter key={i} data={[d]} fill={POS_COLOR[d.pos] ?? "#00ff85"} fillOpacity={0.7} />
              ))}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="px-5 py-3.5 border-b" style={{ borderColor:"rgba(255,255,255,0.06)" }}>
          <h3 className="font-semibold text-white text-sm">Differentials — sorted by GW damage</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead><tr><th>Danger</th><th>Player</th><th>Pos</th><th>Team</th><th>% League</th><th>% Global</th><th>Form</th><th>GW Pts</th><th>ep_next</th></tr></thead>
            <tbody>
              {sorted.map(r => {
                const d = danger(r.gwPts)
                return (
                  <tr key={r.player}>
                    <td><span className="badge" style={{ background:d.bg, color:d.color }}>{d.label}</span></td>
                    <td className="font-medium text-white">{r.player}</td>
                    <td><span className="badge" style={{ background:POS_COLOR[r.position]+"22", color:POS_COLOR[r.position] }}>{r.position}</span></td>
                    <td style={{ color:"#8b8b9e" }}>{r.team}</td>
                    <td className="font-semibold" style={{ color:"#fbbf24" }}>{r.leaguePct}%</td>
                    <td style={{ color:"#6b6b8b" }}>{r.globalPct}%</td>
                    <td style={{ color:"#8b8b9e" }}>{r.form}</td>
                    <td><span className="font-bold" style={{ color: r.gwPts >= 10 ? "#f87171" : r.gwPts >= 6 ? "#fbbf24" : "#6b6b8b" }}>{r.gwPts}</span></td>
                    <td style={{ color:"#8b5cf6" }}>{r.epNext}</td>
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
