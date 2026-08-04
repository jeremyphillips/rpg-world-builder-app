import type { CharacterEquipmentEntry, CharacterSpellEntry, Equipment, Spell } from '@rpg/contracts'

import { getContentTypeItemLabel } from '@/features/content'
import type {
  CharacterSheetEquipmentCard,
  CharacterSheetSpellCard,
} from './character-sheet-catalog'
import {
  buildMissingCatalogCard,
  buildResolvedCatalogCard,
} from './character-sheet-catalog-card.lib'

export function resolvedEquipmentSheetCardFixture(
  equipment: Equipment,
  id: string,
  options: {
    bucket?: CharacterSheetEquipmentCard['bucket']
    quantity?: number
    equipped?: boolean
    entry?: Partial<CharacterEquipmentEntry>
  } = {},
): CharacterSheetEquipmentCard {
  const entry: CharacterEquipmentEntry = {
    equipmentId: equipment.id,
    quantity: options.quantity ?? 1,
    sources: [{ kind: 'manual' }],
    ...options.entry,
  }

  return buildResolvedCatalogCard(
    {
      id,
      displayName: equipment.name,
      referenceId: equipment.id,
      bucket: options.bucket ?? 'weapons',
      quantity: options.quantity ?? 1,
      equipped: options.equipped ?? false,
      sources: [{ label: 'Manual' }],
    },
    entry,
    equipment,
    'equipment',
  )
}

export function resolvedSpellSheetCardFixture(
  spell: Spell,
  id = spell.id,
  options: {
    prepared?: boolean
    entry?: Partial<CharacterSpellEntry>
  } = {},
): CharacterSheetSpellCard {
  const entry: CharacterSpellEntry = {
    spellId: spell.id,
    sources: [{ kind: 'classSpellcasting', sourceId: 'srd-cc-5.2.1:wizard', grantId: 'cantrips' }],
    access: { classKnown: true },
    selection: { prepared: options.prepared ?? true },
    ...options.entry,
  }

  return buildResolvedCatalogCard(
    {
      id,
      displayName: spell.name,
      referenceId: spell.id,
      prepared: options.prepared ?? true,
      sources: [{ label: getContentTypeItemLabel('classes') }],
    },
    entry,
    spell,
    'spell',
  )
}

export function missingEquipmentSheetCardFixture(
  referenceId: string,
  id = referenceId,
): CharacterSheetEquipmentCard {
  const entry: CharacterEquipmentEntry = {
    equipmentId: referenceId,
    quantity: 1,
    sources: [{ kind: 'manual' }],
  }

  return buildMissingCatalogCard(
    {
      id,
      displayName: referenceId,
      referenceId,
      bucket: 'gear',
      quantity: 1,
      equipped: false,
      sources: [{ label: 'Manual' }],
    },
    entry,
  )
}

export function missingSpellSheetCardFixture(
  referenceId: string,
  id = `${referenceId}:0`,
): CharacterSheetSpellCard {
  const entry: CharacterSpellEntry = {
    spellId: referenceId,
    sources: [{ kind: 'manual' }],
    access: {},
  }

  return buildMissingCatalogCard(
    {
      id,
      displayName: referenceId,
      referenceId,
      prepared: false,
      sources: [{ label: 'Manual' }],
    },
    entry,
  )
}
