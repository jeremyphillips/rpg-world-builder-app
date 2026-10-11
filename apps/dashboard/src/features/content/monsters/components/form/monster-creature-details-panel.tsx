import { useFormContext, useWatch } from 'react-hook-form'
import {
  EFFECT_CONDITION_IDS,
  PROFICIENCY_RANK_ENTRIES,
  PROFICIENCY_RANK_IDS,
  getEffectConditionLabel,
  type ProficiencyRank,
} from '@rpg/contracts'
import { Button, SegmentedControl, SemanticText } from '@rpg/ui'

import type { ContentFormCtx } from '../../../lib/forms/registry/content-form-registry'
import { resolveStrictCatalogWriteGateReason } from '../../../lib/forms/shells/layout/content-form-catalog-write-gate.lib'
import { useReportContentFormWriteGate } from '../../../lib/forms/shells/layout/content-form-write-gate'
import { deriveMonsterFormDraft } from '../../lib/monster-form-derivation'
import {
  MONSTER_ADD_LANGUAGE_LABEL,
  MONSTER_ADD_SENSE_LABEL,
  MONSTER_ADD_SKILL_LABEL,
  MONSTER_ADD_WEAPON_LABEL,
  MONSTER_LANGUAGE_NOTE_LABEL,
  MONSTER_REMOVE_LABEL,
  MONSTER_SKILL_ERROR,
  MONSTER_SKILL_LOADING,
  MONSTER_SPEAKS_LABEL,
  MONSTER_TELEPATHY_HINT,
  MONSTER_TELEPATHY_LABEL,
  MONSTER_UNDERSTANDS_ONLY_LABEL,
  MONSTER_WEAPON_PROFICIENCIES_HEADING,
  monsterSkillSectionLabel,
} from '../../lib/monster-form-labels'
import { monsterUnavailableReasonCopy } from '../../lib/monster-display'
import type { MonsterFormValues } from '../../lib/monster-form-values'

const DAMAGE_LISTS = ['vulnerabilities', 'resistances', 'immunities'] as const

export function MonsterCreatureDetailsPanel({ ctx }: { ctx: ContentFormCtx }) {
  const values = useWatch<MonsterFormValues>() as MonsterFormValues | undefined
  useReportContentFormWriteGate(
    'strict',
    resolveStrictCatalogWriteGateReason(ctx.skillCatalogStatus, {
      loading: MONSTER_SKILL_LOADING,
      error: MONSTER_SKILL_ERROR,
    }),
  )
  if (!values?.proficiencies || !values.defenses || !values.languages) return null

  const skillsReady = ctx.skillCatalogStatus === 'ready'
  const skillOptions = ctx.options?.skills?.visible ?? []
  const selected = new Set(values.proficiencies.skills.map((row) => row.skill))
  const derived = skillsReady ? deriveMonsterFormDraft(values as MonsterFormValues, ctx) : null
  const damageTypes = [...(ctx.damageTypeVocabulary?.activeIds ?? [])].map((id) => ({
    id,
    label: ctx.damageTypeVocabulary?.labelById[id] ?? id,
  }))

  return (
    <div className="flex flex-col gap-6">
      <SkillsSection
        ctx={ctx}
        values={values}
        skillsReady={skillsReady}
        skillOptions={skillOptions}
        selected={selected}
        derived={derived}
      />
      <WeaponProficienciesSection ctx={ctx} values={values} />
      <SensesSection ctx={ctx} values={values} />
      <LanguagesSection ctx={ctx} values={values} />
      <DefensesSection values={values} damageTypes={damageTypes} />
    </div>
  )
}

