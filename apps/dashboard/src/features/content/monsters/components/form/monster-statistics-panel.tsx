import { createContext, useContext, useState } from 'react'
import { useFormContext, useFormState, useWatch } from 'react-hook-form'
import {
  ABILITY_IDS,
  CREATURE_ARMOR_CLASS_KINDS,
  CREATURE_SIZE_HIT_DIE,
  abilityModifier,
  formatSignedModifier,
  getAbilityCompactLabel,
  getCreatureArmorClassKindLabel,
  type CreatureSize,
} from '@rpg/contracts'
import { Button, SegmentedControl, SemanticText } from '@rpg/ui'
import { flattenFormIssues, useFormValidationPresentation, useTabbedFormChrome } from '@rpg/ui/form'

import { focusFormPath } from '../../../lib/forms/shells/submit/content-form-submit'
import { useMonsterVariantStash } from '../../hooks/use-monster-variant-stash'
import { deriveMonsterFormDraft } from '../../lib/monster-form-derivation'
import {
  MONSTER_ABILITY_SCORES_HEADING,
  MONSTER_ARMOR_CLASS_HEADING,
  MONSTER_FIXED_AC_HINT,
  MONSTER_FIXED_AC_LABEL,
  MONSTER_FIXED_AVERAGE_LABEL,
  MONSTER_FIXED_FORMULA_HINT,
  MONSTER_FIXED_FORMULA_LABEL,
  MONSTER_HIT_DICE_LABEL,
  MONSTER_HIT_DICE_MINIMUM_ERROR,
  MONSTER_HIT_POINTS_HEADING,
  MONSTER_HP_MINIMUM_NOTE,
  MONSTER_NATURAL_BONUS_LABEL,
  MONSTER_SAVE_LABEL,
  monsterBodyArmorConflictMessage,
  monsterBodyArmorIgnoredMessage,
  monsterChooseBodyArmorMessage,
  monsterGoToEquipmentLabel,
} from '../../lib/monster-form-labels'
import { equipmentArmorRole, equipmentEntryBaseName } from '../../lib/monster-equipment-labels'
import { monsterEquipmentCatalog } from '../../lib/monster-form-derivation'
import { monsterUnavailableReasonCopy } from '../../lib/monster-display'
import { resolveMonsterFormViewForPath } from '../../lib/monster-form-view'
import {
  statisticsFieldIsInvalid,
  statisticsIssueLabel,
  statisticsIssuesForDisplay,
  type StatisticsFieldIssue,
} from '../../lib/monster-statistics-errors'
import type { MonsterFormValues } from '../../lib/monster-form-values'
import type { ContentFormCtx } from '../../../lib/forms/registry/content-form-registry'

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
        <SemanticText key={issue.path} tone="destructive">
          {`${statisticsIssueLabel(issue.path)}: ${issue.message}`}
        </SemanticText>
      ))}
    </div>
  )
}

