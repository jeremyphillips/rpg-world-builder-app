import {
  formatSignedModifier,
  PROFICIENCY_RANK_ENTRIES,
  type DerivedMonsterDraftStatBlock,
  type ProficiencyRank,
  type SkillProficiency,
} from '@rpg/contracts'
import { proficiencyDomainFieldNoun } from '@rpg/contracts'
import {
  Chip,
  cn,
  ComboboxField,
  SemanticText,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@rpg/ui'
import { useFormContext } from 'react-hook-form'

import { entityAnatomyTrailingGroupSecondaryVariants } from '../../../lib/entity/anatomy/entity-anatomy-trailing.variants'
import { useEntityCardUtilityControlSizes } from '../../../lib/entity/surfaces/cards/content/entity-card-utility-field-size.lib'
import { ContentFormEntitySelectionRow } from '../../../lib/forms/selection/content-form-entity-selection-row'
import type { ContentFormCtx } from '../../../lib/forms/registry/content-form-registry'
import {
  useMonsterCreatureDetailsSkillsSlot,
  type MonsterCreatureDetailsSkillsSlotState,
} from '../../hooks/use-monster-creature-details-skills-slot'
import {
  MONSTER_ADD_SKILL_LABEL,
  MONSTER_PASSIVE_PERCEPTION_LABEL,
  MONSTER_SKILL_ERROR,
  MONSTER_SKILL_LOADING,
  MONSTER_SKILL_MODIFIER_UNAVAILABLE_TOOLTIP,
} from '../../lib/monster-form-labels'
import { monsterSkillDerivedMetadataLine } from '../../lib/creature-details/monster-skill-derived-metadata.lib'
import type { MonsterFormValues } from '../../lib/monster-form-values'
import { MonsterCreatureDetailsRemoveRowButton } from './monster-creature-details-slot-parts'

function SkillCatalogStatusMessages({ status }: { status: ContentFormCtx['skillCatalogStatus'] }) {
  if (status === 'pending') return <SemanticText>{MONSTER_SKILL_LOADING}</SemanticText>
  if (status === 'error')
    return <SemanticText tone="destructive">{MONSTER_SKILL_ERROR}</SemanticText>
  return null
}

function PassivePerceptionRow({ value }: { value: number }) {
  return (
    <div className="flex items-center justify-between gap-2 text-sm">
      <span className="font-body-emphasis text-foreground">{MONSTER_PASSIVE_PERCEPTION_LABEL}</span>
      <span className="font-body-emphasis text-foreground tabular-nums">{value}</span>
    </div>
  )
}

type SkillRowProps = {
  row: MonsterFormValues['proficiencies']['skills'][number]
  index: number
  skill: SkillProficiency | undefined
  derived: DerivedMonsterDraftStatBlock | null
  proficiencyBonus: number | undefined
  values: MonsterFormValues
}

type MonsterSkillModifierDisplay =
  | { kind: 'resolved'; label: string }
  | { kind: 'unavailable' }
  | { kind: 'hidden' }

function resolveMonsterSkillModifierDisplay(
  derivedRow: { modifier: number } | undefined,
  derived: DerivedMonsterDraftStatBlock | null,
): MonsterSkillModifierDisplay {
  if (derivedRow) {
    return { kind: 'resolved', label: formatSignedModifier(derivedRow.modifier) }
  }
  if (derived?.skills.status === 'unavailable') {
    return { kind: 'unavailable' }
  }
  return { kind: 'hidden' }
}

function monsterSkillModifierClassName(): string {
  return cn(entityAnatomyTrailingGroupSecondaryVariants(), 'mr-1 text-sm')
}

function MonsterSkillProficiencyModifier({ display }: { display: MonsterSkillModifierDisplay }) {
  if (display.kind === 'hidden') return null

  const valueClassName = monsterSkillModifierClassName()

  if (display.kind === 'resolved') {
    return <span className={valueClassName}>{display.label}</span>
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild className="cursor-pointer">
          <span
            className={cn(valueClassName, 'cursor-pointer')}
            tabIndex={0}
            aria-label={MONSTER_SKILL_MODIFIER_UNAVAILABLE_TOOLTIP}
          >
            —
          </span>
        </TooltipTrigger>
        <TooltipContent>{MONSTER_SKILL_MODIFIER_UNAVAILABLE_TOOLTIP}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

function MonsterSkillProficiencyRowTrailing({
  row,
  index,
  skillLabel,
  modifierDisplay,
  values,
}: {
  row: SkillRowProps['row']
  index: number
  skillLabel: string
  modifierDisplay: MonsterSkillModifierDisplay
  values: MonsterFormValues
}) {
  const form = useFormContext<MonsterFormValues>()
  const { chipSize } = useEntityCardUtilityControlSizes()

  return (
    <div className="flex flex-wrap items-center justify-end gap-2">
      <MonsterSkillProficiencyModifier display={modifierDisplay} />
      <Chip
        id={`monster-skill-${row.skill}-expertise`}
        mode="selectable"
        size={chipSize}
        selectionRole="checkbox"
        selected={row.rank === 'expertise'}
        onSelectedChange={(selected) => {
          form.setValue(
            `proficiencies.skills.${index}.rank`,
            (selected ? 'expertise' : 'proficient') satisfies ProficiencyRank,
            { shouldDirty: true },
          )
        }}
      >
        {PROFICIENCY_RANK_ENTRIES.expertise.label}
      </Chip>
      <MonsterCreatureDetailsRemoveRowButton
        label={skillLabel}
        onRemove={() =>
          form.setValue(
            'proficiencies.skills',
            values.proficiencies.skills.filter((entry) => entry.skill !== row.skill),
            { shouldDirty: true },
          )
        }
      />
    </div>
  )
}

function MonsterSkillProficiencyRow({
  row,
  index,
  skill,
  derived,
  proficiencyBonus,
  values,
}: SkillRowProps) {
  const skillLabel = skill?.name ?? row.skill
  const derivedRow =
    derived?.skills.status === 'resolved'
      ? derived.skills.value.find((entry) => entry.skillId === row.skill)
      : undefined
  const modifierDisplay = resolveMonsterSkillModifierDisplay(derivedRow, derived)
  const metadataLine =
    skill && proficiencyBonus !== undefined
      ? monsterSkillDerivedMetadataLine({
          ability: skill.ability,
          abilityScore: values.abilityScores?.[skill.ability] ?? 10,
          rank: row.rank,
          proficiencyBonus,
        })
      : undefined

  return (
    <ContentFormEntitySelectionRow
      entity={{
        heading: skillLabel,
        description: metadataLine,
      }}
      trailing={{
        kind: 'utility',
        content: (
          <MonsterSkillProficiencyRowTrailing
            row={row}
            index={index}
            skillLabel={skillLabel}
            modifierDisplay={modifierDisplay}
            values={values}
          />
        ),
      }}
    />
  )
}

function MonsterCreatureDetailsSkillsSlotView({
  ctx,
  values,
  skillsReady,
  skillOptions,
  derived,
  proficiencyBonus,
  addOptions,
  addSkillKey,
  addSkill,
  passivePerception,
}: MonsterCreatureDetailsSkillsSlotState) {
  return (
    <div className="flex flex-col gap-2">
      <SkillCatalogStatusMessages status={ctx.skillCatalogStatus} />
      {skillsReady && addOptions.length > 0 ? (
        <ComboboxField
          key={addSkillKey}
          id="monster-add-skill"
          label={MONSTER_ADD_SKILL_LABEL}
          labelVisibility="srOnly"
          options={addOptions}
          multiple={false}
          enableSearch
          noun={proficiencyDomainFieldNoun('skill')}
          closedPlaceholderIntent="add"
          value=""
          onChange={(next) => {
            if (typeof next === 'string' && next) addSkill(next)
          }}
        />
      ) : null}
      {skillsReady
        ? values.proficiencies.skills.map((row, index) => (
            <MonsterSkillProficiencyRow
              key={row.skill}
              row={row}
              index={index}
              skill={skillOptions.find((option) => option.id === row.skill)}
              derived={derived}
              proficiencyBonus={proficiencyBonus}
              values={values}
            />
          ))
        : null}
      {passivePerception != null ? <PassivePerceptionRow value={passivePerception} /> : null}
    </div>
  )
}

export function MonsterCreatureDetailsSkillsSlot({ ctx }: { ctx: ContentFormCtx }) {
  const state = useMonsterCreatureDetailsSkillsSlot(ctx)
  if (!state) return null
  return <MonsterCreatureDetailsSkillsSlotView {...state} />
}
