import { formatSignedModifier, getContentTypeTerm } from '@rpg/contracts'
import type { PreviewRailFact } from '@rpg/ui'

import type { ContentFormCtx } from '../../lib/forms/registry/content-form-registry'
import type {
  ContentPreviewIdentity,
  ContentPreviewSection,
} from '../../lib/forms/preview/content-form-preview.types'
import { deriveMonsterFormDraft } from './monster-form-derivation'
import { MONSTER_HP_MINIMUM_NOTE } from './monster-form-labels'
import { monsterUnavailableReasonCopy } from './monster-display'
import { MONSTER_FORM_TAB } from './monster-form-view'
import type { MonsterFormValues } from './monster-form-values'

function fact(label: string, value: string): PreviewRailFact {
  return { label, value }
}

export function buildMonsterPreviewIdentity(values: MonsterFormValues): ContentPreviewIdentity {
  const name = values.name.trim() || `Untitled ${getContentTypeTerm('monsters').label}`
  return { name }
}

function unavailableText(
  reason: Parameters<typeof monsterUnavailableReasonCopy>[0],
  subject: Parameters<typeof monsterUnavailableReasonCopy>[1],
): string {
  return `— ${monsterUnavailableReasonCopy(reason, subject)}`
}

function formatPreviewAc(derived: ReturnType<typeof deriveMonsterFormDraft>): string {
  if (derived?.ac.status === 'resolved') return String(derived.ac.value.ac)
  if (derived?.ac.status === 'unavailable') return unavailableText(derived.ac.reason, 'armor')
  return '—'
}

function formatPreviewHp(derived: ReturnType<typeof deriveMonsterFormDraft>): string {
  if (derived?.hp.status === 'resolved') {
    const note = derived.hp.value.clampedToMinimum ? ` ${MONSTER_HP_MINIMUM_NOTE}` : ''
    return `${derived.hp.value.hp}${note}`
  }
  if (derived?.hp.status === 'unavailable') return unavailableText(derived.hp.reason, 'generic')
  return '—'
}

function formatPreviewChallenge(
  values: MonsterFormValues,
  derived: ReturnType<typeof deriveMonsterFormDraft>,
  skillsReady: boolean,
): string {
  if (!skillsReady || !values.challengeRating) return '—'
  if (derived?.challenge.status === 'resolved') {
    return `XP ${derived.challenge.value.experiencePoints} PB ${formatSignedModifier(derived.challenge.value.proficiencyBonus)}`
  }
  if (derived?.challenge.status === 'unavailable') {
    return monsterUnavailableReasonCopy(derived.challenge.reason, 'challenge')
  }
  return '—'
}

export function buildMonsterPreviewSections(
  values: MonsterFormValues,
  ctx: ContentFormCtx,
): Record<string, ContentPreviewSection | null> {
  const derived = deriveMonsterFormDraft(values, ctx)
  const skillsReady = ctx.skillCatalogStatus === 'ready'
  const ac = formatPreviewAc(derived)
  const hp = formatPreviewHp(derived)
  const initiative =
    derived?.initiative.status === 'resolved' ? derived.initiative.value.label : '—'
  const challenge = formatPreviewChallenge(values, derived, skillsReady)

  const statistics: ContentPreviewSection = {
    derivedKind: 'ready',
    facts: [fact('AC', ac), fact('HP', hp), fact('Initiative', initiative), fact('CR', challenge)],
  }

  return {
    [MONSTER_FORM_TAB.identity]: { derivedKind: 'ready', description: values.description },
    [MONSTER_FORM_TAB.statistics]: statistics,
    [MONSTER_FORM_TAB.creatureDetails]: skillsReady ? { derivedKind: 'count' } : null,
    [MONSTER_FORM_TAB.equipment]: { derivedKind: 'count' },
    [MONSTER_FORM_TAB.traits]: null,
    [MONSTER_FORM_TAB.actions]: null,
  }
}
