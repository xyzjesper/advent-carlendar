import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

// Pfad zur account.json
const accountsPath = path.join(process.cwd(), "config", "account.json");

export async function POST(req: Request) {
  try {
    const { points, code } = await req.json(); // Punkte und Code aus der Anfrage auslesen

    if (!points || typeof points !== "number") {
      return NextResponse.json(
        { success: false, message: "Keine gültige Punktanzahl angegeben." },
        { status: 400 }
      );
    }

    // Lese die account.json-Datei
    const accountsData = await fs.readFile(accountsPath, "utf8");
    const accounts = JSON.parse(accountsData);

    // Suche nach dem entsprechenden Account
    const account = accounts.find((entry: any) => entry.code === code);

    if (account) {
      // Erhöhe die Punkte um die angegebene Anzahl
      account.points += points;

      // Schreibe die aktualisierten Daten zurück in die Datei
      await fs.writeFile(
        accountsPath,
        JSON.stringify(accounts, null, 2),
        "utf8"
      );

      return NextResponse.json({
        success: true,
        message: `Punkte erfolgreich um ${points} erhöht!`,
        account: {
          name: account.name,
          points: account.points,
        },
      });
    } else {
      // Ungültiger Code
      return NextResponse.json(
        { success: false, message: "Ungültiger Code." },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error("Fehler beim Aktualisieren der Punkte:", error);
    return NextResponse.json(
      { success: false, message: "Ein Fehler ist aufgetreten." },
      { status: 500 }
    );
  }
}
