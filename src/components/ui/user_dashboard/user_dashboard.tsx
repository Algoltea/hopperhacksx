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
  getDayEntry,
  DayEntry
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
  dailySummary: { [dateKey: string]: Omit<DayEntry, 'id' | 'notes'> | null };
  newNote: string;
  editingNote: { id: string; content: string } | null;
  isLoading: boolean;
  hopperY: number;
  hopperEmotion: string;

  setCurrentDate: (date: Date) => void;
  setSelectedDate: (date: Date | null) => void;
  setNewNote: (note: string) => void;
  setEditingNote: (note: { id: string; content: string } | null) => void;
  setNotesData: (dateKey: string, notes: Note[]) => void;
  setDailySummary: (dateKey: string, summary: Omit<DayEntry, 'id' | 'notes'> | null) => void;
  setIsLoading: (loading: boolean) => void;
  setHopperY: (y: number) => void;
  setHopperEmotion: (emotion: string) => void;
  resetStore: () => Date;

  addNote: (userId: string, dateId: string) => Promise<void>;
  deleteNote: (userId: string, dateId: string, noteId: string) => Promise<void>;
  updateNote: (userId: string, dateId: string) => Promise<void>;
  fetchNotes: (userId: string, dateId: string) => Promise<void>;
  analyzeNotes: (userId: string, dateId: string) => Promise<void>;
}

