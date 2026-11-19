import type { ContentFormCtx } from '../../../../../lib/forms/registry/content-form-registry'
import { MonsterEquipmentPanel } from '../../equipment/equipment-panel'

export function EquipmentSlot({ ctx }: { ctx: ContentFormCtx }) {
  return <MonsterEquipmentPanel ctx={ctx} />
}
