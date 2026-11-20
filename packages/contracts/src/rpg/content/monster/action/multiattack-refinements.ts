import { z } from 'zod'

import { addCustomRefinementIssue } from '../../../../lib/add-custom-refinement-issue'
import {
  isMultiattackAttackGroup,
  isMultiattackUseClause,
  type MultiattackDraftStep,
} from './multiattack-schemas'
import {
  multiattackEligibilityKinds,
  multiattackRowEligibleForPurpose,
} from './multiattack-eligibility'
import { multiattackValidationMessages } from './multiattack-validation-messages'
import {
  MULTIATTACK_REFERENCE_SELF_MESSAGE,
  MULTIATTACK_SECTION_MESSAGE,
} from './reference-messages'

type ActionRow = { id?: string; kind?: string; spells?: readonly { spellId?: string }[] }

type MultiattackRow = {
  id?: string
  kind?: string
  steps?: readonly MultiattackDraftStep[]
  replacement?: {
    count?: number
    choices?: readonly { actionId?: string; spellId?: string }[]
    replacesActionId?: string
    attackWord?: 'any'
    whenAvailable?: true
  }
  alternative?: {
    steps?: readonly MultiattackDraftStep[]
    afterUsingActionId?: string
  }
}

function pathOf(base: (string | number)[], ...rest: (string | number)[]): (string | number)[] {
  return [...base, ...rest]
}

function attackGroupCount(step: { count?: number }): number | undefined {
  return typeof step.count === 'number' && Number.isInteger(step.count) ? step.count : undefined
}

function primaryAttackGroupTotal(steps: readonly MultiattackDraftStep[]): number | undefined {
  let total = 0
  for (const step of steps) {
    if (!isMultiattackAttackGroup(step)) continue
    const count = attackGroupCount(step)
    if (count === undefined || count < 1) return undefined
    total += count
  }
  return total
}

function targetedAttackTotal(steps: readonly MultiattackDraftStep[], actionId: string): number {
  return steps.reduce((sum, step) => {
    if (!isMultiattackAttackGroup(step)) return sum
    const count = attackGroupCount(step)
    if (count === undefined || count < 1) return sum
    if (step.actionIds.length === 1 && step.actionIds[0] === actionId) return sum + count
    return sum
  }, 0)
}

function refineAttackGroup(
  ownerId: string | undefined,
  step: { count?: number; actionIds?: readonly string[] },
  stepPath: (string | number)[],
  actionsById: ReadonlyMap<string, ActionRow>,
  _bonusById: ReadonlyMap<string, ActionRow>,
  ctx: z.RefinementCtx,
): void {
  const count = attackGroupCount(step)
  if (count === undefined) {
    addCustomRefinementIssue(ctx, multiattackValidationMessages.countWholeNumber(), [
      ...stepPath,
      'count',
    ])
  } else if (count < 1) {
    addCustomRefinementIssue(ctx, multiattackValidationMessages.countAtLeastOne(), [
      ...stepPath,
      'count',
    ])
  }
  const ids = step.actionIds ?? []
  if (ids.length === 0) {
    addCustomRefinementIssue(ctx, multiattackValidationMessages.selectAtLeastOneAttack(), [
      ...stepPath,
      'actionIds',
    ])
    return
  }
  const seen = new Set<string>()
  ids.forEach((id, idIndex) => {
    const idPath = [...stepPath, 'actionIds', idIndex]
    if (ownerId && id === ownerId) {
      addCustomRefinementIssue(ctx, MULTIATTACK_REFERENCE_SELF_MESSAGE, idPath)
    }
    if (seen.has(id)) {
      addCustomRefinementIssue(ctx, multiattackValidationMessages.attackDuplicateInGroup(), idPath)
    }
    seen.add(id)
    const target = actionsById.get(id)
    if (!target) {
      addCustomRefinementIssue(ctx, multiattackValidationMessages.attackUnavailable(), idPath)
      return
    }
    if (
      !multiattackRowEligibleForPurpose(target, 'executable-attack', { multiattackId: ownerId })
    ) {
      addCustomRefinementIssue(ctx, multiattackValidationMessages.attackIneligible(), idPath)
    }
  })
}

