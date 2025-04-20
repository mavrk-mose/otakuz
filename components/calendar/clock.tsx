"use client"

import { useState, useEffect } from "react"
import { format } from "date-fns"

export function RealtimeClock() {
    const [time, setTime] = useState(new Date())
  
    useEffect(() => {
      const timer = setInterval(() => {
        setTime(new Date())
      }, 1000)
  
      return () => {
        clearInterval(timer)
      }
    }, [])
  
    const getGMTOffset = () => {
      const offset = time.getTimezoneOffset()
      const hours = Math.abs(Math.floor(offset / 60))
      const minutes = Math.abs(offset % 60)
      const sign = offset <= 0 ? "+" : "-"
  
      return `${sign}${hours.toString().padStart(2, "0")}${minutes.toString().padStart(2, "0")}`
    }
  
    return (
      <div className="bg-card rounded-full px-4 py-2 text-sm font-mono">
        (GMT{getGMTOffset()}) {format(time, "dd/MM/yyyy HH:mm:ss")}
      </div>
    )
  }