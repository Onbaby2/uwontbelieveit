"use client"

import { Heart } from "lucide-react"

interface AnimatedHeartProps {
  isLiked: boolean
  onToggle: () => void
  size?: "sm" | "md" | "lg"
  disabled?: boolean
}

export default function AnimatedHeart({ isLiked, onToggle, size = "md", disabled = false }: AnimatedHeartProps) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6"
  }

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (disabled) return
    onToggle()
  }

  return (
    <div 
      className={`${sizeClasses[size]} cursor-pointer`}
      onClick={handleClick}
      role="button"
      aria-pressed={isLiked}
      tabIndex={0}
      onKeyDown={e => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault()
          if (!disabled) {
            onToggle()
          }
        }
      }}
    >
      <Heart 
        className={`w-full h-full transition-colors ${isLiked ? 'fill-red-500 text-red-500' : 'text-gray-400 hover:text-gray-600'}`}
      />
    </div>
  )
} 