// fallow-ignore-next-line complexity
function refineUseClause(
  ownerId: string | undefined,
  step: MultiattackDraftStep,
  stepPath: (string | number)[],
  actionsById: ReadonlyMap<string, ActionRow>,
  ctx: z.RefinementCtx,
): void {
  if (!isMultiattackUseClause(step)) return

  const draftUse = step as {
    mode?: 'single' | 'choice'
    actionId?: string
    spellId?: string
    optional?: true
    whenAvailable?: true
    choices?: readonly { actionId?: string; spellId?: string }[]
  }

  if (draftUse.mode === 'choice' || (draftUse.choices && draftUse.choices.length > 0)) {
    if (draftUse.actionId) {
      addCustomRefinementIssue(ctx, multiattackValidationMessages.useModeContradiction(), [
        ...stepPath,
        'mode',
      ])
    }
    if (draftUse.spellId) {
      addCustomRefinementIssue(ctx, multiattackValidationMessages.useSpellOnClause(), [
        ...stepPath,
        'spellId',
      ])
    }
    const choices = draftUse.choices ?? []
    choices.forEach((choice, choiceIndex) => {
      refineReplacementChoice(
        ownerId,
        choice,
        pathOf(stepPath, 'choices', choiceIndex),
        actionsById,
        ctx,
        'use',
      )
    })
    return
  }

  {
    const single = draftUse
    if (single.actionId && single.choices && single.choices.length > 0) {
      addCustomRefinementIssue(ctx, multiattackValidationMessages.useModeContradiction(), [
        ...stepPath,
        'mode',
      ])
    }
    if (single.optional && single.whenAvailable) {
      addCustomRefinementIssue(ctx, multiattackValidationMessages.optionalAndWhenAvailable(), [
        ...stepPath,
        'optional',
      ])
    }
    if (!single.actionId) {
      addCustomRefinementIssue(ctx, multiattackValidationMessages.useActionUnavailable(), [
        ...stepPath,
        'actionId',
      ])
      return
    }
    refineReferencedAction(
      ownerId,
      single.actionId,
      pathOf(stepPath, 'actionId'),
      actionsById,
      'executable-use',
      {
        unavailable: multiattackValidationMessages.useActionUnavailable(),
        ineligible: multiattackValidationMessages.useActionIneligible(),
      },
      ctx,
    )
    if (single.spellId) {
      refineSpellOnAction(
        single.actionId,
        single.spellId,
        pathOf(stepPath, 'spellId'),
        actionsById,
        ctx,
      )
    }
  }
}

function refineReferencedAction(
  ownerId: string | undefined,
  actionId: string,
  idPath: (string | number)[],
  actionsById: ReadonlyMap<string, ActionRow>,
  purpose: 'executable-use' | 'replacement-choice',
  messages: { unavailable: string; ineligible: string },
  ctx: z.RefinementCtx,
): void {
  const target = actionsById.get(actionId)
  if (!target) {
    addCustomRefinementIssue(ctx, messages.unavailable, idPath)
    return
  }
  if (!multiattackRowEligibleForPurpose(target, purpose, { multiattackId: ownerId })) {
    addCustomRefinementIssue(ctx, messages.ineligible, idPath)
  }
}

function refineSpellOnAction(
  actionId: string,
  spellId: string,
  spellPath: (string | number)[],
  actionsById: ReadonlyMap<string, ActionRow>,
  ctx: z.RefinementCtx,
): void {
  const action = actionsById.get(actionId)
  if (!action || action.kind !== 'spell') {
    addCustomRefinementIssue(
      ctx,
      multiattackValidationMessages.replacementActionIneligible(),
      spellPath,
    )
    return
  }
  const hasSpell = action.spells?.some((row) => row.spellId === spellId)
  if (!hasSpell) {
    addCustomRefinementIssue(ctx, multiattackValidationMessages.spellUnavailable(), spellPath)
  }
}

function refineReplacementChoice(
  ownerId: string | undefined,
  choice: { actionId?: string; spellId?: string },
  choicePath: (string | number)[],
  actionsById: ReadonlyMap<string, ActionRow>,
  ctx: z.RefinementCtx,
  mode: 'replacement' | 'use',
): void {
  if (!choice.actionId) {
    addCustomRefinementIssue(
      ctx,
      mode === 'replacement'
        ? multiattackValidationMessages.replacementActionUnavailable()
        : multiattackValidationMessages.useActionUnavailable(),
      [...choicePath, 'actionId'],
    )
    return
  }
  refineReferencedAction(
    ownerId,
    choice.actionId,
    [...choicePath, 'actionId'],
    actionsById,
    'replacement-choice',
    {
      unavailable: multiattackValidationMessages.replacementActionUnavailable(),
      ineligible: multiattackValidationMessages.replacementActionIneligible(),
    },
    ctx,
  )
  if (choice.spellId) {
    refineSpellOnAction(
      choice.actionId,
      choice.spellId,
      [...choicePath, 'spellId'],
      actionsById,
      ctx,
    )
  }
}

