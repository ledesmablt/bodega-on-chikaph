import type { SimulationNodeDatum } from 'd3'

export type ColorMode = 'ups' | 'sentiment'
export type ChikaPost = any // TODO: fix
export type SimulationNode = ChikaPost & SimulationNodeDatum
