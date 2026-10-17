import { useMemo } from 'react'

import type { ContentFormCtx } from '../../lib/forms/registry/content-form-registry'
import { deriveMonsterFormDraft } from '../lib/monster-form-derivation'
import type { MonsterFormValues } from '../lib/monster-form-values'

export function useMonsterSkillCatalogSlotData(
  ctx: ContentFormCtx,
  values: MonsterFormValues | undefined,
) {
  const skillsReady = ctx.skillCatalogStatus === 'ready'
  const skillOptions = ctx.options?.skills?.visible ?? []
  const skillRows = values?.proficiencies?.skills ?? []
  const selected = useMemo(() => new Set(skillRows.map((row) => row.skill)), [skillRows])

  const derived = skillsReady && values ? deriveMonsterFormDraft(values, ctx) : null
  const proficiencyBonus =
    derived?.challenge.status === 'resolved' ? derived.challenge.value.proficiencyBonus : undefined

  const addOptions = useMemo(
    () =>
      skillOptions
        .filter((skill) => !selected.has(skill.id))
        .map((skill) => ({
          value: skill.id,
          label: skill.name,
          description: skill.description,
        })),
    [skillOptions, selected],
  )

  const passivePerception =
    skillsReady && derived?.passivePerception.status === 'resolved'
      ? derived.passivePerception.value
      : undefined

  return {
    skillsReady,
    skillOptions,
    derived,
    proficiencyBonus,
    addOptions,
    passivePerception,
  }
}
