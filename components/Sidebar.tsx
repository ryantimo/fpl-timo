"use client"
import { BarChart2, TrendingUp, Star, Users, AlertTriangle, ArrowLeftRight, Zap } from "lucide-react"
import clsx from "clsx"

const NAV = [
  { id: "standings",    label: "Standings",    icon: BarChart2 },
  { id: "rankings",     label: "Rankings",     icon: TrendingUp },
  { id: "captains",     label: "Captains",     icon: Star },
  { id: "ownership",    label: "Ownership",    icon: Users },
  { id: "differentials",label: "Differentials",icon: AlertTriangle },
  { id: "transfers",    label: "Transfers",    icon: ArrowLeftRight },
  { id: "forecast",     label: "Forecast",     icon: Zap },
]

interface Props { active: string; onChange: (id: string) => void; leagueName: string; gw: number }

export default function Sidebar({ active, onChange, leagueName, gw }: Props) {
  return (
    <aside className="fixed left-0 top-0 h-full w-56 flex flex-col z-40"
      style={{ background: "#0a0a15", borderRight: "1px solid rgba(255,255,255,0.06)" }}>

      {/* Brand */}
      <div className="px-5 pt-6 pb-5">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xl">⚽</span>
          <span className="font-bold text-white text-base tracking-tight">FPL Timo</span>
        </div>
        <p className="text-xs leading-tight" style={{ color: "#4b4b6b" }}>{leagueName}</p>
        <div className="mt-2 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold"
          style={{ background: "rgba(0,255,133,0.1)", color: "#00ff85", border: "1px solid rgba(0,255,133,0.2)" }}>
          <span className="w-1.5 h-1.5 rounded-full bg-green-400 pulse-green" />
          GW {gw}
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 space-y-0.5">
        {NAV.map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => onChange(id)}
            className={clsx(
              "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150",
              active === id
                ? "text-white" : "hover:text-white"
            )}
            style={active === id
              ? { background: "rgba(0,255,133,0.1)", color: "#00ff85", border: "1px solid rgba(0,255,133,0.15)" }
              : { color: "#6b6b8b" }
            }>
            <Icon size={16} strokeWidth={active === id ? 2.2 : 1.8} />
            {label}
          </button>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-5 py-4 text-xs" style={{ color: "#2a2a42" }}>
        Data refreshes every 5 min
      </div>
    </aside>
  )
}
