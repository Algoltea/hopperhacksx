"use client";

import React from "react";
import { addMonths, subMonths, format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval } from "date-fns";
import { motion } from "framer-motion";
import { create } from "zustand";

// shadcn/ui components:
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// Zustand store
interface CalendarState {
  currentDate: Date;
  selectedDate: Date | null;
  notesData: { [dateKey: string]: string[] };
  newNote: string;
  motivationalQuote: string;
  setCurrentDate: (date: Date) => void;
  setSelectedDate: (date: Date | null) => void;
  setNewNote: (note: string) => void;
  addNote: () => void;
  generateMotivationalQuote: () => void;
}

const useCalendarStore = create<CalendarState>((set, get) => ({
  currentDate: new Date(),
  selectedDate: null,
  notesData: {},
  newNote: "",
  motivationalQuote: "Stay strong, keep pushing forward!",
  setCurrentDate: (date) => set({ currentDate: date }),
  setSelectedDate: (date) => set({ selectedDate: date, newNote: "" }),
  setNewNote: (note) => set({ newNote: note }),
  addNote: () => {
    const { selectedDate, newNote, notesData } = get();
    if (!selectedDate || !newNote.trim()) return;
    const dateKey = format(selectedDate, "yyyy-MM-dd");
    set({
      notesData: {
        ...notesData,
        [dateKey]: [...(notesData[dateKey] || []), newNote.trim()],
      },
      newNote: "",
    });
  },
  generateMotivationalQuote: () => {
    const quotes = [
      "You are capable of amazing things!",
      "Believe in yourself and all that you are.",
      "Every day is a new beginning, take a deep breath and start again.",
      "Hardships often prepare ordinary people for an extraordinary destiny.",
      "Keep going. Everything you need will come to you at the perfect time."
    ];
    const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
    set({ motivationalQuote: randomQuote });
  },
}));

export default function BigCalendarLeftNotesRightZustand() {
  const {
    currentDate,
    selectedDate,
    notesData,
    newNote,
    motivationalQuote,
    setCurrentDate,
    setSelectedDate,
    setNewNote,
    addNote,
    generateMotivationalQuote,
  } = useCalendarStore();

  const handlePrevMonth = () => {
    setCurrentDate(subMonths(currentDate, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1));
  };

  const handleDayClick = (date: Date) => {
    const newMonth = date.getMonth();
    const currentMonth = currentDate.getMonth();
    if (newMonth !== currentMonth) {
      setCurrentDate(date);
    }
    setSelectedDate(date);
    generateMotivationalQuote();
  };

  function getDateKey(date: Date) {
    return format(date, "yyyy-MM-dd");
  }

  let currentNotes: string[] = [];
  if (selectedDate) {
    const dateKey = getDateKey(selectedDate);
    currentNotes = notesData[dateKey] || [];
  }

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const weekStart = startOfWeek(monthStart);
  const weekEnd = endOfWeek(monthEnd);
  const calendarDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

  return (
    <div className="flex flex-col min-h-screen bg-[#f4f0e5] p-4">
      <div className="flex w-full h-[80vh]">
        <motion.div className="w-1/2 p-4 flex flex-col">
          <Card className="rounded-2xl shadow-xl flex-grow">
            <CardContent className="p-4 h-full flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <Button variant="outline" onClick={handlePrevMonth}>Previous</Button>
                <h2 className="font-bold text-xl">{format(currentDate, "MMMM yyyy")}</h2>
                <Button variant="outline" onClick={handleNextMonth}>Next</Button>
              </div>
              <div className="grid grid-cols-7 text-center font-bold mb-2">
                {dayNames.map((dn) => <div key={dn}>{dn}</div>)}
              </div>
              <div className="grid grid-cols-7 grid-rows-5 gap-2 flex-grow">
                {calendarDays.map((date, idx) => {
                  const isCurrentMonth = date.getMonth() === currentDate.getMonth();
                  return (
                    <div
                      key={idx}
                      className={`h-20 border border-gray-300 flex items-center justify-center cursor-pointer rounded-md ${
                        selectedDate && date.toDateString() === selectedDate.toDateString() ? "ring-2 ring-slate-500" : ""
                      } ${isCurrentMonth ? "bg-white text-gray-900" : "bg-gray-200 text-gray-500"}`}
                      onClick={() => handleDayClick(date)}
                    >
                      {date.getDate()}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
          <motion.div className="mt-4 w-full">
            <Card className="rounded-2xl shadow-xl bg-gray-100 p-4">
              <p className="text-gray-700 italic">{motivationalQuote}</p>
            </Card>
          </motion.div>
        </motion.div>
        <motion.div className="w-1/2 p-4 flex flex-col">
          <Card className="rounded-2xl shadow-xl flex-grow">
            <CardContent className="p-4 flex flex-col h-full">
              <h2 className="font-bold text-xl mb-4 text-gray-800">Notes</h2>
              <div className="flex flex-col space-y-2 mt-auto">
                <Input
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  placeholder="Type your note here..."
                />
                <Button onClick={addNote} className="bg-slate-600 hover:bg-slate-700 text-white">
                  Save Note
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}