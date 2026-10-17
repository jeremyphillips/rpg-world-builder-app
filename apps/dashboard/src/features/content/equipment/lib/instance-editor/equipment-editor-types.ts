import type { EquipmentEffectTarget } from '@rpg/contracts'
import type { EquipmentInstance } from '@rpg/contracts'

export type EquipmentEditorScope = 'one' | 'all'

export type EquipmentEditorSession = {
  sourceEntryId: string
  scope: EquipmentEditorScope
  draft: EquipmentInstance
  openedSnapshot: EquipmentInstance
}

export type EffectDraft = {
  effectId?: string
  target?: EquipmentEffectTarget
  bonus: number
  notes?: string
}

export type PropertyBrowseDraft = {
  query: string
  category: 'all' | 'enhancement'
}

export type CustomPropertyDraft = {
  customId?: string
  name: string
  description: string
}

export type EquipmentEditorMode =
  | { kind: 'scope' }
  | { kind: 'main' }
  | { kind: 'effectChoose'; draft: EffectDraft; returnTo: 'main' | 'effectForm' }
  | { kind: 'effectForm'; draft: EffectDraft; origin: 'new' | 'existing' }
  | { kind: 'propertyBrowse'; draft: PropertyBrowseDraft }
  | {
      kind: 'propertyCreate'
      draft: CustomPropertyDraft
      origin: 'browse' | 'direct' | 'existing'
    }

export type EquipmentEditorState = {
  session: EquipmentEditorSession
  mode: EquipmentEditorMode
}

export type EquipmentEditorAction =
  | { type: 'setScope'; scope: EquipmentEditorScope }
  | { type: 'continueFromScope' }
  | { type: 'patchDraft'; patch: Partial<EquipmentInstance> }
  | { type: 'setMagical'; magical: boolean }
  | { type: 'openEffectChoose'; draft?: EffectDraft; returnTo?: 'main' | 'effectForm' }
  | { type: 'openEffectForm'; draft: EffectDraft; origin: 'new' | 'existing' }
  | { type: 'commitEffectDraft'; draft: EffectDraft; replace?: boolean }
  | { type: 'removeEffect'; effectId: string }
  | { type: 'openPropertyBrowse'; draft?: PropertyBrowseDraft }
  | {
      type: 'openPropertyCreate'
      draft?: CustomPropertyDraft
      origin: 'browse' | 'direct' | 'existing'
    }
  | { type: 'commitPresetProperty'; propertyId: string; replacePropertyId?: string }
  | { type: 'commitCustomProperty'; draft: CustomPropertyDraft; replaceCustomId?: string }
  | { type: 'removeMagicProperty'; id: string; kind: 'preset' | 'custom' }
  | { type: 'back' }
  | { type: 'cancelSubMode' }
