import type { FormItem } from '@rpg/ui/form'

import type { ContentFormCtx } from '../../../../lib/forms/registry/content-form-registry'
import type { MonsterActionSection } from '../references/monster-action-equipment-references'
import type { MonsterActionDraftRow } from '../monster-action-presets'
import type { MonsterActionAcquisitionChoice } from '../acquisition/monster-action-acquisition'
import type { MonsterFormValues } from '../../monster-form-values'
import { monsterMultiattackFormFields } from './monster-multiattack-form-fields'
import {
  multiattackExecutableUseOptions,
  multiattackPrerequisiteOptions,
  multiattackReplacementChoiceOptions,
  multiattackTargetAttackOptions,
} from './monster-multiattack-form-options'

type MultiattackDraft = Extract<MonsterActionDraftRow, { kind: 'multiattack' }>

export function monsterMultiattackMechanicFields(input: {
  namePrefix: string
  section: MonsterActionSection
  action: MultiattackDraft
  ctx: ContentFormCtx
  attackOptions: { value: string; label: string }[]
  actionRows?: MonsterActionDraftRow[]
  bonusActionRows?: MonsterActionDraftRow[]
  weapons?: readonly { entryId: string; label: string; equipped: boolean }[]
  weaponActions?: readonly { id: string; equipmentEntryId?: string }[]
  allowAddWeapon?: boolean
  onAcquireAttack?: (
    section: MonsterActionSection,
    choice: Exclude<MonsterActionAcquisitionChoice, { type: 'add-weapon' }>,
  ) => void
}): FormItem[] {
  const actionRows = input.actionRows ?? []
  const bonusActionRows = input.bonusActionRows ?? []
  const eligibilityValues = {
    actions: actionRows,
    bonusActions: bonusActionRows,
  } as MonsterFormValues
  const replacementOptions = multiattackReplacementChoiceOptions(
    actionRows,
    input.action.id,
    eligibilityValues,
    input.ctx,
  )

  return monsterMultiattackFormFields({
    namePrefix: input.namePrefix,
    section: input.section,
    action: input.action,
    ctx: input.ctx,
    attackOptions: input.attackOptions,
    useOptions: multiattackExecutableUseOptions(
      actionRows,
      input.action.id,
      eligibilityValues,
      input.ctx,
    ),
    replacementOptions,
    prerequisiteOptions: multiattackPrerequisiteOptions(
      actionRows,
      bonusActionRows,
      input.action.id,
      eligibilityValues,
      input.ctx,
    ),
    targetAttackOptions: multiattackTargetAttackOptions(
      input.action.steps,
      actionRows,
      eligibilityValues,
      input.ctx,
    ),
    actionRows,
    hasAttackOptions: input.attackOptions.length > 0,
    canConfigureReplacement: replacementOptions.length > 0,
    weapons: input.weapons ?? [],
    weaponActions: input.weaponActions ?? [],
    allowAddWeapon: input.allowAddWeapon ?? false,
    onAcquireAttack: input.onAcquireAttack,
  })
}
