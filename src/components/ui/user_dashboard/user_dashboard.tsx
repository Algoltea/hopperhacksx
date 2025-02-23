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
    <div className="h-full flex flex-col md:flex-row gap-4">
      {/* Left side: Calendar + Quote */}
      <motion.div 
        className="w-full md:w-1/2 flex flex-col gap-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="flex-none rounded-xl shadow-lg bg-white/80 backdrop-blur">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-xl text-slate-800">Calendar</h2>
              <div className="flex items-center space-x-2">
                <Button variant="outline" onClick={handlePrevMonth} size="sm">
                  Previous
                </Button>
                <span className="font-bold text-sm text-slate-700 min-w-[100px] text-center">
                  {format(currentDate, "MMMM yyyy")}
                </span>
                <Button variant="outline" onClick={handleNextMonth} size="sm">
                  Next
                </Button>
              </div>
            </div>

            {/* Day headers */}
            <div className="grid grid-cols-7 text-center font-medium mb-1 text-slate-600">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((dn) => (
                <div key={dn} className="text-xs">{dn}</div>
              ))}
            </div>

            {/* Calendar days */}
            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map((date, idx) => {
                const isCurrentMonth = date.getMonth() === currentDate.getMonth();
                const isSelected =
                  selectedDate && date.toDateString() === selectedDate.toDateString();
                const hasNotes = notesData[format(date, "yyyy-MM-dd")]?.length > 0;
                
                return (
                  <motion.div
                    key={idx}
                    whileHover={{ scale: 1.05 }}
                    className={`
                      aspect-square flex flex-col items-center justify-center rounded-lg cursor-pointer
                      transition-colors relative text-xs
                      ${isCurrentMonth ? "bg-white" : "bg-slate-100"}
                      ${isSelected ? "ring-2 ring-primary shadow-md" : "hover:bg-slate-50"}
                    `}
                    onClick={() => handleDateClick(date)}
                  >
                    <span className={`
                      font-medium
                      ${isCurrentMonth ? "text-slate-900" : "text-slate-400"}
                      ${isSelected ? "text-primary" : ""}
                    `}>
                      {date.getDate()}
                    </span>
                    {hasNotes && (
                      <div className="absolute bottom-1 w-1 h-1 rounded-full bg-primary"></div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Motivational quote */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="flex-none"
        >
          <Card className="rounded-xl shadow-lg bg-gradient-to-br from-primary/5 to-primary/10">
            <CardContent className="p-4">
              <p className="text-slate-700 italic text-sm">{motivationalQuote}</p>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      {/* Right side: Journal entries */}
      <motion.div 
        className="w-full md:w-1/2 flex flex-col"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Card className="flex-1 rounded-xl shadow-lg bg-white/80 backdrop-blur">
          <CardContent className="p-4 flex flex-col h-full">
            <h2 className="font-bold text-xl mb-4 text-slate-800">
              {selectedDate ? format(selectedDate, "MMMM d, yyyy") : "Select a date"}
            </h2>

            {/* Display existing notes */}
            <div className="flex-1 overflow-y-auto space-y-3 mb-4 pr-2">
              {selectedDate &&
                notesData[format(selectedDate, "yyyy-MM-dd")]?.map((note) => (
                  <motion.div
                    key={note.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3 rounded-lg bg-white shadow-sm border border-slate-100"
                  >
                    <div className="w-full space-y-2">
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-slate-500">{note.timestamp}</p>
                        <div className="flex space-x-1">
                          {editingNote?.id === note.id ? (
                            <Button
                              onClick={() => updateNote(format(selectedDate, "yyyy-MM-dd"))}
                              size="sm"
                              variant="ghost"
                            >
                              Save
                            </Button>
                          ) : (
                            <Button
                              onClick={() => setEditingNote({ id: note.id, content: note.content })}
                              size="sm"
                              variant="ghost"
                            >
                              <Pencil className="h-3 w-3 text-slate-500" />
                            </Button>
                          )}
                          <Button
                            onClick={() => deleteNote(format(selectedDate, "yyyy-MM-dd"), note.id)}
                            variant="ghost"
                            size="sm"
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>

                      {editingNote?.id === note.id ? (
                        <Textarea
                          value={editingNote.content}
                          onChange={(e) => setEditingNote({ id: note.id, content: e.target.value })}
                          className="w-full min-h-[80px]"
                        />
                      ) : (
                        <p className="text-slate-700 text-sm whitespace-pre-wrap">{note.content}</p>
                      )}
                    </div>
                  </motion.div>
                ))}
            </div>

            {/* Add a new journal entry */}
            {selectedDate && (
              <div className="flex-none space-y-2 pt-2 border-t">
                <Textarea
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  placeholder="Write your thoughts for today..."
                  className="w-full h-[80px] bg-white text-sm resize-none"
                />
                <Button
                  onClick={addNote}
                  className="w-full bg-primary hover:bg-primary/90"
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
  );
}

