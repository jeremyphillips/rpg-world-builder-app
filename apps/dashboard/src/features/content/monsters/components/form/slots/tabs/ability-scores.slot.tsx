import type { ContentFormCtx } from '../../../../../lib/forms/registry/content-form-registry'
import { MonsterStatisticsPanel } from '../../statistics/statistics-panel'

export function AbilityScoresSlot({ ctx }: { ctx: ContentFormCtx }) {
  return <MonsterStatisticsPanel ctx={ctx} />
}
