import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data, error } = await supabase
      .from("favorites")
      .select("tool_name")
      .eq("user_id", user.id);

    if (error) {
      return NextResponse.json(
        { error: "Failed to fetch favorites" },
        { status: 500 },
      );
    }

    return NextResponse.json({
      favorites: data?.map((f) => f.tool_name) || [],
    });
  } catch (error) {
    console.error("Error fetching favorites:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { toolName, action } = await request.json();

    if (action === "add") {
      const { error } = await supabase
        .from("favorites")
        .insert([{ tool_name: toolName, user_id: user.id }]);

      if (error && !error.message.includes("duplicate")) {
        return NextResponse.json(
          { error: "Failed to add favorite" },
          { status: 500 },
        );
      }
    } else if (action === "remove") {
      const { error } = await supabase
        .from("favorites")
        .delete()
        .eq("tool_name", toolName)
        .eq("user_id", user.id);

      if (error) {
        return NextResponse.json(
          { error: "Failed to remove favorite" },
          { status: 500 },
        );
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error managing favorite:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

