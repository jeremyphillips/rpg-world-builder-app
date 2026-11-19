import type { ContentFormCtx } from '../../../../../lib/forms/registry/content-form-registry'
import { MonsterArmorSlotBody } from '../../monster-armor-slot'

export function BodyArmorSlot({ ctx }: { ctx: ContentFormCtx }) {
  return <MonsterArmorSlotBody slot="body-armor" ctx={ctx} />
}

export function ShieldSlot({ ctx }: { ctx: ContentFormCtx }) {
  return <MonsterArmorSlotBody slot="shield" ctx={ctx} />
}
