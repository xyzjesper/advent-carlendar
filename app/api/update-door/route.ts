import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

// Kalenderdaten-Pfad
const calendarPath = path.join(process.cwd(), "config", "calendar.json");

export async function POST(req: Request) {
  try {
    const { id, isOpen } = await req.json();

    const data = await fs.readFile(calendarPath, "utf8");
    const calendar = JSON.parse(data);

    const day = calendar.find((item: any) => item.id === id);

    if (!day) {
      return NextResponse.json(
        { message: "Tag nicht gefunden" },
        { status: 404 }
      );
    }

    day.isOpen = isOpen;

    await fs.writeFile(calendarPath, JSON.stringify(calendar, null, 2), "utf8");

    return NextResponse.json({
      message: "Daten erfolgreich aktualisiert",
      updatedDay: day,
    });
  } catch (error) {
    console.error("Fehler beim Aktualisieren der Tür:", error);
    return NextResponse.json(
      { message: "Fehler beim Aktualisieren der Tür" },
      { status: 500 }
    );
  }
}
