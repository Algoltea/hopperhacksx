"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"

interface JournalEntryProps {
  entry: { content: string; mood: number }
  onChange: (content: string) => void
  onSave: () => void
}

export default function JournalEntry({ entry, onChange, onSave }: JournalEntryProps) {
  const [charCount, setCharCount] = useState(0)

  useEffect(() => {
    setCharCount(entry.content.length)
  }, [entry.content])

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const content = e.target.value
    onChange(content)
    setCharCount(content.length)
  }

  const getMoodPlaceholder = () => {
    switch (entry.mood) {
      case 1:
        return "Feeling down? Write about what's troubling you..."
      case 2:
        return "Not your best day? Reflect on what's bothering you..."
      case 3:
        return "How's your day going? Start writing..."
      case 4:
        return "Feeling good? Share what's bringing you joy..."
      case 5:
        return "Excited about something? Let it all out here..."
      default:
        return "How are you feeling today? Start writing..."
    }
  }

  return (
    <div className="space-y-4">
      <Textarea
        value={entry.content}
        onChange={handleChange}
        placeholder={getMoodPlaceholder()}
        className={`h-40 border-l-4 ${entry.mood ? `border-mood-${entry.mood}` : "border-gray-200"}`}
        maxLength={500}
      />
      <div className="flex justify-between items-center">
        <span className="text-sm text-muted-foreground">{charCount}/500</span>
        <Button onClick={onSave}>Save</Button>
      </div>
    </div>
  )
}