export function MonsterStatisticsPanel({ ctx }: { ctx: ContentFormCtx }) {
  const values = useWatch<MonsterFormValues>() as MonsterFormValues | undefined
  const { switchArmorClass, switchHitPoints } = useMonsterVariantStash(ctx.entityId)
  const chrome = useTabbedFormChrome()
  const derived = values ? deriveMonsterFormDraft(values as MonsterFormValues, ctx) : null
  const catalog = monsterEquipmentCatalog(ctx)
  const armorClass = values?.armorClass
  const hitPoints = values?.hitPoints
  const [hitDiceDisplay, setHitDiceDisplay] = useState<string | null>(null)
  const statisticsIssues = useStatisticsIssues()

  if (!values || !armorClass || !hitPoints) return null

  const equippedBodyArmor = (values.equipment ?? [])
    .filter((entry) => entry.equipped)
    .map((entry) => ({ entry, item: catalog.get(entry.equipmentId) }))
    .filter((row) => equipmentArmorRole(row.item) === 'body-armor')

  const goToEquipment = () => {
    focusFormPath('equipment', {
      formId: chrome?.formId ?? 'monster-form',
      resolveViewForPath: resolveMonsterFormViewForPath,
      activateView: (viewId) => chrome?.setActiveTabId(viewId),
    })
  }

  const calculatedAc = derived?.ac.status === 'resolved' ? derived.ac.value.ac : undefined

  return (
    <StatisticsIssuesContext.Provider value={statisticsIssues}>
      <div className="flex flex-col gap-6">
        <StatisticsIssueList />
        <AbilityScoresSection values={values as MonsterFormValues} />
        <ArmorClassSection
          ctx={ctx}
          values={values as MonsterFormValues}
          armorClass={armorClass}
          calculatedAc={calculatedAc}
          derived={derived}
          bodyArmorNames={equippedBodyArmor.map((row) =>
            equipmentEntryBaseName(row.entry, catalog),
          )}
          onSwitch={switchArmorClass}
          onGoToEquipment={goToEquipment}
        />
        <HitPointsSection
          values={values as MonsterFormValues}
          hitPoints={hitPoints}
          derived={derived}
          hitDiceDisplay={hitDiceDisplay}
          setHitDiceDisplay={setHitDiceDisplay}
          onSwitch={switchHitPoints}
        />
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
  const score = values.abilityScores?.[ability] ?? 10
  const proficient = values.proficiencies?.savingThrows?.includes(ability) ?? false
  const scorePath = `abilityScores.${ability}`
  return (
    <label>
      {getAbilityCompactLabel(ability)}
      <input
        aria-label={getAbilityCompactLabel(ability)}
        aria-invalid={statisticsInvalid(scorePath, issues) || undefined}
        type="number"
        value={score}
        onChange={(event) => {
          form.setValue(`abilityScores.${ability}`, Number(event.target.value), {
            shouldDirty: true,
          })
        }}
      />
      <span>{formatSignedModifier(abilityModifier(score))}</span>
      <input
        type="checkbox"
        aria-label={`${getAbilityCompactLabel(ability)} ${MONSTER_SAVE_LABEL}`}
        aria-invalid={statisticsInvalid('proficiencies.savingThrows', issues) || undefined}
        checked={proficient}
        onChange={(event) => {
          const current = form.getValues('proficiencies.savingThrows') ?? []
          const next = event.target.checked
            ? [...current, ability]
            : current.filter((id) => id !== ability)
          form.setValue('proficiencies.savingThrows', next, { shouldDirty: true })
        }}
      />
    </label>
  )
}

function ArmorClassSection({
  ctx,
  values,
  armorClass,
  calculatedAc,
  derived,
  bodyArmorNames,
  onSwitch,
  onGoToEquipment,
}: {
  ctx: ContentFormCtx
  values: MonsterFormValues
  armorClass: MonsterFormValues['armorClass']
  calculatedAc: number | undefined
  derived: ReturnType<typeof deriveMonsterFormDraft>
  bodyArmorNames: string[]
  onSwitch: (
    kind: MonsterFormValues['armorClass']['kind'],
    calculatedAc: number | undefined,
  ) => void
  onGoToEquipment: () => void
}) {
  return (
    <section>
      <h3>{MONSTER_ARMOR_CLASS_HEADING}</h3>
      {ctx.equipmentCatalogStatus !== 'ready' ? (
        <SemanticText tone="warning">
          {ctx.equipmentCatalogStatus === 'error'
            ? 'Equipment could not be loaded.'
            : 'Loading equipment…'}
        </SemanticText>
      ) : (
        <>
          <SegmentedControl
            aria-label={MONSTER_ARMOR_CLASS_HEADING}
            value={armorClass.kind}
            options={CREATURE_ARMOR_CLASS_KINDS.map((kind) => ({
              value: kind,
              label: getCreatureArmorClassKindLabel(kind),
            }))}
            onValueChange={(kind) =>
              onSwitch(kind as MonsterFormValues['armorClass']['kind'], calculatedAc)
            }
          />
          <NaturalArmorBonus armorClass={armorClass} />
          <FixedArmorValue armorClass={armorClass} />
          <ArmorClassStatus
            values={values}
            derived={derived}
            bodyArmorNames={bodyArmorNames}
            onGoToEquipment={onGoToEquipment}
          />
        </>
      )}
    </section>
  )
}

function NaturalArmorBonus({ armorClass }: { armorClass: MonsterFormValues['armorClass'] }) {
  const form = useFormContext<MonsterFormValues>()
  const issues = useContext(StatisticsIssuesContext)
  if (armorClass.kind !== 'natural') return null
  return (
    <label>
      {MONSTER_NATURAL_BONUS_LABEL}
      <input
        aria-label={MONSTER_NATURAL_BONUS_LABEL}
        aria-invalid={statisticsInvalid('armorClass', issues) || undefined}
        type="number"
        min={1}
        value={armorClass.bonus ?? 1}
        onChange={(event) =>
          form.setValue(
            'armorClass',
            { kind: 'natural', bonus: Number(event.target.value) },
            { shouldDirty: true },
          )
        }
      />
    </label>
  )
}

function FixedArmorValue({ armorClass }: { armorClass: MonsterFormValues['armorClass'] }) {
  const form = useFormContext<MonsterFormValues>()
  if (armorClass.kind !== 'fixed') return null
  return (
    <label>
      {MONSTER_FIXED_AC_LABEL}
      <input
        aria-label={MONSTER_FIXED_AC_LABEL}
        type="number"
        value={armorClass.value ?? ''}
        onChange={(event) => {
          const raw = event.target.value
          form.setValue(
            'armorClass',
            raw === '' ? { kind: 'fixed' } : { kind: 'fixed', value: Number(raw) },
            { shouldDirty: true },
          )
        }}
      />
      <span>{MONSTER_FIXED_AC_HINT}</span>
    </label>
  )
}

function HitPointsSection({
  values,
  hitPoints,
  derived,
  hitDiceDisplay,
  setHitDiceDisplay,
  onSwitch,
}: {
  values: MonsterFormValues
  hitPoints: MonsterFormValues['hitPoints']
  derived: ReturnType<typeof deriveMonsterFormDraft>
  hitDiceDisplay: string | null
  setHitDiceDisplay: (value: string | null) => void
  onSwitch: (
    kind: 'hit-dice' | 'fixed',
    prefill: { average: number; formula: string } | undefined,
  ) => void
}) {
  return (
    <section>
      <h3>{MONSTER_HIT_POINTS_HEADING}</h3>
      <SegmentedControl
        aria-label={MONSTER_HIT_POINTS_HEADING}
        value={hitPoints.kind}
        options={[
          { value: 'hit-dice', label: MONSTER_HIT_DICE_LABEL },
          { value: 'fixed', label: 'Fixed' },
        ]}
        onValueChange={(kind) => {
          if (kind !== 'hit-dice' && kind !== 'fixed') return
          const prefill =
            derived?.hp.status === 'resolved'
              ? { average: derived.hp.value.hp, formula: derived.hp.value.formula }
              : undefined
          onSwitch(kind, prefill)
          setHitDiceDisplay(null)
        }}
      />
      {hitPoints.kind === 'hit-dice' ? (
        <HitDiceCountField
          values={values}
          hitPoints={hitPoints}
          hitDiceDisplay={hitDiceDisplay}
          setHitDiceDisplay={setHitDiceDisplay}
        />
      ) : (
        <FixedHitPointsFields hitPoints={hitPoints} />
      )}
      <HitPointStatus derived={derived} />
    </section>
  )
}

function HitDiceCountField({
  values,
  hitPoints,
  hitDiceDisplay,
  setHitDiceDisplay,
}: {
  values: MonsterFormValues
  hitPoints: Extract<MonsterFormValues['hitPoints'], { kind: 'hit-dice' }>
  hitDiceDisplay: string | null
  setHitDiceDisplay: (value: string | null) => void
}) {
  const form = useFormContext<MonsterFormValues>()
  const issues = useContext(StatisticsIssuesContext)
  const invalid = hitDiceDisplay !== null && !/^[1-9]\d*$/.test(hitDiceDisplay)
  return (
    <label>
      {MONSTER_HIT_DICE_LABEL}
      <input
        aria-label={MONSTER_HIT_DICE_LABEL}
        aria-invalid={invalid || statisticsInvalid('hitPoints', issues) || undefined}
        type="number"
        value={hitDiceDisplay ?? String(hitPoints.count)}
        onChange={(event) => {
          const raw = event.target.value
          setHitDiceDisplay(raw)
          const count = Number(raw)
          if (Number.isInteger(count) && count >= 1) {
            form.setValue('hitPoints', { kind: 'hit-dice', count }, { shouldDirty: true })
            setHitDiceDisplay(null)
          }
        }}
        onBlur={() => {
          if (invalid) setHitDiceDisplay(hitDiceDisplay)
        }}
      />
      <span>d{CREATURE_SIZE_HIT_DIE[(values.size ?? 'medium') as CreatureSize] ?? ''}</span>
      {invalid ? (
        <SemanticText tone="destructive">{MONSTER_HIT_DICE_MINIMUM_ERROR}</SemanticText>
      ) : null}
    </label>
  )
}

function FixedHitPointsFields({ hitPoints }: { hitPoints: MonsterFormValues['hitPoints'] }) {
  const form = useFormContext<MonsterFormValues>()
  if (hitPoints.kind !== 'fixed') return null
  return (
    <>
      <label>
        {MONSTER_FIXED_AVERAGE_LABEL}
        <input
          aria-label={MONSTER_FIXED_AVERAGE_LABEL}
          type="number"
          value={hitPoints.average ?? ''}
          onChange={(event) => {
            const raw = event.target.value
            form.setValue(
              'hitPoints',
              {
                kind: 'fixed',
                ...(raw === '' ? {} : { average: Number(raw) }),
                ...(hitPoints.formula ? { formula: hitPoints.formula } : {}),
              },
              { shouldDirty: true },
            )
          }}
        />
      </label>
      <label>
        {MONSTER_FIXED_FORMULA_LABEL}
        <input
          aria-label={MONSTER_FIXED_FORMULA_LABEL}
          value={hitPoints.formula ?? ''}
          onChange={(event) =>
            form.setValue(
              'hitPoints',
              {
                kind: 'fixed',
                ...(hitPoints.average !== undefined ? { average: hitPoints.average } : {}),
                ...(event.target.value ? { formula: event.target.value } : {}),
              },
              { shouldDirty: true },
            )
          }
        />
        <span>{MONSTER_FIXED_FORMULA_HINT}</span>
      </label>
    </>
  )
}

function ArmorClassStatus({
  values,
  derived,
  bodyArmorNames,
  onGoToEquipment,
}: {
  values: MonsterFormValues
  derived: ReturnType<typeof deriveMonsterFormDraft>
  bodyArmorNames: string[]
  onGoToEquipment: () => void
}) {
  const kind = values.armorClass.kind
  if (derived?.ac.status === 'unavailable' && derived.ac.reason === 'conflict') {
    return (
      <SemanticText tone="warning">{monsterBodyArmorConflictMessage(bodyArmorNames)}</SemanticText>
    )
  }
  if (
    derived?.ac.status === 'unavailable' &&
    derived.ac.reason === 'missing-reference' &&
    kind === 'equipment'
  ) {
    return (
      <div>
        <SemanticText>{monsterChooseBodyArmorMessage()}</SemanticText>
        <Button type="button" variant="outline" onClick={onGoToEquipment}>
          {monsterGoToEquipmentLabel()}
        </Button>
      </div>
    )
  }
  if ((kind === 'natural' || kind === 'unarmored') && bodyArmorNames.length > 0) {
    return (
      <SemanticText tone="warning">
        {monsterBodyArmorIgnoredMessage(bodyArmorNames[0]!)}
      </SemanticText>
    )
  }
  if (derived?.ac.status === 'resolved') {
    return <p>AC {derived.ac.value.ac}</p>
  }
  if (derived?.ac.status === 'unavailable') {
    return <p>AC — {monsterUnavailableReasonCopy(derived.ac.reason, 'armor')}</p>
  }
  return null
}

function HitPointStatus({ derived }: { derived: ReturnType<typeof deriveMonsterFormDraft> }) {
  if (!derived) return null
  if (derived.hp.status === 'unavailable') {
    return <p>HP — {monsterUnavailableReasonCopy(derived.hp.reason, 'generic')}</p>
  }
  const note = derived.hp.value.clampedToMinimum ? ` ${MONSTER_HP_MINIMUM_NOTE}` : ''
  return (
    <p>
      HP {derived.hp.value.hp} = {derived.hp.value.formula}
      {note}
    </p>
  )
}
