"use client";

import React, { useEffect } from "react";
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
import { Trash, Pencil, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { Timestamp } from "firebase/firestore";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  createNote,
  updateNote as updateFirebaseNote,
  deleteNote as deleteFirebaseNote,
  getNotes,
} from "@/lib/dashboard/dashboard";

// Define the shape of a note
interface Note {
  id: string;
  content: string;
  analysis?: string;
  confidence?: number;
  createdAt: Timestamp;
  hopperEmotion?: string;
  hopperResponse?: string;
  mood?: string;
  timestamp?: string;
}

// Define our Zustand store state and actions
interface CalendarState {
  currentDate: Date;
  selectedDate: Date | null;
  notesData: { [dateKey: string]: Note[] };
  newNote: string;
  editingNote: { id: string; content: string } | null;
  motivationalQuote: string;
  isLoading: boolean;

  setCurrentDate: (date: Date) => void;
  setSelectedDate: (date: Date | null) => void;
  setNewNote: (note: string) => void;
  setEditingNote: (note: { id: string; content: string } | null) => void;
  setNotesData: (dateKey: string, notes: Note[]) => void;
  setIsLoading: (loading: boolean) => void;
  resetStore: () => Date;

  addNote: (userId: string, dateId: string) => Promise<void>;
  deleteNote: (userId: string, dateId: string, noteId: string) => Promise<void>;
  updateNote: (userId: string, dateId: string) => Promise<void>;
  generateMotivationalQuote: () => void;
  fetchNotes: (userId: string, dateId: string) => Promise<void>;
}