function SkillsSection({
  ctx,
  values,
  skillsReady,
  skillOptions,
  selected,
  derived,
}: {
  ctx: ContentFormCtx
  values: MonsterFormValues
  skillsReady: boolean
  skillOptions: readonly { id: string; name: string }[]
  selected: Set<string>
  derived: ReturnType<typeof deriveMonsterFormDraft>
}) {
  const form = useFormContext<MonsterFormValues>()
  return (
    <section>
      <h3>{monsterSkillSectionLabel()}</h3>
      {ctx.skillCatalogStatus === 'pending' ? (
        <SemanticText>{MONSTER_SKILL_LOADING}</SemanticText>
      ) : null}
      {ctx.skillCatalogStatus === 'error' ? (
        <SemanticText tone="destructive">{MONSTER_SKILL_ERROR}</SemanticText>
      ) : null}
      {skillsReady
        ? values.proficiencies.skills.map((row, index) => {
            const skill = skillOptions.find((option) => option.id === row.skill)
            const derivedRow =
              derived?.skills.status === 'resolved'
                ? derived.skills.value.find((entry) => entry.skillId === row.skill)
                : undefined
            return (
              <div key={row.skill}>
                <span>{skill?.name ?? row.skill}</span>
                {derived?.skills.status === 'resolved' && derivedRow ? (
                  <span>{derivedRow.modifier}</span>
                ) : derived?.skills.status === 'unavailable' ? (
                  <span>{monsterUnavailableReasonCopy(derived.skills.reason, 'challenge')}</span>
                ) : null}
                <SegmentedControl
                  aria-label={`${skill?.name ?? row.skill} rank`}
                  value={row.rank}
                  options={PROFICIENCY_RANK_IDS.map((rank) => ({
                    value: rank,
                    label: PROFICIENCY_RANK_ENTRIES[rank].label,
                  }))}
                  onValueChange={(rank) =>
                    form.setValue(`proficiencies.skills.${index}.rank`, rank as ProficiencyRank, {
                      shouldDirty: true,
                    })
                  }
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() =>
                    form.setValue(
                      'proficiencies.skills',
                      values.proficiencies.skills.filter((entry) => entry.skill !== row.skill),
                      { shouldDirty: true },
                    )
                  }
                >
                  {MONSTER_REMOVE_LABEL}
                </Button>
              </div>
            )
          })
        : null}
      {skillsReady ? (
        <select
          aria-label={MONSTER_ADD_SKILL_LABEL}
          value=""
          onChange={(event) => {
            const skill = event.target.value
            if (!skill) return
            form.setValue(
              'proficiencies.skills',
              [...values.proficiencies.skills, { skill, rank: 'proficient' }],
              { shouldDirty: true },
            )
          }}
        >
          <option value="">{MONSTER_ADD_SKILL_LABEL}</option>
          {skillOptions
            .filter((skill) => !selected.has(skill.id))
            .map((skill) => (
              <option key={skill.id} value={skill.id}>
                {skill.name}
              </option>
            ))}
        </select>
      ) : null}
      {skillsReady && derived?.passivePerception.status === 'resolved' ? (
        <p>Passive Perception {derived.passivePerception.value}</p>
      ) : null}
    </section>
  )
}

function WeaponProficienciesSection({
  ctx,
  values,
}: {
  ctx: ContentFormCtx
  values: MonsterFormValues
}) {
  const form = useFormContext<MonsterFormValues>()
  return (
    <section>
      <h3>{MONSTER_WEAPON_PROFICIENCIES_HEADING}</h3>
      <select
        aria-label={MONSTER_ADD_WEAPON_LABEL}
        value=""
        onChange={(event) => {
          const weaponId = event.target.value
          if (!weaponId) return
          form.setValue('proficiencies.weapons', [...values.proficiencies.weapons, { weaponId }], {
            shouldDirty: true,
          })
        }}
      >
        <option value="">{MONSTER_ADD_WEAPON_LABEL}</option>
        {(ctx.options?.equipment?.forReference() ?? [])
          .filter((item) => item.kind === 'weapon')
          .map((item) => (
            <option key={item.id} value={item.id}>
              {item.name}
            </option>
          ))}
      </select>
    </section>
  )
}

function SensesSection({ ctx, values }: { ctx: ContentFormCtx; values: MonsterFormValues }) {
  const form = useFormContext<MonsterFormValues>()
  return (
    <section>
      <h3>Senses</h3>
      <select
        aria-label={MONSTER_ADD_SENSE_LABEL}
        value=""
        onChange={(event) => {
          const type = event.target.value
          if (!type) return
          form.setValue('senses', [...(values.senses ?? []), { type, range: 60 }], {
            shouldDirty: true,
          })
        }}
      >
        <option value="">{MONSTER_ADD_SENSE_LABEL}</option>
        {[...(ctx.senseVocabulary?.activeIds ?? [])].map((id) => (
          <option key={id} value={id}>
            {ctx.senseVocabulary?.labelById[id] ?? id}
          </option>
        ))}
      </select>
    </section>
  )
}