// Create the Zustand store
const useCalendarStore = create<CalendarState>((set, get) => ({
  currentDate: new Date(),
  selectedDate: null,
  notesData: {},
  dailySummary: {},
  newNote: "",
  editingNote: null,
  isLoading: false,
  hopperY: 0,
  hopperEmotion: "happy",

  setCurrentDate: (date) => set({ currentDate: date }),
  setSelectedDate: (date) => set({ selectedDate: date, newNote: "" }),
  setNewNote: (note) => set({ newNote: note }),
  setEditingNote: (note) => set({ editingNote: note }),
  setNotesData: (dateKey, notes) => set((state) => ({
    notesData: { ...state.notesData, [dateKey]: notes },
  })),
  setDailySummary: (dateKey, summary) => set((state) => ({
    dailySummary: { ...state.dailySummary, [dateKey]: summary },
  })),
  setIsLoading: (loading) => set({ isLoading: loading }),
  setHopperY: (y) => set({ hopperY: y }),
  setHopperEmotion: (emotion) => set({ hopperEmotion: emotion }),
  resetStore: () => {
    const today = new Date();
    set({
      currentDate: today,
      selectedDate: today,
      notesData: {},
      dailySummary: {},
      newNote: "",
      editingNote: null,
      isLoading: false,
      hopperY: 0,
      hopperEmotion: "happy",
    });
    return today;
  },

  analyzeNotes: async (userId, dateId) => {
    const { notesData } = get();
    const notes = notesData[dateId] || [];
    if (notes.length === 0) return;

    try {
      set({ isLoading: true });
      
      // Combine all notes for the day
      const combinedText = notes.map(note => note.content).join("\n");
      
      // Send to analysis endpoint
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: combinedText }),
      });

      if (!response.ok) throw new Error("Failed to analyze notes");
      
      const analysis = await response.json();
      
      // Update each note with the analysis results
      const updatedNotes = await Promise.all(notes.map(async (note) => {
        await updateFirebaseNote(userId, dateId, note.id, {
          analysis: analysis.analysis,
          confidence: analysis.confidence,
          mood: analysis.mood,
          hopperEmotion: analysis.response.hopperEmotion,
          hopperResponse: analysis.response.text,
        });
        return {
          ...note,
          analysis: analysis.analysis,
          confidence: analysis.confidence,
          mood: analysis.mood,
          hopperEmotion: analysis.response.hopperEmotion,
          hopperResponse: analysis.response.text,
        };
      }));

      // Update store with analyzed notes
      set((state) => ({
        notesData: { ...state.notesData, [dateId]: updatedNotes },
        hopperEmotion: analysis.response.hopperEmotion,
      }));
    } catch (error) {
      console.error("Error analyzing notes:", error);
    } finally {
      set({ isLoading: false });
    }
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

      // Analyze notes after adding a new one
      await get().analyzeNotes(userId, dateId);
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

  fetchNotes: async (userId, dateId) => {
    try {
      set({ isLoading: true });
      const dayEntry = await getDayEntry(userId, dateId);
      if (dayEntry) {
        const { notes, ...summary } = dayEntry;
        set((state) => ({
          notesData: { ...state.notesData, [dateId]: notes },
          dailySummary: { ...state.dailySummary, [dateId]: summary },
          hopperEmotion: summary.hopperEmotion || state.hopperEmotion,
        }));
      } else {
        set((state) => ({
          notesData: { ...state.notesData, [dateId]: [] },
          dailySummary: { ...state.dailySummary, [dateId]: null },
        }));
      }
    } catch (error) {
      console.error("Error fetching notes:", error);
      set((state) => ({
        notesData: { ...state.notesData, [dateId]: [] },
        dailySummary: { ...state.dailySummary, [dateId]: null },
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
    dailySummary,
    newNote,
    editingNote,
    isLoading,
    hopperY,
    hopperEmotion,
    setCurrentDate,
    setSelectedDate,
    setNewNote,
    setEditingNote,
    addNote,
    deleteNote,
    updateNote,
    fetchNotes,
    resetStore,
    analyzeNotes,
    setHopperY,
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

  // Add animation effect for Hopper
  useEffect(() => {
    const interval = setInterval(() => {
      const y = Math.sin(Date.now() / 1000) * 10;
      setHopperY(y);
    }, 1000 / 60); // 60fps

    return () => clearInterval(interval);
  }, [setHopperY]);

  // Analyze notes when date is selected
  useEffect(() => {
    if (user?.uid && selectedDate) {
      const dateId = format(selectedDate, "yyyy-MM-dd");
      analyzeNotes(user.uid, dateId);
    }
  }, [user?.uid, selectedDate, analyzeNotes]);

  // Handle date click
  const handleDateClick = async (date: Date) => {
    setSelectedDate(date);
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

            {/* Rabbit with Analysis Response */}
            <motion.div
              className="flex flex-row items-center space-x-4 relative"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: hopperY }}
              transition={{ duration: 0.4 }}
            >
              {/* Hopper Image with Emotion */}
              <motion.div 
                className="relative w-36 h-36"
                animate={{ y: hopperY }}
              >
                <img
                  src={`/assets/hoppers/hopper${hopperEmotion.toLowerCase()}.png`}
                  alt={`Hopper feeling ${hopperEmotion}`}
                  className="w-full h-full object-contain"
                />
              </motion.div>

              {/* Speech Bubble with Analysis */}
              <motion.div
                className="relative bg-white border rounded-lg shadow-md p-4 text-gray-700 max-w-xs ml-4"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.4 }}
              >
                {selectedDate && dailySummary[format(selectedDate, "yyyy-MM-dd")] ? (
                  <>
                    <p className="text-sm mb-2">
                      {dailySummary[format(selectedDate, "yyyy-MM-dd")]?.hopperResponse || "Hi! I&apos;m Hopper, your journaling companion. How are you feeling today?"}
                    </p>
                    <div className="text-xs text-gray-500 mt-2 border-t pt-2">
                      <p>Mood: {dailySummary[format(selectedDate, "yyyy-MM-dd")]?.mood || 'Not analyzed'}</p>
                      <p>Analysis: {dailySummary[format(selectedDate, "yyyy-MM-dd")]?.analysis || 'No analysis available'}</p>
                      <p>Confidence: {dailySummary[format(selectedDate, "yyyy-MM-dd")]?.confidence?.toFixed(2) || '0.00'}</p>
                    </div>
                  </>
                ) : (
                  <p className="text-sm mb-2">
                    Hi! I&apos;m Hopper, your journaling companion. How are you feeling today?
                  </p>
                )}
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
