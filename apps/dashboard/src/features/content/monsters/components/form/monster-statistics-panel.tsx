import { createContext, useContext } from 'react'
import { useFormContext, useFormState, useWatch } from 'react-hook-form'
import {
  ABILITY_IDS,
  ABILITY_SCORE_MAX,
  ABILITY_SCORE_MIN,
  NEUTRAL_ABILITY_SCORE,
} from '@rpg/contracts'
import { SemanticText, Text } from '@rpg/ui'
import { flattenFormIssues, useFormValidationPresentation } from '@rpg/ui/form'

import { AbilityScoreNumeric } from '@/components/ability-score'

import { MONSTER_ABILITY_SCORES_HEADING } from '../../lib/monster-form-labels'
import {
  statisticsFieldIsInvalid,
  statisticsIssueLabel,
  statisticsIssuesForDisplay,
  type StatisticsFieldIssue,
} from '../../lib/statistics/monster-statistics-errors'
import type { MonsterFormValues } from '../../lib/monster-form-values'
import type { ContentFormCtx } from '../../../lib/forms/registry/content-form-registry'
import { MonsterAbilitySaveProficiencyFooter } from './monster-ability-save-proficiency-footer'

const StatisticsIssuesContext = createContext<readonly StatisticsFieldIssue[]>([])

function useStatisticsIssues(): readonly StatisticsFieldIssue[] {
  const { errors } = useFormState()
  const presentation = useFormValidationPresentation()
  const rhfIssues = flattenFormIssues(errors)
  const source = presentation.isPresentationSessionExpanded
    ? [...presentation.issues, ...rhfIssues]
    : rhfIssues
  return statisticsIssuesForDisplay(source)
}

function statisticsInvalid(path: string, issues: readonly StatisticsFieldIssue[]): boolean {
  return statisticsFieldIsInvalid(issues, path)
}

function StatisticsIssueList() {
  const issues = useContext(StatisticsIssuesContext)
  if (issues.length === 0) return null
  return (
    <div>
      {issues.map((issue) => (
        <Text key={issue.path} as="span" variant="supporting">
          <SemanticText tone="destructive">
            {`${statisticsIssueLabel(issue.path)}: ${issue.message}`}
          </SemanticText>
        </Text>
      ))}
    </div>
  )
}

export function MonsterStatisticsPanel({ ctx: _ctx }: { ctx: ContentFormCtx }) {
  const values = useWatch<MonsterFormValues>() as MonsterFormValues | undefined
  const statisticsIssues = useStatisticsIssues()

  if (!values) return null

  return (
    <StatisticsIssuesContext.Provider value={statisticsIssues}>
      <div className="flex flex-col gap-6">
        <StatisticsIssueList />
        <AbilityScoresSection values={values} />
      </div>
    </StatisticsIssuesContext.Provider>
  )
}

function AbilityScoresSection({ values }: { values: MonsterFormValues }) {
  return (
    <section>
      <h3>{MONSTER_ABILITY_SCORES_HEADING}</h3>
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
        {ABILITY_IDS.map((ability) => (
          <AbilityScoreField key={ability} ability={ability} values={values} />
        ))}
      </div>
    </section>
  )
}

function AbilityScoreField({
  ability,
  values,
}: {
  ability: (typeof ABILITY_IDS)[number]
  values: MonsterFormValues
}) {
  const form = useFormContext<MonsterFormValues>()
  const issues = useContext(StatisticsIssuesContext)
  const stored = values.abilityScores?.[ability]
  const displayScore = stored ?? NEUTRAL_ABILITY_SCORE
  const proficient = values.proficiencies?.savingThrows?.includes(ability) ?? false
  const scorePath = `abilityScores.${ability}`
  const saveInvalid = statisticsInvalid('proficiencies.savingThrows', issues)

  return (
    <AbilityScoreNumeric
      ability={ability}
      size="sm"
      min={ABILITY_SCORE_MIN}
      max={ABILITY_SCORE_MAX}
      invalid={statisticsInvalid(scorePath, issues)}
      value={displayScore}
      footer={
        <MonsterAbilitySaveProficiencyFooter
          ability={ability}
          proficient={proficient}
          aria-invalid={saveInvalid || undefined}
          onToggle={() => {
            const current = form.getValues('proficiencies.savingThrows') ?? []
            const next = proficient ? current.filter((id) => id !== ability) : [...current, ability]
            form.setValue('proficiencies.savingThrows', next, { shouldDirty: true })
          }}
        />
      }
      onCommit={(next) => {
        if (next === null) return
        if (stored === undefined && next === 10) return
        if (next === stored) return
        form.setValue(`abilityScores.${ability}`, next, { shouldDirty: true })
      }}
    />
  )
}
