"use client"

import { useTheme } from "@/components/theme-provider"

export function ThemeSwitch() {
  const { theme, setTheme } = useTheme()

  const handleToggle = () => {
    setTheme(theme === "light" ? "dark" : "light")
  }

  return (
    <div className="flex items-center" title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}>
      <label className="switch" style={{ transform: 'scale(0.8)' }}>
        <input
          type="checkbox"
          checked={theme === "light"}
          onChange={handleToggle}
          aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        />
        <div className="slider">
          <div className="star star_1"></div>
          <div className="star star_2"></div>
          <div className="star star_3"></div>
          <svg className="cloud" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M7 15C4.79086 15 3 13.2091 3 11C3 8.79086 4.79086 7 7 7C7.5 7 7.9 7.1 8.3 7.3C8.7 5.9 9.9 5 11.3 5C13.2 5 14.8 6.6 14.8 8.5C14.8 8.9 14.7 9.2 14.6 9.6C15.1 9.2 15.8 9 16.5 9C18.4 9 20 10.6 20 12.5C20 14.4 18.4 16 16.5 16H7Z" fill="white"/>
          </svg>
        </div>
      </label>
    </div>
  )
} 