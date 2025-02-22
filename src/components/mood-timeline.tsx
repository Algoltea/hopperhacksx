import { ScrollArea } from "@/components/ui/scroll-area"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

interface Entry {
  date: string
  mood: {
    type: string
    intensity: number
  }
  content: string
}

interface MoodTimelineProps {
  entries: Entry[]
  onSelectEntry: (entry: Entry) => void
}

export default function MoodTimeline({ entries, onSelectEntry }: MoodTimelineProps) {
  const sortedEntries = [...entries].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  return (
    <ScrollArea className="h-[400px]">
      <Accordion type="single" collapsible className="w-full">
        {sortedEntries.map((entry) => (
          <AccordionItem key={entry.date} value={entry.date}>
            <AccordionTrigger
              className={`border-l-4 border-mood-${entry.mood.type}-${entry.mood.intensity * 100} pl-2`}
              onClick={() => onSelectEntry(entry)}
            >
              <div className="flex justify-between w-full">
                <span>{entry.date}</span>
                <span className="text-sm text-gray-500">{entry.content.slice(0, 40)}...</span>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="p-4 bg-gray-50 rounded-md">{entry.content}</div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </ScrollArea>
  )
}

