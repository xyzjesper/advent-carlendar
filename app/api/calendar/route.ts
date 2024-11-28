import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

// Kalenderdaten-Pfad
const calendarPath = path.join(process.cwd(), "config", "calendar.json");

export async function GET() {
  try {
    const data = await fs.readFile(calendarPath, "utf8");
    const calendar = JSON.parse(data);
    return NextResponse.json(calendar);
  } catch (error) {
    console.error("Fehler beim Laden der Kalenderdaten:", error);
    return NextResponse.json(
      { message: "Fehler beim Laden der Kalenderdaten" },
      { status: 500 }
    );
  }
}
