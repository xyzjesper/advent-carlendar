import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

// Pfad zur account.json
const accountsPath = path.join(process.cwd(), "config", "account.json");

export async function POST(req: Request) {
  try {
    const { code } = await req.json(); // Code aus der Anfrage auslesen

    if (!code) {
      return NextResponse.json(
        { success: false, message: "Kein Code angegeben." },
        { status: 400 }
      );
    }

    // Lese die account.json-Datei
    const accountsData = await fs.readFile(accountsPath, "utf8");
    const accounts = JSON.parse(accountsData);

    // Suche nach dem entsprechenden Account
    const account = accounts.find((entry: any) => entry.code === code);

    if (account) {
      // Erfolgreiche Validierung
      return NextResponse.json({
        success: true,
        message: "Code ist gültig!",
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
    console.error("Fehler bei der Code-Validierung:", error);
    return NextResponse.json(
      { success: false, message: "Ein Fehler ist aufgetreten." },
      { status: 500 }
    );
  }
}
