import { Button } from "@/components/ui/button"

const moods = [
  { emoji: "😢", value: 1 },
  { emoji: "😕", value: 2 },
  { emoji: "😐", value: 3 },
  { emoji: "🙂", value: 4 },
  { emoji: "😄", value: 5 },
]

interface MoodPickerProps {
  onMoodSelect: (mood: number) => void
  selectedMood: number
}

export default function MoodPicker({ onMoodSelect, selectedMood }: MoodPickerProps) {
  return (
    <div className="flex justify-between mb-6">
      {moods.map((mood) => (
        <Button
          key={mood.value}
          onClick={() => onMoodSelect(mood.value)}
          variant={selectedMood === mood.value ? "default" : "outline"}
          className={`text-2xl w-12 h-12 p-0 ${
            selectedMood === mood.value ? `bg-mood-${mood.value} hover:bg-mood-${mood.value}` : ""
          }`}
        >
          {mood.emoji}
        </Button>
      ))}
    </div>
  )
}

