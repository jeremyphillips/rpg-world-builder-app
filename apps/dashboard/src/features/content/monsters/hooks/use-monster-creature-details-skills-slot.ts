import { useState } from 'react'
import { useFormContext, useWatch } from 'react-hook-form'

import type { ContentFormCtx } from '../../lib/forms/registry/content-form-registry'
import { resolveStrictCatalogWriteGateReason } from '../../lib/forms/shells/layout/content-form-catalog-write-gate.lib'
import { useReportContentFormWriteGate } from '../../lib/forms/shells/layout/content-form-write-gate'
import { MONSTER_SKILL_ERROR, MONSTER_SKILL_LOADING } from '../lib/monster-form-labels'
import type { MonsterFormValues } from '../lib/monster-form-values'
import { useMonsterSkillCatalogSlotData } from './use-monster-skill-catalog-slot-data'

export function useMonsterCreatureDetailsSkillsSlot(ctx: ContentFormCtx) {
  const form = useFormContext<MonsterFormValues>()
  const values = useWatch<MonsterFormValues>() as MonsterFormValues | undefined
  const catalog = useMonsterSkillCatalogSlotData(ctx, values)
  const [addSkillKey, setAddSkillKey] = useState(0)

  useReportContentFormWriteGate(
    'strict',
    resolveStrictCatalogWriteGateReason(ctx.skillCatalogStatus, {
      loading: MONSTER_SKILL_LOADING,
      error: MONSTER_SKILL_ERROR,
    }),
  )

  function addSkill(skillId: string) {
    if (!values?.proficiencies) return
    form.setValue(
      'proficiencies.skills',
      [{ skill: skillId, rank: 'proficient' as const }, ...values.proficiencies.skills],
      { shouldDirty: true },
    )
    setAddSkillKey((key) => key + 1)
  }

  if (!values?.proficiencies) return null

  return {
    form,
    values,
    ctx,
    addSkillKey,
    addSkill,
    ...catalog,
  }
}

export type MonsterCreatureDetailsSkillsSlotState = NonNullable<
  ReturnType<typeof useMonsterCreatureDetailsSkillsSlot>
>
