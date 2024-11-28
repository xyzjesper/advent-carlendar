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
    if (day && !day.isOpen) {
      const updatedDay = {
        ...day,
        id: dayId,
        iscorrect: false,
      };

      setDay(updatedDay);
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

  if (day?.date && day.date > new Date().toISOString().split("T")[0]) {
    return (
      <>
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
      </>
    );
  }

  if (!day) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        <h1 className="text-3xl">Tür nicht gefunden!</h1>
      </div>
    );
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.target as HTMLFormElement;
    const code = (form.elements.namedItem("code") as HTMLInputElement).value;

    if (day && code === day.code) {
      const response = await fetch(`/api/update-door-code`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: day.id, iscorrect: true }),
      }).then((res) => res.json());

      toast("Richtiger Code! Tür wird geöffnet!");
      setTimeout(() => {
        window.location.reload();
      }, 2000);

      const res = await fetch(`/api/add-point`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: document.cookie
            .split("; ")
            .find((row) => row.startsWith("userCode="))
            ?.split("=")[1],
          points: 1,
        }),
      });
    } else {
      toast("Falscher Code! Versuche es erneut!");
    }
  }

  if (day.iscorrect === false) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-500 to-red-600 flex flex-col items-center justify-center text-white p-6">
        <form
          onSubmit={handleSubmit}
          className="bg-transparent p-8 rounded-lg shadow-lg max-w-sm w-full"
        >
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-6">
            Code Eingabe
          </h2>

          <div className="mb-4">
            <label
              htmlFor="code"
              className="block text-lg font-medium text-gray-900 mb-2"
            >
              Gib deinen Code ein:
            </label>
            <input
              id="code"
              type="text"
              className="w-full p-3 mt-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-white bg-gray-900"
              placeholder="Code hier eingeben"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 mt-4 bg-gradient-to-r from-green-500 to-red-600 text-white rounded-lg shadow-lg hover:scale-105 transition transform"
          >
            Absenden
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-500 to-red-600 flex flex-col items-center justify-center text-white p-6">
      <h1 className="text-4xl font-bold mb-4">🎁 Tür {day.id}</h1>
      <Markdown
        options={{
          overrides: {
            h1: {
              component: "h1",
              props: {
                className: "text-4xl font-bold mt-4 mb-2",
              },
            },
            h2: {
              component: "h2",
              props: {
                className: "text-3xl font-bold mt-4 mb-2",
              },
            },
            h3: {
              component: "h3",
              props: {
                className: "text-2xl font-bold mt-4 mb-2",
              },
            },
            h4: {
              component: "h4",
              props: {
                className: "text-xl font-bold mt-4 mb-2",
              },
            },
            h5: {
              component: "h5",
              props: {
                className: "text-lg font-bold mt-4 mb-2",
              },
            },
            p: {
              component: "p",
              props: {
                className: "text-gray-300 text-md",
              },
            },
            a: {
              component: "a",
              props: {
                className: "text-primary-500 underline hover:text-primary",
              },
            },
            code: {
              component: "pre",
              props: {
                className: "bg-gray-900 text-gray-300 p-3 rounded-lg mt-3",
              },
            },
            ol: {
              component: "ol",
              props: {
                className: "list-decimal list-inside",
              },
            },
            ul: {
              component: "ul",
              props: {
                className: "list-disc list-inside",
              },
            },
            li: {
              component: "li",
              props: {
                className: "text-gray-300",
              },
            },
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
