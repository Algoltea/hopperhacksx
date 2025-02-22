"use client"

import { useState } from "react"
import { format, startOfWeek, addDays, isSameMonth, isSameDay } from "date-fns"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"

interface Entry {
  date: string
  mood: number
}

interface MoodCalendarProps {
  entries: Entry[]
  currentDate: string
  onSelectDate: (date: string) => void
}

export default function MoodCalendar({ entries, currentDate, onSelectDate }: MoodCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date(currentDate))

  const renderHeader = () => {
    return (
      <div className="flex justify-between items-center mb-4">
        <Button variant="outline" size="icon" onClick={prevMonth}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <h2 className="text-lg font-semibold">{format(currentMonth, "MMMM yyyy")}</h2>
        <Button variant="outline" size="icon" onClick={nextMonth}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    )
  }

  const renderDays = () => {
    const dateFormat = "EEEEEE"
    const days = []
    const startDate = startOfWeek(currentMonth)

    for (let i = 0; i < 7; i++) {
      days.push(
        <div key={i} className="text-center font-medium text-sm text-muted-foreground">
          {format(addDays(startDate, i), dateFormat)}
        </div>,
      )
    }

    return <div className="grid grid-cols-7 gap-1 mb-2">{days}</div>
  }

  const renderCells = () => {
    const monthStart = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1)
    const startDate = startOfWeek(monthStart)
    const rows = []

    let days = []
    let day = startDate
    let formattedDate = ""

    for (let i = 0; i < 42; i++) {
      formattedDate = format(day, "yyyy-MM-dd")
      const entry = entries.find((e) => e.date === formattedDate)
      days.push(
        <div
          key={i}
          onClick={() => onSelectDate(formattedDate)}
          className={`p-2 text-center cursor-pointer transition-colors ${
            isSameMonth(day, monthStart) ? "hover:bg-muted" : "text-muted-foreground hover:bg-muted/50"
          } ${isSameDay(day, new Date(currentDate)) ? "bg-primary text-primary-foreground" : ""}`}
        >
          <div className="text-sm">{format(day, "d")}</div>
          {entry && <div className={`w-2 h-2 mx-auto mt-1 rounded-full bg-mood-${entry.mood}`}></div>}
        </div>,
      )

      if ((i + 1) % 7 === 0) {
        rows.push(
          <div key={day.toString()} className="grid grid-cols-7 gap-1">
            {days}
          </div>,
        )
        days = []
      }
      day = addDays(day, 1)
    }
    return <div className="grid gap-1">{rows}</div>
  }

  const nextMonth = () => {
    setCurrentMonth(addDays(currentMonth, 30))
  }

  const prevMonth = () => {
    setCurrentMonth(addDays(currentMonth, -30))
  }

  return (
    <div className="w-full max-w-md mx-auto">
      {renderHeader()}
      {renderDays()}
      {renderCells()}
    </div>
  )
}

