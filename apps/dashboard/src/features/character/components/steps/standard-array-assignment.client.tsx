'use client'

import { useId, useMemo } from 'react'
import { Controller, useFormContext, useWatch } from 'react-hook-form'

import {
  ABILITY_ENTRIES,
  ABILITY_IDS,
  abilityModifier,
  getAvailableStandardArrayScores,
  type Ability,
} from '@rpg/contracts'
import { Badge, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Text } from '@rpg/ui'

import {
  abilitiesFormCopy,
  STANDARD_ARRAY_EMPTY_SCORE_VALUE,
} from '../../lib/steps/abilities-form-labels'
import type { AbilitiesFormValues } from '../../lib/steps/abilities-form-fields'
import {
  getStandardArrayRemainingCount,
  getStandardArrayScoreOptionsForAbility,
} from '../../lib/steps/standard-array-assignment.lib'
import { formatPreviewSignedNumber } from '../../lib/character-builder-preview-panel.lib'
import {
  standardArrayAbilityAbbrClasses,
  standardArrayAbilityLabelClasses,
  standardArrayAbilityListClasses,
  standardArrayAbilityNameClasses,
  standardArrayAbilityRowClasses,
  standardArrayAssignmentIntroClasses,
  standardArrayAssignmentRootClasses,
  standardArrayDesktopHeaderClasses,
  standardArrayMobileModifierLabelClasses,
  standardArrayModifierClasses,
  standardArrayRemainingClasses,
  standardArrayScoreControlClasses,
  standardArrayScorePoolClasses,
  standardArrayScorePoolSectionClasses,
  standardArrayScoresHeadingClasses,
  standardArrayScoresSectionClasses,
} from './standard-array-assignment.variants'

export type StandardArrayAssignmentProps = {
  standardArray: readonly number[]
}

function scoresFromFormValues(
  values: Partial<AbilitiesFormValues>,
): Partial<Record<Ability, number>> {
  return Object.fromEntries(
    ABILITY_IDS.map((ability) => {
      const score = values[ability]
      return typeof score === 'number' ? [ability, score] : null
    }).filter((entry): entry is [Ability, number] => entry !== null),
  )
}

function scoreToSelectValue(score: number | undefined): string {
  return typeof score === 'number' ? String(score) : ''
}

function selectValueToScore(value: string): number | undefined {
  if (value === STANDARD_ARRAY_EMPTY_SCORE_VALUE || value.trim() === '') return undefined
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : undefined
}

function ScorePool({
  availableScores,
  poolId,
}: {
  availableScores: readonly number[]
  poolId: string
}) {
  if (availableScores.length === 0) return null

  return (
    <section aria-labelledby={poolId} className={standardArrayScorePoolSectionClasses}>
      <Text as="h3" id={poolId} variant="body" className="text-sm font-medium">
        {abilitiesFormCopy.availableScores}
      </Text>
      <ul className={standardArrayScorePoolClasses}>
        {availableScores.map((score) => (
          <li key={score}>
            <Badge variant="secondary">{score}</Badge>
          </li>
        ))}
      </ul>
    </section>
  )
}

function AbilityScoreRow({
  ability,
  standardArray,
  scores,
}: {
  ability: Ability
  standardArray: readonly number[]
  scores: Partial<Record<Ability, number>>
}) {
  const { control } = useFormContext<AbilitiesFormValues>()
  const rowId = useId()
  const selectId = `${rowId}-score`
  const entry = ABILITY_ENTRIES[ability]
  const options = getStandardArrayScoreOptionsForAbility(ability, scores, standardArray)
  const assignedScore = scores[ability]
  const modifierLabel =
    typeof assignedScore === 'number'
      ? formatPreviewSignedNumber(abilityModifier(assignedScore))
      : abilitiesFormCopy.emptyScore

  return (
    <div className={standardArrayAbilityRowClasses}>
      <div className={standardArrayAbilityNameClasses}>
        <span className={standardArrayAbilityAbbrClasses}>{ability.toUpperCase()}</span>{' '}
        <span className={standardArrayAbilityLabelClasses}>{entry.label}</span>
      </div>

      <div className={standardArrayScoreControlClasses}>
        <Controller
          name={ability}
          control={control}
          render={({ field }) => (
            <Select
              value={scoreToSelectValue(field.value)}
              onValueChange={(value) => field.onChange(selectValueToScore(value))}
            >
              <SelectTrigger
                id={selectId}
                aria-label={`${entry.label} ${abilitiesFormCopy.columnScore.toLowerCase()}`}
                onBlur={field.onBlur}
              >
                <SelectValue placeholder={abilitiesFormCopy.emptyScore} />
              </SelectTrigger>
              <SelectContent>
                {options.map((option) => (
                  <SelectItem
                    key={option.value || 'empty'}
                    value={option.value}
                    disabled={option.disabled}
                  >
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
      </div>

      <div className="flex items-center gap-2 sm:block">
        <span className={standardArrayMobileModifierLabelClasses}>
          {abilitiesFormCopy.columnModifier}
        </span>
        <span className={standardArrayModifierClasses} aria-live="polite">
          {modifierLabel}
        </span>
      </div>
    </div>
  )
}

/** Standard-array score pool and per-ability assignment controls. */
export function StandardArrayAssignment({ standardArray }: StandardArrayAssignmentProps) {
  const introId = useId()
  const poolId = useId()
  const scoresHeadingId = useId()
  const watchedValues = useWatch<AbilitiesFormValues>()
  const scores = useMemo(() => scoresFromFormValues(watchedValues ?? {}), [watchedValues])
  const availableScores = getAvailableStandardArrayScores(scores, standardArray)
  const remainingCount = getStandardArrayRemainingCount(scores, standardArray)

  return (
    <div className={standardArrayAssignmentRootClasses}>
      <div className={standardArrayAssignmentIntroClasses}>
        <Text as="h3" id={introId} variant="body" className="text-sm font-medium">
          {abilitiesFormCopy.standardArrayHeading}
        </Text>
        <Text variant="muted" className="text-sm">
          {abilitiesFormCopy.standardArrayDescription}
        </Text>
      </div>

      <ScorePool availableScores={availableScores} poolId={poolId} />

      <p className={standardArrayRemainingClasses} aria-live="polite">
        {abilitiesFormCopy.scoresRemaining(remainingCount)}
      </p>

      <section aria-labelledby={scoresHeadingId} className={standardArrayScoresSectionClasses}>
        <Text
          as="h3"
          id={scoresHeadingId}
          variant="body"
          className={standardArrayScoresHeadingClasses}
        >
          {abilitiesFormCopy.abilityScores}
        </Text>

        <div role="group" aria-labelledby={scoresHeadingId}>
          <div className={standardArrayDesktopHeaderClasses} aria-hidden>
            <span>{abilitiesFormCopy.columnAbility}</span>
            <span>{abilitiesFormCopy.columnScore}</span>
            <span>{abilitiesFormCopy.columnModifier}</span>
          </div>

          <div className={standardArrayAbilityListClasses}>
            {ABILITY_IDS.map((ability) => (
              <AbilityScoreRow
                key={ability}
                ability={ability}
                standardArray={standardArray}
                scores={scores}
              />
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
