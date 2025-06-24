"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface ToastProps {
  id?: number
  title?: string
  description?: string
  variant?: "default" | "destructive"
  className?: string
}

export function Toast({ title, description, variant = "default", className }: ToastProps) {
  return (
    <div
      className={cn(
        "fixed top-4 right-4 z-50 w-full max-w-sm rounded-lg border bg-background p-4 shadow-lg",
        variant === "destructive" && "border-destructive bg-destructive/10",
        className
      )}
    >
      {title && (
        <div className={cn(
          "font-semibold",
          variant === "destructive" ? "text-destructive" : "text-foreground"
        )}>
          {title}
        </div>
      )}
      {description && (
        <div className={cn(
          "text-sm mt-1",
          variant === "destructive" ? "text-destructive/80" : "text-muted-foreground"
        )}>
          {description}
        </div>
      )}
    </div>
  )
}

export function useToast() {
  const [toasts, setToasts] = React.useState<ToastProps[]>([])

  const toast = React.useCallback(({ title, description, variant }: ToastProps) => {
    const id = Date.now()
    const newToast = { title, description, variant, id }
    
    setToasts(prev => [...prev, newToast])
    
    // Auto remove after 5 seconds
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, 5000)
  }, [])

  return { toast, toasts }
} 