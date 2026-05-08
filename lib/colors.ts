import { ColorTheme } from './types'

export const COLOR_THEMES: Record<ColorTheme, { gradient: string; label: string }> = {
  'rose-violet': {
    gradient: 'from-rose-400 to-violet-500',
    label: 'Rose',
  },
  'sky-indigo': {
    gradient: 'from-sky-400 to-indigo-500',
    label: 'Sky',
  },
  'amber-orange': {
    gradient: 'from-amber-400 to-orange-500',
    label: 'Amber',
  },
  'emerald-teal': {
    gradient: 'from-emerald-400 to-teal-500',
    label: 'Emerald',
  },
  'pink-peach': {
    gradient: 'from-pink-400 to-orange-300',
    label: 'Peach',
  },
  'lavender-blue': {
    gradient: 'from-violet-400 to-blue-400',
    label: 'Lavender',
  },
}

export const COLOR_THEME_KEYS = Object.keys(COLOR_THEMES) as ColorTheme[]
