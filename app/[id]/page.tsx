"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import calendarData from "../../config/calendar.json";
import Markdown from "markdown-to-jsx";
import { toast } from "react-toastify";

export default function DoorPage() {
  const { id } = useParams();
  const [inputCode, setInputCode] = useState<string>("");
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);

  const [day, setDay] = useState<{
    id: number;
    isOpen: boolean;
    date: string;
    content?: string;
    code: string;
    iscorrect: boolean;
  } | null>(null);

  const dayId = parseInt(id as string, 10);

  const openDoor = () => {
    if (day && (!day.isOpen && day.date === new Date().toISOString().split("T")[0])) {
      const updatedDay = {
        ...day,
        isOpen: true, // Markiere das Türchen als geöffnet
      };

      setDay(updatedDay);
    } else {
      toast("Dieses Türchen kann noch nicht geöffnet werden!");
    }
  };

  useEffect(() => {
    const foundDay = calendarData.find((entry) => entry.id === dayId);
    setDay(
      foundDay
        ? {
            ...foundDay,
            code: foundDay.code || "",
            iscorrect: foundDay.iscorrect || false,
            isOpen: foundDay.isOpen || false,
          }
        : null
    );
  }, [dayId]);

  useEffect(() => {
    const userCode = document.cookie
      .split("; ")
      .find((row) => row.startsWith("userCode="))
      ?.split("=")[1];

    setIsLoggedIn(Boolean(userCode));
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

  if (!day) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        <h1 className="text-3xl">Tür nicht gefunden!</h1>
      </div>
    );
  }

  const isDoorAccessible =
    day.date === new Date().toISOString().split("T")[0] || day.isOpen;

  if (!isDoorAccessible) {
    return (
      <div className="p-11 min-h-screen flex items-center justify-center text-gray-900 bg-gradient-to-b from-green-500 to-red-600">
        <h1 className="text-3xl">
          Holter die Polter!!!
          <br />
          Heute ist noch nicht der Tag, um dieses Tür
          <br />
          zu öffnen! 🎅🎄
        </h1>
        <div className="p-10 mt-10">
          <button
            onClick={() => window.open(`/${day.id - 1}`, "_self")}
            className="mt-6 px-6 py-3 bg-gray-600 rounded-lg shadow-lg hover:bg-gray-500"
          >
            Zum {day.id - 1}. Türchen
          </button>
          <br></br>
          <button
            onClick={() => window.open("/", "_self")}
            className="mt-6 px-6 py-3 bg-gray-600 rounded-lg shadow-lg hover:bg-gray-500"
          >
            Zurück zum Kalender
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-500 to-red-600 flex flex-col items-center justify-center text-white p-6">
      <h1 className="text-4xl font-bold mb-4">🎁 Tür {day.id}</h1>
      <Markdown
        options={{
          overrides: {
            p: { component: "p", props: { className: "text-gray-300 text-md" } },
          },
        }}
      >
        {day.content || ""}
      </Markdown>
      {day.isOpen ? (
        <p className="mt-4 text-lg">Dieses Türchen wurde bereits geöffnet!</p>
      ) : (
        <button
          onClick={openDoor}
          className="mt-6 px-6 py-3 bg-red-600 rounded-lg shadow-lg hover:bg-red-500"
        >
          Tür öffnen
        </button>
      )}

      <button
        onClick={() => window.open("/", "_self")}
        className="mt-6 px-6 py-3 bg-gray-600 rounded-lg shadow-lg hover:bg-gray-500"
      >
        Zurück zum Kalender
      </button>
    </div>
  );
}
