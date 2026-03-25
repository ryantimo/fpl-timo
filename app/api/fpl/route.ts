import { NextResponse } from "next/server"
import { getLeagueData } from "@/lib/fpl"

const LEAGUE_ID = parseInt(process.env.LEAGUE_ID ?? "1519916")

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const gw = searchParams.get("gw") ? parseInt(searchParams.get("gw")!) : undefined
  try {
    const data = await getLeagueData(LEAGUE_ID, gw)
    return NextResponse.json(data, {
      headers: { "Cache-Control": "s-maxage=300, stale-while-revalidate=60" },
    })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
