import React from "react"

interface LoadingProps {
  size?: "sm" | "md" | "lg"
  className?: string
  fullScreen?: boolean
}

export function Loading({ size = "md", className = "", fullScreen = false }: LoadingProps) {
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-12 h-12", 
    lg: "w-16 h-16"
  }

  const loadingContent = (
    <div className={`newtons-cradle ${sizeClasses[size]} ${className}`}>
      <div className="newtons-cradle__dot"></div>
      <div className="newtons-cradle__dot"></div>
      <div className="newtons-cradle__dot"></div>
      <div className="newtons-cradle__dot"></div>
    </div>
  )

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
        {loadingContent}
      </div>
    )
  }

  return loadingContent
} 