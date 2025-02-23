"use client";

import React from "react";
import {
  addMonths,
  subMonths,
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
} from "date-fns";
import { motion } from "framer-motion";
import { create } from "zustand";
import { Trash, Pencil } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

// Define the shape of a note
interface Note {
  id: string;
  timestamp: string;
  content: string;
}

// Define our Zustand store state and actions
interface CalendarState {
  currentDate: Date;
  selectedDate: Date | null;
  notesData: { [dateKey: string]: Note[] };
  newNote: string;
  editingNote: { id: string; content: string } | null;
  motivationalQuote: string;

  setCurrentDate: (date: Date) => void;
  setSelectedDate: (date: Date | null) => void;
  setNewNote: (note: string) => void;
  setEditingNote: (note: { id: string; content: string } | null) => void;

  addNote: () => void;
  deleteNote: (dateKey: string, noteId: string) => void;
  updateNote: (dateKey: string) => void;
  generateMotivationalQuote: () => void;
}

// Create the Zustand store
const useCalendarStore = create<CalendarState>((set, get) => ({
  currentDate: new Date(),
  selectedDate: null,
  notesData: {},
  newNote: "",
  editingNote: null,
  motivationalQuote: "Stay strong, keep pushing forward!",

  setCurrentDate: (date) => set({ currentDate: date }),

  setSelectedDate: (date) => set({ selectedDate: date, newNote: "" }),

  setNewNote: (note) => set({ newNote: note }),

  setEditingNote: (note) => set({ editingNote: note }),

  addNote: () => {
    const { selectedDate, newNote, notesData } = get();
    if (!selectedDate || !newNote.trim()) return;

    const dateKey = format(selectedDate, "yyyy-MM-dd");
    const timestamp = format(new Date(), "PPP h:mm a");
    const newEntry: Note = {
      id: crypto.randomUUID?.() || Math.random().toString(36).slice(2),
      timestamp,
      content: newNote.trim(),
    };

    set({
      notesData: {
        ...notesData,
        [dateKey]: [...(notesData[dateKey] || []), newEntry],
      },
      newNote: "",
    });
  },

  deleteNote: (dateKey, noteId) => {
    set((state) => ({
      notesData: {
        ...state.notesData,
        [dateKey]: state.notesData[dateKey]?.filter((note) => note.id !== noteId) || [],
      },
    }));
  },

  updateNote: (dateKey) => {
    set((state) => {
      if (!state.editingNote) return state;
      return {
        notesData: {
          ...state.notesData,
          [dateKey]:
            state.notesData[dateKey]?.map((note) =>
              note.id === state.editingNote!.id
                ? { ...note, content: state.editingNote!.content }
                : note
            ) || [],
        },
        editingNote: null,
      };
    });
  },

  generateMotivationalQuote: () => {
    const quotes = [
      "You are capable of amazing things!",
      "Believe in yourself and all that you are.",
      "Every day is a new beginning, take a deep breath and start again.",
      "Hardships often prepare ordinary people for an extraordinary destiny.",
      "Keep going. Everything you need will come to you at the perfect time.",
    ];
    const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
    set({ motivationalQuote: randomQuote });
  },
}));