function LanguagesSection({ ctx, values }: { ctx: ContentFormCtx; values: MonsterFormValues }) {
  const form = useFormContext<MonsterFormValues>()
  return (
    <section>
      <h3>Languages</h3>
      {values.languages.entries.map((entry, index) => {
        const label = ctx.languageVocabulary?.labelById[entry.language] ?? entry.language
        const speaks = entry.speaks !== false
        return (
          <div key={entry.language}>
            <SegmentedControl
              aria-label={`${label}, ${speaks ? MONSTER_SPEAKS_LABEL : MONSTER_UNDERSTANDS_ONLY_LABEL}`}
              value={speaks ? 'speaks' : 'understands'}
              options={[
                { value: 'speaks', label: MONSTER_SPEAKS_LABEL },
                { value: 'understands', label: MONSTER_UNDERSTANDS_ONLY_LABEL },
              ]}
              onValueChange={(next) =>
                form.setValue(
                  `languages.entries.${index}.speaks`,
                  next === 'speaks' ? undefined : false,
                  {
                    shouldDirty: true,
                  },
                )
              }
            />
            <Button
              type="button"
              variant="outline"
              onClick={() =>
                form.setValue(
                  'languages.entries',
                  values.languages.entries.filter((row) => row.language !== entry.language),
                  { shouldDirty: true },
                )
              }
            >
              {MONSTER_REMOVE_LABEL}
            </Button>
          </div>
        )
      })}
      <select
        aria-label={MONSTER_ADD_LANGUAGE_LABEL}
        value=""
        onChange={(event) => {
          const language = event.target.value
          if (!language) return
          form.setValue('languages.entries', [...values.languages.entries, { language }], {
            shouldDirty: true,
          })
        }}
      >
        <option value="">{MONSTER_ADD_LANGUAGE_LABEL}</option>
        {[...(ctx.languageVocabulary?.activeIds ?? [])]
          .filter((id) => !values.languages.entries.some((entry) => entry.language === id))
          .map((id) => (
            <option key={id} value={id}>
              {ctx.languageVocabulary?.labelById[id] ?? id}
            </option>
          ))}
      </select>
      <label>
        {MONSTER_TELEPATHY_LABEL}
        <input
          aria-label={MONSTER_TELEPATHY_LABEL}
          type="number"
          value={values.languages.telepathy ?? ''}
          placeholder={MONSTER_TELEPATHY_HINT}
          onChange={(event) => {
            const raw = event.target.value
            form.setValue(
              'languages',
              {
                ...values.languages,
                ...(raw === '' ? {} : { telepathy: Number(raw) }),
              },
              { shouldDirty: true },
            )
          }}
        />
      </label>
      <label>
        {MONSTER_LANGUAGE_NOTE_LABEL}
        <input
          aria-label={MONSTER_LANGUAGE_NOTE_LABEL}
          value={values.languages.note ?? ''}
          onChange={(event) =>
            form.setValue(
              'languages',
              {
                ...values.languages,
                ...(event.target.value ? { note: event.target.value } : {}),
              },
              { shouldDirty: true },
            )
          }
        />
      </label>
    </section>
  )
}

function DefensesSection({
  values,
  damageTypes,
}: {
  values: MonsterFormValues
  damageTypes: { id: string; label: string }[]
}) {
  const form = useFormContext<MonsterFormValues>()
  return (
    <section>
      {DAMAGE_LISTS.map((list) => {
        const selectedIds = new Set(values.defenses[list])
        const blocked = new Set(
          DAMAGE_LISTS.filter((other) => other !== list).flatMap((other) => values.defenses[other]),
        )
        return (
          <label key={list}>
            {list}
            <select
              aria-label={list}
              value=""
              onChange={(event) => {
                const id = event.target.value
                if (!id) return
                form.setValue(`defenses.${list}`, [...values.defenses[list], id], {
                  shouldDirty: true,
                })
              }}
            >
              <option value="">Add</option>
              {damageTypes
                .filter((type) => !selectedIds.has(type.id) && !blocked.has(type.id))
                .map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.label}
                  </option>
                ))}
            </select>
          </label>
        )
      })}
      <label>
        Condition immunities
        <select
          aria-label="Condition immunities"
          value=""
          onChange={(event) => {
            const id = event.target.value
            if (!id) return
            form.setValue(
              'defenses.conditionImmunities',
              [...values.defenses.conditionImmunities, id as (typeof EFFECT_CONDITION_IDS)[number]],
              { shouldDirty: true },
            )
          }}
        >
          <option value="">Add</option>
          {EFFECT_CONDITION_IDS.filter(
            (id) => !values.defenses.conditionImmunities.includes(id),
          ).map((id) => (
            <option key={id} value={id}>
              {getEffectConditionLabel(id)}
            </option>
          ))}
        </select>
      </label>
    </section>
  )
}
