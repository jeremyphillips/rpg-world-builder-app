import * as React from 'react'
import { useFormContext } from 'react-hook-form'

import { ActionButton, Button, ChoiceSelectionCounter, ComboboxField } from '@rpg/ui'
import type { CharacterBuildContext, NpcStartingChoiceKind } from '@rpg/contracts'

import type { QuickNpcCreateContext } from '../../lib/quick-npc/quick-npc-create-context'
import {
  QUICK_NPC_REQUIRED_SPELL_FIELD_NAME,
  QUICK_NPC_REQUIRED_WEAPON_FIELD_NAME,
  QUICK_NPC_STARTING_CHOICE_OVERRIDES_FIELD_NAME,
  type QuickNpcAuthoringTabFormValues,
  type QuickNpcSetupValues,
} from '../../lib/quick-npc/quick-npc-form-fields'
import type { QuickNpcRequirementOptionSets } from '../../lib/quick-npc/quick-npc-requirement-options.lib'
import {
  allowancePickerOptions,
  formatStartingChoiceProvenance,
  groupStartingChoicesByKind,
  resolveQuickNpcStartingChoices,
  startingChoiceKindLabel,
  startingChoiceLabels,
} from '../../lib/quick-npc/quick-npc-starting-choices.lib'
import { EyebrowActionHeader } from '@/lib/create-setup'

import { QuickNpcRequirementsFields } from './quick-npc-requirements-fields'
import {
  quickNpcStartingChoiceEmptyClasses,
  quickNpcStartingChoiceProvenanceClasses,
  quickNpcStartingChoiceSectionClasses,
  quickNpcStartingChoicesClasses,
  quickNpcStartingChoiceValueClasses,
} from './quick-npc-starting-choices.variants'

const ADD_STARTING_CHOICE_LABEL = '+ Add starting choice'

function idsOverlap(left: string, right: string): boolean {
  const rightKeys = new Set(identityKeys(right))
  return identityKeys(left).some((key) => rightKeys.has(key))
}

function identityKeys(id: string): string[] {
  const keys = [id]
  const separator = id.lastIndexOf(':')
  if (separator >= 0) keys.push(id.slice(separator + 1))
  return keys
}

export type QuickNpcStartingChoicesProps = {
  setup: QuickNpcSetupValues
  buildContext: CharacterBuildContext
  createContext: QuickNpcCreateContext
  optionSets: QuickNpcRequirementOptionSets
}

