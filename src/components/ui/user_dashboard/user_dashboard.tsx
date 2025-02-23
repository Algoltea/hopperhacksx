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
import { Trash, Pencil, Settings2, Palette } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { Timestamp } from "firebase/firestore";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader } from "@/components/ui/loading";
import {
  createNote,
  updateNote as updateFirebaseNote,
  deleteNote as deleteFirebaseNote,
  getNotes,
  getDayEntry,
  DayEntry
} from "@/lib/dashboard/dashboard";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

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
  showMoodLabels: boolean;

  setCurrentDate: (date: Date) => void;
  setSelectedDate: (date: Date | null) => void;
  setNewNote: (note: string) => void;
  setEditingNote: (note: { id: string; content: string } | null) => void;
  setNotesData: (dateKey: string, notes: Note[]) => void;
  setDailySummary: (dateKey: string, summary: Omit<DayEntry, 'id' | 'notes'> | null) => void;
  setIsLoading: (loading: boolean) => void;
  setHopperY: (y: number) => void;
  setHopperEmotion: (emotion: string) => void;
  setShowMoodLabels: (show: boolean) => void;
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
  showMoodLabels: true,

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
  setShowMoodLabels: (show) => set({ showMoodLabels: show }),
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
      showMoodLabels: true,
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

      // Analyze notes and update daily summary
      try {
        const combinedText = notes.map(note => note.content).join("\n");
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

        // Update both notes and daily summary in store
        set((state) => ({
          notesData: { ...state.notesData, [dateId]: updatedNotes },
          dailySummary: {
            ...state.dailySummary,
            [dateId]: {
              analysis: analysis.analysis,
              confidence: analysis.confidence,
              hopperEmotion: analysis.response.hopperEmotion,
              hopperResponse: analysis.response.text,
              mood: analysis.mood,
              createdAt: notes[0].createdAt,
              updatedAt: Timestamp.now(),
            }
          },
          hopperEmotion: analysis.response.hopperEmotion,
        }));
      } catch (error) {
        console.error("Error analyzing notes:", error);
      }
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

      // Analyze notes and update daily summary
      try {
        const combinedText = notes.map(note => note.content).join("\n");
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

        // Update both notes and daily summary in store
        set((state) => ({
          notesData: { ...state.notesData, [dateId]: updatedNotes },
          dailySummary: {
            ...state.dailySummary,
            [dateId]: {
              analysis: analysis.analysis,
              confidence: analysis.confidence,
              hopperEmotion: analysis.response.hopperEmotion,
              hopperResponse: analysis.response.text,
              mood: analysis.mood,
              createdAt: notes[0].createdAt,
              updatedAt: Timestamp.now(),
            }
          },
          hopperEmotion: analysis.response.hopperEmotion,
        }));
      } catch (error) {
        console.error("Error analyzing notes:", error);
      }
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

// Add this after the imports
const moodColors = {
  happy: "bg-yellow-100 hover:bg-yellow-200",
  sad: "bg-blue-100 hover:bg-blue-200",
  angry: "bg-red-100 hover:bg-red-200",
  anxious: "bg-indigo-100 hover:bg-indigo-200",
  frustrated: "bg-purple-100 hover:bg-purple-200",
  neutral: "bg-gray-100 hover:bg-gray-200",
  excited: "bg-orange-100 hover:bg-orange-200",
  peaceful: "bg-green-100 hover:bg-green-200",
  reflective: "bg-purple-100 hover:bg-purple-200",
  default: "bg-white hover:bg-gray-100"
};

