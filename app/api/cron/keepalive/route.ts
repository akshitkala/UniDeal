import { NextResponse } from "next/server";

import { createSupabaseServerClient } from "@/lib/supabase/server";

function getCronSecret(): string {
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret) {
    throw new Error("Missing required environment variable: CRON_SECRET");
  }

  return cronSecret;
}

export async function GET(request: Request) {
  const authorization = request.headers.get("authorization");

  if (authorization !== `Bearer ${getCronSecret()}`) {
    return NextResponse.json(
      { error: { message: "Unauthorized" } },
      { status: 401 },
    );
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("categories").select("id").limit(1);

  if (error) {
    return NextResponse.json(
      {
        error: {
          message: "Couldn't run the keepalive check.",
          code: error.code,
        },
      },
      { status: 500 },
    );
  }

  return NextResponse.json(
    { data: { ok: true } },
    { status: 200 },
  );
}