export default function BigCalendarLeftJournalRightZustand() {
  const {
    currentDate,
    selectedDate,
    notesData,
    newNote,
    editingNote,
    motivationalQuote,
    setCurrentDate,
    setSelectedDate,
    setNewNote,
    setEditingNote,
    addNote,
    deleteNote,
    updateNote,
    generateMotivationalQuote,
  } = useCalendarStore();

  // Handle date click
  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    generateMotivationalQuote();
  };

  // Navigation
  const handlePrevMonth = () => {
    setCurrentDate(subMonths(currentDate, 1));
  };
  const handleNextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1));
  };

  // Generate calendar days
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const weekStart = startOfWeek(monthStart);
  const weekEnd = endOfWeek(monthEnd);
  const calendarDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

  // We'll use a simple top bar with a placeholder logo and no scrolling.

  return (
    <div className="h-screen w-full bg-[#f4f0e5] flex flex-col overflow-hidden">
   

      {/* Main content, no scrolling, everything must fit */}
      <main className="flex-1 flex items-center justify-center px-4 py-4 overflow-hidden">
        <div className="max-w-6xl w-full h-full flex flex-row gap-8">
          {/* Left side: Calendar + quote */}
          <motion.div
            className="flex flex-col gap-4 h-full w-1/2"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            {/* Calendar card */}
            <Card className="rounded-2xl shadow-xl flex-none">
              <CardContent className="p-4">
                <h2 className="font-bold text-xl mb-4 text-gray-800">Calendar</h2>
                <div className="flex items-center justify-between mb-4">
                  <Button variant="outline" onClick={handlePrevMonth}>
                    Previous
                  </Button>
                  <h2 className="font-bold text-xl text-gray-800">
                    {format(currentDate, "MMMM yyyy")}
                  </h2>
                  <Button variant="outline" onClick={handleNextMonth}>
                    Next
                  </Button>
                </div>

                {/* Day headers */}
                <div className="grid grid-cols-7 text-center font-bold mb-2 text-gray-700">
                  {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((dn) => (
                    <div key={dn}>{dn}</div>
                  ))}
                </div>

                {/* Calendar days, smaller so everything fits */}
                <div className="grid grid-cols-7 grid-rows-5 gap-2">
                  {calendarDays.map((date, idx) => {
                    const isCurrentMonth = date.getMonth() === currentDate.getMonth();
                    const isSelected =
                      selectedDate && date.toDateString() === selectedDate.toDateString();
                    return (
                      <div
                        key={idx}
                        className={`h-16 border border-gray-300 flex items-center justify-center rounded-md cursor-pointer transition-colors
                          ${isCurrentMonth ? "bg-white text-gray-900" : "bg-gray-200 text-gray-500"}
                          ${isSelected ? "ring-2 ring-slate-500" : "hover:bg-gray-100"}`}
                        onClick={() => handleDateClick(date)}
                      >
                        {date.getDate()}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Motivational Quote card */}
            <Card className="rounded-2xl shadow-xl flex-none">
              <CardContent className="p-4">
                <p className="text-gray-700 italic">{motivationalQuote}</p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Right side: Journal entries, scrollable within the pane */}
          <motion.div
            className="flex flex-col h-3/4 w-1/2"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <Card className="rounded-2xl shadow-xl flex-1 overflow-hidden">
              <CardContent className="p-4 flex flex-col h-full pb-2">
                <h2 className="font-bold text-xl mb-4 text-gray-800">Journal Entry</h2>

                {/* We'll display notes with scrolling enabled inside the pane. */}
                <div className="flex flex-col space-y-2 overflow-y-auto flex-1 pr-2 pb-0">
                  {selectedDate &&
                    notesData[format(selectedDate, "yyyy-MM-dd")]?.map((note) => (
                      <div
                        key={note.id}
                        className="p-2 border rounded bg-white flex justify-between items-center"
                      >
                        <div className="w-full">
                          <p className="text-sm text-gray-500">{note.timestamp}</p>

                          {editingNote?.id === note.id ? (
                            <Textarea
                              value={editingNote.content}
                              onChange={(e) =>
                                setEditingNote({ id: note.id, content: e.target.value })
                              }
                              className="w-full"
                            />
                          ) : (
                            <p className="text-gray-800 text-sm">{note.content}</p>
                          )}
                        </div>
                        <div className="flex space-x-2 ml-2">
                          {editingNote?.id === note.id ? (
                            <Button
                              onClick={() => updateNote(format(selectedDate, "yyyy-MM-dd"))}
                              size="sm"
                              variant="outline"
                            >
                              Save
                            </Button>
                          ) : (
                            <Button
                              onClick={() =>
                                setEditingNote({ id: note.id, content: note.content })
                              }
                              size="sm"
                              variant="outline"
                            >
                              <Pencil className="text-gray-500 h-4 w-4" />
                            </Button>
                          )}

                          {/* Delete button with gray icon */}
                          <Button
                            onClick={() =>
                              deleteNote(format(selectedDate, "yyyy-MM-dd"), note.id)
                            }
                            variant="outline"
                            size="sm"
                          >
                            <Trash className="text-gray-500 h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                </div>

                {/* Add a new journal entry, positioned at the bottom with less white space */}
                {selectedDate && (
                  <div className="flex flex-col items-center mt-2 pt-2 border-t">
                    <Textarea
                      value={newNote}
                      onChange={(e) => setNewNote(e.target.value)}
                      placeholder="Type your journal entry here..."
                      className="w-full max-w-md"
                    />
                    <Button
                      onClick={addNote}
                      className="bg-slate-600 hover:bg-slate-700 text-white mt-2"
                      disabled={!newNote.trim()}
                    >
                      Save Entry
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
