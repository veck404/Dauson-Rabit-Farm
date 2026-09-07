import { NextResponse } from "next/server";
import {
  mergeLegacyDatabase,
  mutateFarmDatabase,
  readFarmDatabase,
} from "../../../lib/farm-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    return NextResponse.json(await readFarmDatabase(), {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    console.error("Unable to read farm database", error);
    return NextResponse.json({ error: "Unable to read farm records" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const database =
      body.action === "merge-legacy"
        ? await mergeLegacyDatabase(body.database)
        : await mutateFarmDatabase({
            collection: body.collection,
            action: body.action,
            record: body.record,
            id: body.id,
          });
    return NextResponse.json(database, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Invalid request";
    const status = message.startsWith("Invalid") || message.includes("required") ? 400 : 500;
    if (status === 500) console.error("Unable to update farm database", error);
    return NextResponse.json({ error: message }, { status });
  }
}
