"use client"

import { useState, useEffect } from "react"
import { format } from "date-fns"
import { Card } from "@/components/ui/card"
import { ThemeToggle } from "@/components/theme-toggle"
import MoodPicker from "@/components/mood-picker"
import JournalEntry from "@/components/journal-entry"
import MoodCalendar from "@/components/mood-calendar"

interface Entry {
  date: string
  mood: number
  content: string
}

export default function Home() {
  const [entries, setEntries] = useState<Entry[]>([])
  const [currentDate, setCurrentDate] = useState(format(new Date(), "yyyy-MM-dd"))
  const [currentEntry, setCurrentEntry] = useState<Entry>({
    date: currentDate,
    mood: 0,
    content: "",
  })

  useEffect(() => {
    const storedEntries = localStorage.getItem("moodJournalEntries")
    if (storedEntries) {
      setEntries(JSON.parse(storedEntries))
    }
  }, [])

  useEffect(() => {
    localStorage.setItem("moodJournalEntries", JSON.stringify(entries))
  }, [entries])

  useEffect(() => {
    const existingEntry = entries.find((entry) => entry.date === currentDate)
    if (existingEntry) {
      setCurrentEntry(existingEntry)
    } else {
      setCurrentEntry({ date: currentDate, mood: 0, content: "" })
    }
  }, [currentDate, entries])

  const handleMoodSelect = (mood: number) => {
    setCurrentEntry((prev) => ({ ...prev, mood }))
  }

  const handleJournalChange = (content: string) => {
    setCurrentEntry((prev) => ({ ...prev, content }))
  }

  const handleSave = () => {
    const entryIndex = entries.findIndex((e) => e.date === currentEntry.date)
    if (entryIndex !== -1) {
      setEntries((prev) => [...prev.slice(0, entryIndex), currentEntry, ...prev.slice(entryIndex + 1)])
    } else {
      setEntries((prev) => [...prev, currentEntry])
    }
  }

  return (
    <main className="container mx-auto p-4 max-w-4xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Mood Journal</h1>
        <ThemeToggle />
      </div>
      <div className="grid gap-6">
        <Card className="p-6">
          <MoodPicker onMoodSelect={handleMoodSelect} selectedMood={currentEntry.mood} />
          <JournalEntry entry={currentEntry} onChange={handleJournalChange} onSave={handleSave} />
        </Card>
        <Card className="p-6">
          <MoodCalendar entries={entries} currentDate={currentDate} onSelectDate={setCurrentDate} />
        </Card>
      </div>
    </main>
  )
}

