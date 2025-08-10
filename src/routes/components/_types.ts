import type { SimulationNodeDatum } from 'd3'

export type ColorMode = 'ups' | 'sentiment'
export type ChikaPost = {
  author?: string
  comments?: number
  date: Date
  id: string
  link_flair_text?: string
  locked: unknown
  media: unknown
  media_metadata: unknown
  month_rank: number
  num_comments: number
  num_reports?: number
  over_18: unknown
  overall_rank: number
  parsed_media: unknown
  people: string[]
  permalink: string
  pinned: unknown
  reaction: string
  selftext: string
  tags: string[]
  title: string
  total_awards_received?: number
  ups: number
  year_month: Date
}
export type SimulationNode = ChikaPost &
  SimulationNodeDatum & {
    radius: number
    upsized: boolean
  }
export type Sentiment = 'positive' | 'neutral' | 'negative'
