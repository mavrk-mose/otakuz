"use client"

import { Calendar } from "@/components/ui/calendar"
import { Card } from "@/components/ui/card"
import { useState } from "react"
import { addDays, format } from "date-fns"

const MOCK_RELEASES = {
  "2024-03-20": ["Attack on Titan Final Season", "My Hero Academia S7"],
  "2024-03-21": ["One Piece Episode 1054", "Black Clover Movie"],
  "2024-03-22": ["Demon Slayer S4", "Jujutsu Kaisen OVA"],
}

export default function AnimeCalendar() {
  const [date, setDate] = useState<Date | undefined>(new Date())
  
  const selectedDateStr = date ? format(date, 'yyyy-MM-dd') : ''
  const releases = MOCK_RELEASES[selectedDateStr as keyof typeof MOCK_RELEASES] || []

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">Anime Release Calendar</h1>
      
      <div className="grid md:grid-cols-2 gap-8">
        <Card className="p-6">
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            className="rounded-md border"
          />
        </Card>

        <Card className="p-6">
          <h2 className="text-2xl font-semibold mb-4">
            {date ? format(date, 'MMMM d, yyyy') : 'Select a date'}
          </h2>
          
          {releases.length > 0 ? (
            <ul className="space-y-4">
              {releases.map((release, index) => (
                <li key={index} className="flex items-center gap-4">
                  <div className="h-2 w-2 rounded-full bg-primary" />
                  <span>{release}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-muted-foreground">
              No anime releases scheduled for this date.
            </p>
          )}
        </Card>
      </div>

      <div className="mt-8">
        <h3 className="text-xl font-semibold mb-4">Upcoming Releases</h3>
        <div className="grid md:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => {
            const futureDate = addDays(new Date(), i + 1)
            return (
              <Card key={i} className="p-4">
                <p className="font-medium mb-2">
                  {format(futureDate, 'MMMM d, yyyy')}
                </p>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>Upcoming Release {i + 1}</li>
                  <li>Upcoming Release {i + 2}</li>
                </ul>
              </Card>
            )
          })}
        </div>
      </div>
    </div>
  )
}