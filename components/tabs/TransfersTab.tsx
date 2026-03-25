"use client"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, ReferenceLine } from "recharts"
import type { TransferRow } from "@/lib/fpl"

const TOOLTIP_STYLE = { background:"#111120", border:"1px solid rgba(255,255,255,0.1)", borderRadius:8, color:"#e5e7eb", fontSize:12 }

export default function TransfersTab({ transfers, gw }: { transfers: TransferRow[]; gw: number }) {
  const good    = transfers.filter(t => t.result === "good").length
  const bad     = transfers.filter(t => t.result === "bad").length
  const neutral = transfers.filter(t => t.result === "neutral").length

  if (!transfers.length) return (
    <div className="fade-in flex items-center justify-center h-40 card">
      <p style={{ color:"#4b4b6b" }}>No transfers this gameweek.</p>
    </div>
  )

  return (
    <div className="fade-in space-y-6">
      <div className="grid grid-cols-4 gap-4">
        {[
          { label:"Total transfers", value: transfers.length, color:"#8b8b9e" },
          { label:"✅ Good",          value: good,             color:"#00ff85" },
          { label:"❌ Bad",           value: bad,              color:"#f87171" },
          { label:"➖ Neutral",       value: neutral,          color:"#6b6b8b" },
        ].map(s => (
          <div key={s.label} className="card p-5">
            <div className="text-xs mb-2" style={{ color:"#6b6b8b" }}>{s.label}</div>
            <div className="text-3xl font-bold" style={{ color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Net pts bar chart */}
      <div className="card p-5">
        <h3 className="font-semibold text-white text-sm mb-4">Transfer net points (IN − OUT)</h3>
        <ResponsiveContainer width="100%" height={Math.max(200, transfers.length * 36)}>
          <BarChart data={transfers} layout="vertical" margin={{ left: 100, right: 40 }}>
            <XAxis type="number" stroke="#2a2a42" tick={{ fill:"#6b6b8b", fontSize:11 }} />
            <YAxis type="category" dataKey="manager" width={95} tick={{ fill:"#8b8b9e", fontSize:12 }} />
            <ReferenceLine x={0} stroke="rgba(255,255,255,0.15)" />
            <Tooltip contentStyle={TOOLTIP_STYLE}
              formatter={(v:any) => [`${v > 0 ? "+" : ""}${v} pts`, "Net"]}
              labelFormatter={(_, payload) => {
                const d = payload?.[0]?.payload
                return d ? `${d.out} → ${d.in}` : ""
              }} />
            <Bar dataKey="net" radius={[0,4,4,0]}>
              {transfers.map((t, i) => (
                <Cell key={i} fill={t.net > 0 ? "#00ff85" : t.net < 0 ? "#ef4444" : "#2a2a42"} fillOpacity={0.85} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Full table */}
      <div className="card overflow-hidden">
        <div className="px-5 py-3.5 border-b" style={{ borderColor:"rgba(255,255,255,0.06)" }}>
          <h3 className="font-semibold text-white text-sm">All GW{gw} transfers</h3>
        </div>
        <table className="data-table">
          <thead><tr><th>Manager</th><th>OUT ❌</th><th>OUT pts</th><th>IN ✅</th><th>IN pts</th><th>Net</th><th>Result</th></tr></thead>
          <tbody>
            {transfers.map((t, i) => (
              <tr key={i}>
                <td className="font-medium text-white">{t.manager}</td>
                <td style={{ color:"#f87171" }}>{t.out}</td>
                <td style={{ color:"#6b6b8b" }}>{t.outPts}</td>
                <td style={{ color:"#00ff85" }}>{t.in}</td>
                <td style={{ color:"#6b6b8b" }}>{t.inPts}</td>
                <td>
                  <span className="font-bold" style={{ color: t.net > 0 ? "#00ff85" : t.net < 0 ? "#f87171" : "#6b6b8b" }}>
                    {t.net > 0 ? "+" : ""}{t.net}
                  </span>
                </td>
                <td>
                  <span className="badge" style={
                    t.result === "good"    ? { background:"rgba(0,255,133,0.1)",  color:"#00ff85" } :
                    t.result === "bad"     ? { background:"rgba(239,68,68,0.1)",  color:"#f87171" } :
                                            { background:"rgba(107,107,139,0.1)", color:"#8b8b9e" }
                  }>{t.result === "good" ? "✅ Good" : t.result === "bad" ? "❌ Bad" : "➖ Neutral"}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
