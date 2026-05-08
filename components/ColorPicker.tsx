'use client'

import { ColorTheme } from '@/lib/types'
import { COLOR_THEMES, COLOR_THEME_KEYS } from '@/lib/colors'

interface ColorPickerProps {
  value: ColorTheme
  onChange: (theme: ColorTheme) => void
}

export default function ColorPicker({ value, onChange }: ColorPickerProps) {
  return (
    <div className="flex gap-3 flex-wrap">
      {COLOR_THEME_KEYS.map((key) => {
        const theme = COLOR_THEMES[key]
        const isSelected = value === key
        return (
          <button
            key={key}
            type="button"
            onClick={() => onChange(key)}
            title={theme.label}
            className={`w-9 h-9 rounded-full bg-gradient-to-br ${theme.gradient} transition-all duration-200 ${
              isSelected
                ? 'ring-2 ring-offset-2 ring-gray-800 scale-110'
                : 'hover:scale-105 opacity-80 hover:opacity-100'
            }`}
          />
        )
      })}
    </div>
  )
}
