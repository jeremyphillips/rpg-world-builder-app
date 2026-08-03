import type { BuildingFunctionFamily } from '../building-function-family'

export type BuildingArchetypeShardEntry = {
  readonly label: string
  readonly description: string
  readonly functions: readonly [BuildingFunctionFamily, BuildingFunctionFamily?]
  readonly manifestationOf?: string
  readonly searchTerms?: readonly string[]
}
