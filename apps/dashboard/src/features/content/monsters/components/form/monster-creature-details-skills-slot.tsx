import {
  formatSignedModifier,
  PROFICIENCY_RANK_ENTRIES,
  PROFICIENCY_RANK_IDS,
  type DerivedMonsterDraftStatBlock,
  type ProficiencyRank,
  type SkillProficiency,
} from '@rpg/contracts'
import { proficiencyDomainFieldNoun } from '@rpg/contracts'
import { Badge, Chip, ChipGroup, ComboboxField, SemanticText } from '@rpg/ui'
import { useFormContext } from 'react-hook-form'

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
} from '../../lib/monster-form-labels'
import { monsterUnavailableReasonCopy } from '../../lib/monster-display'
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

function MonsterSkillProficiencyRowTrailing({
  row,
  index,
  skillLabel,
  modifierBadge,
  values,
}: {
  row: SkillRowProps['row']
  index: number
  skillLabel: string
  modifierBadge: string | undefined
  values: MonsterFormValues
}) {
  const form = useFormContext<MonsterFormValues>()
  const { chipSize, badgeSize } = useEntityCardUtilityControlSizes()

  return (
    <div className="flex flex-wrap items-center justify-end gap-2">
      {modifierBadge ? (
        <Badge tone="neutral" appearance="soft" size={badgeSize}>
          {modifierBadge}
        </Badge>
      ) : null}
      <ChipGroup semanticRole="radiogroup" aria-label={`${skillLabel} rank`}>
        {PROFICIENCY_RANK_IDS.map((rank) => (
          <Chip
            key={rank}
            id={`monster-skill-${row.skill}-${rank}`}
            mode="selectable"
            size={chipSize}
            selectionRole="radio"
            selected={row.rank === rank}
            onSelectedChange={(selectedRank) => {
              if (!selectedRank) return
              form.setValue(`proficiencies.skills.${index}.rank`, rank as ProficiencyRank, {
                shouldDirty: true,
              })
            }}
          >
            {PROFICIENCY_RANK_ENTRIES[rank].label}
          </Chip>
        ))}
      </ChipGroup>
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
  const modifierBadge = derivedRow
    ? formatSignedModifier(derivedRow.modifier)
    : derived?.skills.status === 'unavailable'
      ? monsterUnavailableReasonCopy(derived.skills.reason, 'challenge')
      : undefined
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
            modifierBadge={modifierBadge}
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
          placeholder={MONSTER_ADD_SKILL_LABEL}
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