// fallow-ignore-next-line complexity
export function QuickNpcStartingChoices({
  setup,
  buildContext,
  createContext,
  optionSets,
}: QuickNpcStartingChoicesProps) {
  const form = useFormContext<QuickNpcAuthoringTabFormValues>()
  const overrides = form.watch(QUICK_NPC_STARTING_CHOICE_OVERRIDES_FIELD_NAME) ?? {}
  const requiredWeaponIds = form.watch(QUICK_NPC_REQUIRED_WEAPON_FIELD_NAME) ?? []
  const requiredSpellIds = form.watch(QUICK_NPC_REQUIRED_SPELL_FIELD_NAME) ?? []
  const [expandedKind, setExpandedKind] = React.useState<NpcStartingChoiceKind | null>(null)
  const [addMenuOpen, setAddMenuOpen] = React.useState(false)

  const choices = React.useMemo(
    () =>
      resolveQuickNpcStartingChoices({
        setup,
        context: buildContext,
        createContext,
        startingChoiceOverrides: overrides,
        requiredWeaponIds,
        requiredSpellIds,
      }),
    [buildContext, createContext, overrides, requiredSpellIds, requiredWeaponIds, setup],
  )
  const categories = groupStartingChoicesByKind(choices)
  const satisfiedIds = choices.entries.flatMap((entry) => [...entry.selectedIds])

  const addableKinds = (
    [
      optionSets.weapons.length > 0 ? 'weapon' : null,
      optionSets.spells.length > 0 ? 'spell' : null,
    ] as const
  ).filter((kind): kind is 'weapon' | 'spell' => kind !== null)

  function writeOverrides(next: Record<string, string[]>) {
    form.setValue(QUICK_NPC_STARTING_CHOICE_OVERRIDES_FIELD_NAME, next, { shouldDirty: true })
  }

  function beginEdit(kind: NpcStartingChoiceKind) {
    if (kind === 'skill' || kind === 'tool' || kind === 'language') {
      const next = { ...overrides }
      for (const entry of choices.entries) {
        if (entry.kind !== kind || !entry.choiceSetId || entry.overridden) continue
        next[entry.choiceSetId] = [...entry.selectedIds]
      }
      writeOverrides(next)
    }
    setExpandedKind(kind)
    setAddMenuOpen(false)
  }

  return (
    <div className={quickNpcStartingChoicesClasses}>
      {categories.length === 0 ? (
        <p className={quickNpcStartingChoiceEmptyClasses}>No starting choices have been added.</p>
      ) : (
        categories.map((category) => {
          const expanded = expandedKind === category.kind
          const valueLabel = category.entries
            .flatMap((entry) =>
              startingChoiceLabels({ context: buildContext, setup, ids: entry.selectedIds }),
            )
            .join(', ')
          return (
            <section key={category.kind} className={quickNpcStartingChoiceSectionClasses}>
              <EyebrowActionHeader
                eyebrow={category.label}
                actionLabel={expanded ? 'Done' : category.canChange ? 'Change' : undefined}
                actionAriaLabel={
                  expanded ? `Done editing ${category.label}` : `Change ${category.label}`
                }
                onAction={
                  expanded
                    ? () => setExpandedKind(null)
                    : category.canChange
                      ? () => beginEdit(category.kind)
                      : undefined
                }
              />
              {expanded ? (
                <StartingChoiceEditor
                  categoryKind={category.kind}
                  entries={category.entries}
                  setup={setup}
                  buildContext={buildContext}
                  optionSets={optionSets}
                  satisfiedIds={satisfiedIds}
                  overrides={overrides}
                  onOverridesChange={writeOverrides}
                />
              ) : (
                <>
                  {valueLabel ? (
                    <p className={quickNpcStartingChoiceValueClasses}>{valueLabel}</p>
                  ) : null}
                  {category.entries.map((entry) => (
                    <p
                      key={entry.choiceSetId ?? `${entry.kind}:${entry.ownership}`}
                      className={quickNpcStartingChoiceProvenanceClasses}
                    >
                      {formatStartingChoiceProvenance(entry)}
                    </p>
                  ))}
                </>
              )}
            </section>
          )
        })
      )}
      {expandedKind === 'weapon' && !categories.some((category) => category.kind === 'weapon') ? (
        <ManualDraftEditor
          kind="weapon"
          optionSets={optionSets}
          satisfiedIds={satisfiedIds}
          onDone={() => setExpandedKind(null)}
        />
      ) : null}
      {expandedKind === 'spell' && !categories.some((category) => category.kind === 'spell') ? (
        <ManualDraftEditor
          kind="spell"
          optionSets={optionSets}
          satisfiedIds={satisfiedIds}
          onDone={() => setExpandedKind(null)}
        />
      ) : null}
      {addableKinds.length > 0 ? (
        <div className="flex flex-col gap-y-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setAddMenuOpen((open) => !open)}
          >
            {ADD_STARTING_CHOICE_LABEL}
          </Button>
          {addMenuOpen ? (
            <div className="flex flex-col gap-y-1" role="menu">
              {addableKinds.map((kind) => (
                <Button
                  key={kind}
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => beginEdit(kind)}
                >
                  {startingChoiceKindLabel(kind).replace(/s$/, '')}
                </Button>
              ))}
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}

function StartingChoiceEditor({
  categoryKind,
  entries,
  setup,
  buildContext,
  optionSets,
  satisfiedIds,
  overrides,
  onOverridesChange,
}: {
  categoryKind: NpcStartingChoiceKind
  entries: readonly import('@rpg/contracts').NpcStartingChoiceEntry[]
  setup: QuickNpcSetupValues
  buildContext: CharacterBuildContext
  optionSets: QuickNpcRequirementOptionSets
  satisfiedIds: readonly string[]
  overrides: Record<string, string[]>
  onOverridesChange: (next: Record<string, string[]>) => void
}) {
  if (categoryKind === 'weapon' || categoryKind === 'spell') {
    return (
      <ManualDraftEditor
        kind={categoryKind}
        optionSets={optionSets}
        satisfiedIds={satisfiedIds.filter((id) => {
          const manual = entries.find((entry) => entry.ownership === 'manual')
          return !manual?.selectedIds.some((selected) => idsOverlap(selected, id))
        })}
        onDone={() => undefined}
        hideDone
      />
    )
  }

  return (
    <div className="flex flex-col gap-y-3">
      {entries.map((entry) => {
        if (!entry.editable || !entry.choiceSetId) {
          const labels = startingChoiceLabels({
            context: buildContext,
            setup,
            ids: entry.selectedIds,
          })
          return (
            <div key={`${entry.kind}:${entry.ownership}`}>
              <p className={quickNpcStartingChoiceValueClasses}>{labels.join(', ')}</p>
              <p className={quickNpcStartingChoiceProvenanceClasses}>
                {formatStartingChoiceProvenance(entry)}
              </p>
            </div>
          )
        }
        const selectedIds = overrides[entry.choiceSetId] ?? [...entry.selectedIds]
        const labels = startingChoiceLabels({ context: buildContext, setup, ids: selectedIds })
        const options = allowancePickerOptions({
          context: buildContext,
          setup,
          choiceSetId: entry.choiceSetId,
          selectedIds,
        })
        const required = entry.allowance?.required ?? selectedIds.length
        return (
          <div key={entry.choiceSetId} className="flex flex-col gap-y-2">
            <p className={quickNpcStartingChoiceProvenanceClasses}>
              {`Choose ${required} ${required === 1 ? 'option' : 'options'}.`}
            </p>
            {labels.map((label, index) => (
              <div key={selectedIds[index]} className="flex items-center justify-between gap-2">
                <span className={quickNpcStartingChoiceValueClasses}>{label}</span>
                <ActionButton
                  action="remove"
                  variant="ghost"
                  size="icon"
                  density="compact"
                  aria-label={`Remove ${label}`}
                  onClick={() => {
                    const nextIds = selectedIds.filter((id) => id !== selectedIds[index])
                    onOverridesChange({ ...overrides, [entry.choiceSetId!]: nextIds })
                  }}
                />
              </div>
            ))}
            {selectedIds.length < required && options.length > 0 ? (
              <ComboboxField
                id={`starting-choice-${entry.choiceSetId}`}
                label={`Add ${startingChoiceKindLabel(categoryKind).toLowerCase()}`}
                options={options}
                value=""
                onChange={(next) => {
                  const value = Array.isArray(next) ? next[0] : next
                  if (!value || selectedIds.includes(value)) return
                  onOverridesChange({
                    ...overrides,
                    [entry.choiceSetId!]: [...selectedIds, value],
                  })
                }}
                placeholder={`+ Add ${startingChoiceKindLabel(categoryKind).replace(/s$/, '').toLowerCase()}`}
                emptyMessage="No matching options"
              />
            ) : null}
            <ChoiceSelectionCounter selectedCount={selectedIds.length} max={required} />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                const next = { ...overrides }
                delete next[entry.choiceSetId!]
                onOverridesChange(next)
              }}
            >
              {required === 1 ? 'Use suggested choice' : 'Use suggested choices'}
            </Button>
          </div>
        )
      })}
    </div>
  )
}

function ManualDraftEditor({
  kind,
  optionSets,
  satisfiedIds,
  onDone,
  hideDone = false,
}: {
  kind: 'weapon' | 'spell'
  optionSets: QuickNpcRequirementOptionSets
  satisfiedIds: readonly string[]
  onDone: () => void
  hideDone?: boolean
}) {
  const weapons = optionSets.weapons.filter(
    (entry) => !satisfiedIds.some((id) => idsOverlap(id, entry.option.value)),
  )
  const spells = optionSets.spells.filter(
    (entry) => !satisfiedIds.some((id) => idsOverlap(id, entry.option.value)),
  )
  return (
    <div className="flex flex-col gap-y-2">
      {hideDone ? null : (
        <EyebrowActionHeader
          eyebrow={startingChoiceKindLabel(kind)}
          actionLabel="Done"
          actionAriaLabel={`Done editing ${startingChoiceKindLabel(kind)}`}
          onAction={onDone}
        />
      )}
      <QuickNpcRequirementsFields
        optionSets={{
          weapons: kind === 'weapon' ? weapons : [],
          spells: kind === 'spell' ? spells : [],
        }}
      />
      <p className={quickNpcStartingChoiceProvenanceClasses}>Added manually</p>
    </div>
  )
}
