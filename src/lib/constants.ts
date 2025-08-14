export const COLORS = {
  black: 'black',
  lightGray: '#e5e7eb',
  lightOrange: '#fcdacc',
  darkOrange: '#ff4500',
  green: '#22c55e',
  red: '#f87171',
  gray: '#6b7280'
} as const

export const REACTIONS: Record<string, string> = {
  respect: 'positive',
  happy: 'positive',
  funny: 'positive',
  supportive: 'positive',
  shocked: 'neutral',
  interested: 'neutral',
  neutral: 'neutral',
  mixed: 'neutral',
  sad: 'negative',
  annoyed: 'negative',
  angry: 'negative'
} as const

export const TAGS: string[] = [
  'celebrity',
  'influencer',
  'politics',
  'cheating',
  'speculation',
  'lovelife',
  'other news'
] as const
