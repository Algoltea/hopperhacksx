"use client";

import React, { useState } from "react";
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

// shadcn/ui components:
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components//ui/textarea";

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

  // Set the current displayed month
  setCurrentDate: (date) => set({ currentDate: date }),

  // Set the selected date (also clear new note)
  setSelectedDate: (date) => set({ selectedDate: date, newNote: "" }),

  // Track the text for a new note
  setNewNote: (note) => set({ newNote: note }),

  // Track which note we're editing (ID + content)
  setEditingNote: (note) => set({ editingNote: note }),

  // Add a new note for the selected date
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

  // Delete an existing note
  deleteNote: (dateKey, noteId) => {
    set((state) => ({
      notesData: {
        ...state.notesData,
        [dateKey]: state.notesData[dateKey]?.filter((note) => note.id !== noteId) || [],
      },
    }));
  },

  // Update a note (when saving an edit)
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

  // Generate a motivational quote
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

// The main page component
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

  // Compute the array of days to display in the calendar
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const weekStart = startOfWeek(monthStart);
  const weekEnd = endOfWeek(monthEnd);
  const calendarDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

  // Function to select a date and generate a motivational quote
  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    generateMotivationalQuote();
  };

  // Move to previous month
  const handlePrevMonth = () => {
    setCurrentDate(subMonths(currentDate, 1));
  };

  // Move to next month
  const handleNextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1));
  };

  return (
    <div className="flex flex-row min-h-screen bg-[#f4f0e5] p-4">
      {/* Left side: Calendar + Quote */}
      <motion.div className="w-1/2 p-4 flex flex-col">
        <Card className="rounded-2xl shadow-xl mb-4">
          <CardContent className="p-4">
            <h2 className="font-bold text-xl mb-4 text-gray-800">Calendar</h2>
            {/* Month navigation */}
            <div className="flex items-center justify-between mb-4">
              <Button variant="outline" onClick={handlePrevMonth}>
                Previous
              </Button>
              <h2 className="font-bold text-xl">
                {format(currentDate, "MMMM yyyy")}
              </h2>
              <Button variant="outline" onClick={handleNextMonth}>
                Next
              </Button>
            </div>

            {/* Day headers */}
            <div className="grid grid-cols-7 text-center font-bold mb-2">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((dn) => (
                <div key={dn}>{dn}</div>
              ))}
            </div>

            {/* Calendar days */}
            <div className="grid grid-cols-7 grid-rows-5 gap-2">
              {calendarDays.map((date, idx) => {
                const isCurrentMonth = date.getMonth() === currentDate.getMonth();
                const isSelected =
                  selectedDate && date.toDateString() === selectedDate.toDateString();
                return (
                  <div
                    key={idx}
                    className={`h-20 border border-gray-300 flex items-center justify-center rounded-md cursor-pointer ${
                      isCurrentMonth ? "bg-white text-gray-900" : "bg-gray-200 text-gray-500"
                    } ${isSelected ? "ring-2 ring-slate-500" : ""}`}
                    onClick={() => handleDateClick(date)}
                  >
                    {date.getDate()}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Motivational quote */}
        <Card className="rounded-2xl shadow-xl bg-gray-100 p-4">
          <p className="text-gray-700 italic">{motivationalQuote}</p>
        </Card>
      </motion.div>

      {/* Right side: Journal entries */}
      <motion.div className="w-1/2 p-4 flex flex-col">
        <Card className="rounded-2xl shadow-xl flex-grow">
          <CardContent className="p-4 flex flex-col h-full">
            <h2 className="font-bold text-xl mb-4 text-gray-800">Journal Entry</h2>

            {/* Display existing notes */}
            <div className="overflow-y-auto flex-grow">
              {selectedDate &&
                notesData[format(selectedDate, "yyyy-MM-dd")]?.map((note) => (
                  <div
                    key={note.id}
                    className="mb-2 p-2 border rounded bg-white flex justify-between items-center"
                  >
                    <div className="w-full">
                      <p className="text-sm text-gray-500">{note.timestamp}</p>

                      {/* Editing vs. display mode */}
                      {editingNote?.id === note.id ? (
                        <Textarea
                          value={editingNote.content}
                          onChange={(e) =>
                            setEditingNote({ id: note.id, content: e.target.value })
                          }
                          className="w-full"
                        />
                      ) : (
                        <p>{note.content}</p>
                      )}
                    </div>
                    <div className="flex space-x-2 ml-2">
                      {/* If we're editing this note, show Save button; otherwise, show Pencil button */}
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

                      {/* Delete button */}
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

            {/* Add a new journal entry */}
            <div className="flex flex-col space-y-2 mt-auto">
              <Textarea
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Type your journal entry here..."
                className="w-full"
              />
              <Button
                onClick={addNote}
                className="bg-slate-600 hover:bg-slate-700 text-white"
              >
                Save Entry
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

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