// fallow-ignore-next-line complexity
export function refinePublishedMultiattack(
  action: MultiattackRow,
  section: string,
  path: (string | number)[],
  actionsById: ReadonlyMap<string, ActionRow>,
  bonusById: ReadonlyMap<string, ActionRow>,
  ctx: z.RefinementCtx,
): void {
  if (section !== 'actions') {
    addCustomRefinementIssue(ctx, MULTIATTACK_SECTION_MESSAGE, [...path, 'kind'])
    return
  }

  const steps = action.steps ?? []
  const hasAttackGroup = steps.some((step) => isMultiattackAttackGroup(step))
  if (!hasAttackGroup) {
    addCustomRefinementIssue(ctx, multiattackValidationMessages.addAttackGroup(), [
      ...path,
      'steps',
    ])
  }

  steps.forEach((step, stepIndex) => {
    const stepPath = pathOf(path, 'steps', stepIndex)
    if (isMultiattackAttackGroup(step)) {
      refineAttackGroup(action.id, step, stepPath, actionsById, bonusById, ctx)
      return
    }
    refineUseClause(action.id, step, stepPath, actionsById, ctx)
  })

  if (action.replacement && action.alternative) {
    addCustomRefinementIssue(ctx, multiattackValidationMessages.replacementAndAlternative(), [
      ...path,
      'replacement',
    ])
  }

  const replacement = action.replacement
  if (replacement) {
    const count = replacement.count
    if (count === undefined) {
      addCustomRefinementIssue(ctx, multiattackValidationMessages.replacementCountMissing(), [
        ...path,
        'replacement',
        'count',
      ])
    } else if (!Number.isInteger(count)) {
      addCustomRefinementIssue(ctx, multiattackValidationMessages.replacementCountWholeNumber(), [
        ...path,
        'replacement',
        'count',
      ])
    } else if (count < 1) {
      addCustomRefinementIssue(ctx, multiattackValidationMessages.replacementCountAtLeastOne(), [
        ...path,
        'replacement',
        'count',
      ])
    } else {
      const total = primaryAttackGroupTotal(steps)
      if (total !== undefined && count > total) {
        addCustomRefinementIssue(
          ctx,
          multiattackValidationMessages.replacementCountExceedsTotal({ total }),
          [...path, 'replacement', 'count'],
        )
      }
      if (replacement.replacesActionId) {
        const targetTotal = targetedAttackTotal(steps, replacement.replacesActionId)
        if (targetTotal > 0 && count > targetTotal) {
          const name =
            actionsById.get(replacement.replacesActionId)?.kind === 'weapon'
              ? replacement.replacesActionId
              : ((actionsById.get(replacement.replacesActionId) as { name?: string })?.name ??
                'attack')
          addCustomRefinementIssue(
            ctx,
            multiattackValidationMessages.targetedReplacementExceeds({
              total: targetTotal,
              name,
            }),
            [...path, 'replacement', 'count'],
          )
        }
        const validTarget = steps.some(
          (step) =>
            isMultiattackAttackGroup(step) &&
            (step.actionIds ?? []).includes(replacement.replacesActionId!),
        )
        if (!validTarget) {
          addCustomRefinementIssue(ctx, multiattackValidationMessages.replacesActionIneligible(), [
            ...path,
            'replacement',
            'replacesActionId',
          ])
        }
      }
      if (replacement.attackWord === 'any' && replacement.replacesActionId) {
        addCustomRefinementIssue(ctx, multiattackValidationMessages.attackWordWithTarget(), [
          ...path,
          'replacement',
          'replacesActionId',
        ])
      }
    }
    const choices = replacement.choices ?? []
    if (choices.length === 0) {
      addCustomRefinementIssue(ctx, multiattackValidationMessages.replacementNoChoices(), [
        ...path,
        'replacement',
        'choices',
      ])
    }
    const seenChoices = new Set<string>()
    choices.forEach((choice, choiceIndex) => {
      const key = `${choice.actionId ?? ''}:${choice.spellId ?? ''}`
      if (seenChoices.has(key) && choice.actionId) {
        addCustomRefinementIssue(ctx, multiattackValidationMessages.replacementChoiceDuplicate(), [
          ...path,
          'replacement',
          'choices',
          choiceIndex,
          'actionId',
        ])
      }
      seenChoices.add(key)
      refineReplacementChoice(
        action.id,
        choice,
        pathOf(path, 'replacement', 'choices', choiceIndex),
        actionsById,
        ctx,
        'replacement',
      )
    })
  }

  const alternative = action.alternative
  if (alternative) {
    const altSteps = alternative.steps ?? []
    if (altSteps.length === 0) {
      addCustomRefinementIssue(ctx, multiattackValidationMessages.alternativeEmpty(), [
        ...path,
        'alternative',
        'steps',
      ])
    }
    altSteps.forEach((step, stepIndex) => {
      const stepPath = pathOf(path, 'alternative', 'steps', stepIndex)
      if (isMultiattackAttackGroup(step)) {
        refineAttackGroup(action.id, step, stepPath, actionsById, bonusById, ctx)
        return
      }
      refineUseClause(action.id, step, stepPath, actionsById, ctx)
    })
    if (alternative.afterUsingActionId) {
      const target =
        actionsById.get(alternative.afterUsingActionId) ??
        bonusById.get(alternative.afterUsingActionId)
      if (!target) {
        addCustomRefinementIssue(ctx, multiattackValidationMessages.prerequisiteUnavailable(), [
          ...path,
          'alternative',
          'afterUsingActionId',
        ])
      } else if (
        !multiattackEligibilityKinds('prerequisite').includes(target.kind ?? '') ||
        target.kind === 'multiattack'
      ) {
        addCustomRefinementIssue(ctx, multiattackValidationMessages.prerequisiteMissing(), [
          ...path,
          'alternative',
          'afterUsingActionId',
        ])
      }
    }
  }
}