// Mood Color Palette for the legend
const moodColorPalette = {
  happy: "bg-yellow-100 border-yellow-200",
  sad: "bg-blue-100 border-blue-200",
  angry: "bg-red-100 border-red-200",
  anxious: "bg-indigo-100 border-indigo-200",
  frustrated: "bg-purple-100 border-purple-200",
  neutral: "bg-gray-100 border-gray-200",
  excited: "bg-orange-100 border-orange-200",
  peaceful: "bg-green-100 border-green-200",
  reflective: "bg-purple-100 border-purple-200",
};

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
    showMoodLabels,
    setCurrentDate,
    setSelectedDate,
    setNewNote,
    setEditingNote,
    setNotesData,
    setDailySummary,
    addNote,
    deleteNote,
    updateNote,
    resetStore,
    setHopperY,
    setIsLoading,
    setHopperEmotion,
    setShowMoodLabels,
  } = useCalendarStore();

  // Generate calendar days
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const weekStart = startOfWeek(monthStart);
  const weekEnd = endOfWeek(monthEnd);
  const calendarDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

  // Fetch entire month's data
  const fetchMonthData = async (userId: string, date: Date) => {
    setIsLoading(true);
    try {
      const start = startOfMonth(date);
      const end = endOfMonth(date);
      const daysInMonth = eachDayOfInterval({ start, end });
      
      // Fetch all days in parallel
      await Promise.all(
        daysInMonth.map(async (day) => {
          const dateId = format(day, "yyyy-MM-dd");
          try {
            const dayEntry = await getDayEntry(userId, dateId);
            if (dayEntry) {
              const { notes, ...summary } = dayEntry;
              setNotesData(dateId, notes);
              setDailySummary(dateId, summary);
            }
          } catch (error) {
            console.error(`Error fetching data for ${dateId}:`, error);
          }
        })
      );
    } catch (error) {
      console.error("Error fetching month data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Initial load and month change effect
  useEffect(() => {
    if (user?.uid) {
      fetchMonthData(user.uid, currentDate);
    }
  }, [user?.uid, currentDate]);

  // Reset store and load current month when user logs in/out
  useEffect(() => {
    if (!user) {
      resetStore();
    } else {
      const today = resetStore();
      fetchMonthData(user.uid, today);
    }
  }, [user, resetStore]);

  // Handle date click - now just updates selection without fetching
  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    const dateId = format(date, "yyyy-MM-dd");
    // Update Hopper's emotion if we have data for this date
    if (dailySummary[dateId]?.hopperEmotion) {
      setHopperEmotion(dailySummary[dateId]?.hopperEmotion || "happy");
    }
  };

  // Navigation - now includes data fetching
  const handlePrevMonth = async () => {
    const newDate = subMonths(currentDate, 1);
    setCurrentDate(newDate);
  };

  const handleNextMonth = async () => {
    const newDate = addMonths(currentDate, 1);
    setCurrentDate(newDate);
  };

  // Add animation effect for Hopper
  useEffect(() => {
    const interval = setInterval(() => {
      const y = Math.sin(Date.now() / 1000) * 10;
      setHopperY(y);
    }, 1000 / 60); // 60fps

    return () => clearInterval(interval);
  }, [setHopperY]);

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
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-bold text-xl text-gray-800">Calendar</h2>
                  <div className="flex items-center gap-2">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <Palette className="h-4 w-4" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-fit p-2" align="start" side="left" sideOffset={12}>
                        <div className="flex flex-col gap-1.5">
                          <h4 className="text-xs font-medium px-0.5">Mood Legend</h4>
                          <div className="grid grid-cols-3 gap-1.5">
                            {Object.entries(moodColorPalette).map(([mood, colorClass]) => (
                              <div
                                key={mood}
                                className="flex items-center gap-1.5 p-1.5 rounded hover:bg-muted/50"
                                title={mood}
                              >
                                <div className={`w-4 h-4 rounded border-2 ${colorClass} shrink-0`} />
                                <span className="text-xs capitalize">{mood}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </PopoverContent>
                    </Popover>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <Settings2 className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Calendar Settings</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuCheckboxItem
                          checked={showMoodLabels}
                          onCheckedChange={setShowMoodLabels}
                        >
                          Show Mood Labels
                        </DropdownMenuCheckboxItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>

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
                    const dateKey = format(date, "yyyy-MM-dd");
                    const isCurrentMonth = date.getMonth() === currentDate.getMonth();
                    const isSelected = selectedDate && date.toDateString() === selectedDate.toDateString();
                    const dayMood = dailySummary[dateKey]?.mood?.toLowerCase() || 'default';
                    const moodColor = moodColors[dayMood as keyof typeof moodColors] || moodColors.default;
                    
                    return (
                      <div
                        key={idx}
                        className={`h-16 border border-gray-300 flex flex-col items-center justify-center rounded-md cursor-pointer transition-colors
                          ${isCurrentMonth ? moodColor : "bg-gray-200 text-gray-500"}
                          ${isSelected ? "ring-2 ring-slate-500" : ""}`}
                        onClick={() => handleDateClick(date)}
                      >
                        <span className="text-lg">{date.getDate()}</span>
                        {isCurrentMonth && showMoodLabels && dailySummary[dateKey]?.mood && (
                          <span className="text-xs text-gray-600 capitalize">{dailySummary[dateKey]?.mood}</span>
                        )}
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
                className="relative bg-white border rounded-2xl shadow-md p-4 text-gray-700 max-w-xs ml-4 before:content-[''] before:absolute before:left-[-8px] before:top-[50%] before:w-4 before:h-4 before:bg-white before:border-l before:border-b before:border-gray-300 before:-translate-y-1/2 before:rotate-45 before:shadow-[-3px_3px_3px_rgba(0,0,0,0.05)]"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.4 }}
              >
                {selectedDate && dailySummary[format(selectedDate, "yyyy-MM-dd")] ? (
                  <>
                    <p className="text-sm mb-2">
                      {dailySummary[format(selectedDate, "yyyy-MM-dd")]?.hopperResponse || "Hi! I&apos;m Hopper, your journaling companion. How are you feeling today?"}
                    </p>
                  </>
                ) : (
                  <p className="text-sm mb-2">
                    Hi! I&apos;m Hopper, your journaling companion. How are you feeling today?
                  </p>
                )}
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
                <div className="flex flex-col space-y-3 overflow-y-auto flex-1 pr-2 pb-0">
                  {isLoading ? (
                    <div className="flex items-center justify-center h-full">
                      <Loader size="lg" />
                    </div>
                  ) : (
                    selectedDate &&
                    notesData[format(selectedDate, "yyyy-MM-dd")]?.map((note) => (
                      <div
                        key={note.id}
                        className="p-3 border rounded-lg bg-white hover:bg-gray-50 transition-colors"
                      >
                        <div className="w-full space-y-2">
                          <div className="flex items-center justify-between">
                            <p className="text-sm text-gray-500">
                              {note.timestamp || format(note.createdAt.toDate(), 'PPP h:mm a')}
                            </p>
                            <div className="flex space-x-2">
                              {editingNote?.id === note.id ? (
                                <Button
                                  onClick={() => user?.uid && updateNote(user.uid, format(selectedDate, "yyyy-MM-dd"))}
                                  size="sm"
                                  variant="outline"
                                  disabled={isLoading}
                                >
                                  {isLoading ? (
                                    <Loader size="sm" />
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
                                  variant="ghost"
                                  className="text-gray-500 hover:text-gray-700"
                                  disabled={isLoading}
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>
                              )}

                              <Button
                                onClick={() =>
                                  user?.uid && deleteNote(user.uid, format(selectedDate, "yyyy-MM-dd"), note.id)
                                }
                                variant="ghost"
                                size="sm"
                                className="text-gray-500 hover:text-gray-700"
                                disabled={isLoading}
                              >
                                {isLoading ? (
                                  <Loader size="sm" />
                                ) : (
                                  <Trash className="h-4 w-4" />
                                )}
                              </Button>
                            </div>
                          </div>

                          {editingNote?.id === note.id ? (
                            <Textarea
                              value={editingNote.content}
                              onChange={(e) =>
                                setEditingNote({ id: note.id, content: e.target.value })
                              }
                              className="w-full min-h-[100px] text-sm"
                              disabled={isLoading}
                            />
                          ) : (
                            <p className="text-gray-800 text-sm whitespace-pre-wrap">{note.content}</p>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Add new journal entry */}
                {selectedDate && (
                  <div className="flex flex-col items-center mt-2 pt-4 border-t">
                    <Textarea
                      value={newNote}
                      onChange={(e) => setNewNote(e.target.value)}
                      placeholder="Type your journal entry here..."
                      className="w-full min-h-[100px] resize-none bg-white focus:ring-2 focus:ring-primary/20"
                      disabled={isLoading}
                    />
                    <div className="w-full flex justify-end mt-2">
                      <Button
                        onClick={() => user?.uid && addNote(user.uid, format(selectedDate, "yyyy-MM-dd"))}
                        className="bg-primary hover:bg-primary/90 text-white"
                        disabled={!newNote.trim() || isLoading}
                      >
                        {isLoading ? (
                          <Loader size="sm" className="mr-2" />
                        ) : null}
                        Save Entry
                      </Button>
                    </div>
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
