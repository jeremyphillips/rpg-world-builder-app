import type { ContentFormCtx } from '../../../../../lib/forms/registry/content-form-registry'
import { MonsterStatisticsPanel } from '../../monster-statistics-panel'

export function AbilityScoresSlot({ ctx }: { ctx: ContentFormCtx }) {
  return <MonsterStatisticsPanel ctx={ctx} />
}