// Create the Zustand store
const useCalendarStore = create<CalendarState>((set, get) => ({
  currentDate: new Date(),
  selectedDate: null,
  notesData: {},
  newNote: "",
  editingNote: null,
  motivationalQuote: "Stay strong, keep pushing forward!",
  isLoading: false,

  setCurrentDate: (date) => set({ currentDate: date }),
  setSelectedDate: (date) => set({ selectedDate: date, newNote: "" }),
  setNewNote: (note) => set({ newNote: note }),
  setEditingNote: (note) => set({ editingNote: note }),
  setNotesData: (dateKey, notes) => set((state) => ({
    notesData: { ...state.notesData, [dateKey]: notes },
  })),
  setIsLoading: (loading) => set({ isLoading: loading }),
  resetStore: () => {
    const today = new Date();
    set({
      currentDate: today,
      selectedDate: today,
      notesData: {},
      newNote: "",
      editingNote: null,
      motivationalQuote: "Stay strong, keep pushing forward!",
      isLoading: false,
    });
    return today; // Return today's date for use after reset
  },

  addNote: async (userId, dateId) => {
    const { newNote } = get();
    if (!newNote.trim()) return;

    try {
      set({ isLoading: true });
      const noteData = {
        content: newNote.trim(),
        analysis: "",
        confidence: 0,
        hopperEmotion: "",
        hopperResponse: "",
        mood: "",
      };

      await createNote(userId, dateId, noteData);
      const notes = await getNotes(userId, dateId);
      
      set((state) => ({
        notesData: { ...state.notesData, [dateId]: notes },
        newNote: "",
        isLoading: false,
      }));
    } catch (error) {
      console.error("Error adding note:", error);
      set({ isLoading: false });
    }
  },

  deleteNote: async (userId, dateId, noteId) => {
    try {
      set({ isLoading: true });
      await deleteFirebaseNote(userId, dateId, noteId);
      const notes = await getNotes(userId, dateId);
      
      set((state) => ({
        notesData: { ...state.notesData, [dateId]: notes },
        isLoading: false,
      }));
    } catch (error) {
      console.error("Error deleting note:", error);
      set({ isLoading: false });
    }
  },

  updateNote: async (userId, dateId) => {
    const { editingNote } = get();
    if (!editingNote) return;

    try {
      set({ isLoading: true });
      await updateFirebaseNote(userId, dateId, editingNote.id, {
        content: editingNote.content,
      });
      const notes = await getNotes(userId, dateId);
      
      set((state) => ({
        notesData: { ...state.notesData, [dateId]: notes },
        editingNote: null,
        isLoading: false,
      }));
    } catch (error) {
      console.error("Error updating note:", error);
      set({ isLoading: false });
    }
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

  fetchNotes: async (userId, dateId) => {
    try {
      set({ isLoading: true });
      const notes = await getNotes(userId, dateId);
      set((state) => ({
        notesData: { ...state.notesData, [dateId]: notes },
      }));
    } catch (error) {
      console.error("Error fetching notes:", error);
      set((state) => ({
        notesData: { ...state.notesData, [dateId]: [] },
      }));
    } finally {
      set({ isLoading: false });
    }
  },
}));

export default function BigCalendarLeftJournalRightZustand() {
  const { user } = useAuth();
  const {
    currentDate,
    selectedDate,
    notesData,
    newNote,
    editingNote,
    motivationalQuote,
    isLoading,
    setCurrentDate,
    setSelectedDate,
    setNewNote,
    setEditingNote,
    addNote,
    deleteNote,
    updateNote,
    generateMotivationalQuote,
    fetchNotes,
    resetStore,
  } = useCalendarStore();

  // Reset store when user logs out or logs in
  useEffect(() => {
    if (!user) {
      resetStore();
    } else {
      const today = resetStore(); // Reset store and get today's date
      const dateId = format(today, "yyyy-MM-dd");
      fetchNotes(user.uid, dateId); // Fetch today's notes
    }
  }, [user, resetStore, fetchNotes]);

  // Handle date click
  const handleDateClick = async (date: Date) => {
    setSelectedDate(date);
    generateMotivationalQuote();
    if (user?.uid) {
      const dateId = format(date, "yyyy-MM-dd");
      await fetchNotes(user.uid, dateId);
    }
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

            {/* Rabbit with Motivational Quote */}
            <motion.div
              className="flex flex-row items-center space-x-4 relative"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              {/* Larger Rabbit Image - Positioned to the Left */}
              <div className="relative w-36 h-36">
                <img
                  src="/hopperhappy1.png" // Corrected path
                  alt="Motivational Rabbit"
                  className="w-full h-full"
                />
              </div>

              {/* Speech Bubble - Positioned to the Right of the Rabbit's Mouth */}
              <motion.div
                className="relative bg-white border rounded-lg shadow-md p-3 text-gray-700 italic max-w-xs ml-4"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.4 }}
              >
                <p>{motivationalQuote}</p>
                {/* Speech Bubble Tail Positioned on the Left Near Rabbit's Mouth */}
                <div className="absolute bottom-1 left-[-10px] w-4 h-4 bg-white border border-gray-300 rotate-45"></div>
              </motion.div>
            </motion.div>
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

                {/* Notes list with loading state */}
                <div className="flex flex-col space-y-2 overflow-y-auto flex-1 pr-2 pb-0">
                  {isLoading ? (
                    <div className="flex items-center justify-center h-full">
                      <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
                    </div>
                  ) : (
                    selectedDate &&
                    notesData[format(selectedDate, "yyyy-MM-dd")]?.map((note) => (
                      <div
                        key={note.id}
                        className="p-2 border rounded bg-white flex justify-between items-center"
                      >
                        <div className="w-full">
                          <p className="text-sm text-gray-500">
                            {note.timestamp || format(note.createdAt.toDate(), 'PPP h:mm a')}
                          </p>

                          {editingNote?.id === note.id ? (
                            <Textarea
                              value={editingNote.content}
                              onChange={(e) =>
                                setEditingNote({ id: note.id, content: e.target.value })
                              }
                              className="w-full"
                              disabled={isLoading}
                            />
                          ) : (
                            <p className="text-gray-800 text-sm">{note.content}</p>
                          )}
                        </div>
                        <div className="flex space-x-2 ml-2">
                          {editingNote?.id === note.id ? (
                            <Button
                              onClick={() => user?.uid && updateNote(user.uid, format(selectedDate, "yyyy-MM-dd"))}
                              size="sm"
                              variant="outline"
                              disabled={isLoading}
                            >
                              {isLoading ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                'Save'
                              )}
                            </Button>
                          ) : (
                            <Button
                              onClick={() =>
                                setEditingNote({ id: note.id, content: note.content })
                              }
                              size="sm"
                              variant="outline"
                              disabled={isLoading}
                            >
                              <Pencil className="text-gray-500 h-4 w-4" />
                            </Button>
                          )}

                          <Button
                            onClick={() =>
                              user?.uid && deleteNote(user.uid, format(selectedDate, "yyyy-MM-dd"), note.id)
                            }
                            variant="outline"
                            size="sm"
                            disabled={isLoading}
                          >
                            {isLoading ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash className="text-gray-500 h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Add new journal entry */}
                {selectedDate && (
                  <div className="flex flex-col items-center mt-2 pt-2 border-t">
                    <Textarea
                      value={newNote}
                      onChange={(e) => setNewNote(e.target.value)}
                      placeholder="Type your journal entry here..."
                      className="w-full max-w-md"
                      disabled={isLoading}
                    />
                    <Button
                      onClick={() => user?.uid && addNote(user.uid, format(selectedDate, "yyyy-MM-dd"))}
                      className="bg-slate-600 hover:bg-slate-700 text-white mt-2"
                      disabled={!newNote.trim() || isLoading}
                    >
                      {isLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : null}
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
