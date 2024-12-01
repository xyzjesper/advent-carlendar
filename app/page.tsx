"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation"; // Für die Navigation
import { toast } from "react-toastify";

interface CalendarDay {
  id: number;
  date: string;
  isOpen: boolean;
  content: string;
}

interface Account {
  name: string;
  points: number;
}

export default function Home() {
  const [account, setAccount] = useState<Account>();
  const [calendar, setCalendar] = useState<CalendarDay[]>([]);
  const [today, setToday] = useState<string>("");
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [inputCode, setInputCode] = useState<string>("");
  const router = useRouter();

  useEffect(() => {
    // Prüfen, ob ein Cookie vorhanden ist
    const userCode = document.cookie
      .split("; ")
      .find((row) => row.startsWith("userCode="))
      ?.split("=")[1];

    if (userCode) {
      setIsLoggedIn(true);
    } else {
      setIsLoggedIn(false);
    }

    async function fetchData() {
      const currentDate = new Date().toISOString().split("T")[0];
      setToday(currentDate);

      const fetchaccount = await fetch(`/api/account`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: document.cookie
            .split("; ")
            .find((row) => row.startsWith("userCode="))
            ?.split("=")[1],
        }),
      });
      const data = await fetchaccount.json();

      setAccount({
        name: data.account.name,
        points: data.account.points,
      });

      const res = await fetch(`/api/calendar`);
      if (res.ok) {
        const data = await res.json();
        setCalendar(data);
      } else {
        console.error("Fehler beim Laden der Kalenderdaten");
      }
    }
    fetchData();
  }, []);

  const handleLogin = async () => {
    const res = await fetch(`/api/validate-code`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: inputCode }),
    });

    if (res.ok) {
      document.cookie = `userCode=${inputCode}; path=/; max-age=${
        7 * 24 * 60 * 60
      }`;
      setIsLoggedIn(true);
    } else {
      toast("Dieser access code ist nicht korrekt");
    }
  };

  const handleOpenDoor = async (id: number) => {
    const day = calendar.find((entry) => entry.id === id);
    if (today == day.date || day.isOpen) {
      await fetch("/api/update-door", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, isOpen: true }),
      })
        .then((res) => res.json())
        .then((updatedDoor) => {
          setCalendar((prev) =>
            prev.map((entry) =>
              entry.id == updatedDoor.id ? { ...entry, isOpen: true } : entry
            )
          );
          router.push(`/${id}`);
        });
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-500 to-red-600 text-white p-6 flex items-center justify-center">
        <div className="bg-white text-black p-8 rounded-lg shadow-lg">
          <h1 className="text-2xl font-bold mb-4">🎄 Login 🎅</h1>
          <p className="mb-4">Bitte gib deinen persönlichen Code ein:</p>
          <input
            type="text"
            value={inputCode}
            onChange={(e) => setInputCode(e.target.value)}
            className="w-full px-4 py-2 mb-4 border rounded-lg"
            placeholder="Code eingeben"
          />
          <button
            onClick={handleLogin}
            className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-2 rounded-lg"
          >
            Einloggen
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-500 to-red-600 text-white p-6">
      {/* Header */}
      <header className="text-center mb-10">
        <h1 className="text-5xl font-extrabold mb-4 drop-shadow-lg">
          🎄 Adventskalender 🎅
        </h1>
        <p className="text-lg font-medium">
          Öffne jeden Tag eine Tür bis Weihnachten!
        </p>
      </header>

      <section className="text-center mb-10 bg-white bg-opacity-10 p-4 rounded-lg shadow-md max-w-sm mx-auto">
        <h2 className="text-2xl font-semibold">Dein Fortschritt</h2>
        <p className="text-lg mt-2">
          <span className="font-bold">Name:</span>{" "}
          {account?.name || "Unbekannt"}
        </p>
        <p className="text-lg mt-1">
          <span className="font-bold">Punkte:</span> {account?.points || 0}
        </p>
      </section>

      <main className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6 max-w-6xl mx-auto">
        {calendar.map((day) => (
          <div
            key={day.id}
            onClick={() => handleOpenDoor(day.id)}
            className={`relative w-full h-32 md:h-40 rounded-lg shadow-lg cursor-pointer ${
              day.isOpen
                ? "bg-green-400 text-green-900"
                : today >= day.date
                ? "bg-red-700 text-white hover:bg-red-600"
                : "bg-gray-400 text-gray-800 cursor-not-allowed"
            } transition-all duration-300 transform ${
              day.isOpen ? "scale-105" : "hover:scale-110"
            }`}
          >
            <div
              className={`absolute inset-0 flex items-center justify-center text-xl font-bold ${
                day.isOpen ? "opacity-0" : "opacity-100"
              } transition-opacity duration-300`}
            >
              {day.id}
            </div>

            {day.isOpen && (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-2">
                <span className="text-lg font-semibold">
                  Türchen {day.id} ist offen!
                </span>
                <span className="text-4xl mt-2">🎁</span>
              </div>
            )}
          </div>
        ))}
      </main>

      <footer className="text-center mt-10">
        <p className="text-sm">
          © 2024 <span className="font-semibold">Carlendar</span> – Gemacht mit
          🎄 und ❤️ von Jesper
        </p>
      </footer>
    </div>
  );
}
