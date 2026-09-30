import * as React from 'react'
import { useFormContext } from 'react-hook-form'

import { ActionButton, Button, ChoiceSelectionCounter, ComboboxField, cn } from '@rpg/ui'
import {
  optionIdentitiesOverlap,
  type CharacterBuildContext,
  type StartingChoiceCategory,
  type StartingChoiceContribution,
} from '@rpg/contracts'

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
  formatFixedGrantProvenance,
  formatStartingChoiceProvenance,
  groupStartingChoicesByKind,
  normalizeStartingChoiceOverride,
  resolveCanonicalStartingChoiceAllowance,
  resolveQuickNpcStartingChoices,
  resolveStartingChoiceSuggestionLabels,
  startingChoiceAlsoGrantedHint,
  startingChoiceAllowancePresentation,
  startingChoiceDisplayLabels,
  startingChoiceHasNamedAttribution,
  startingChoiceKindLabel,
  startingChoicePickerOptions,
  startingChoiceResetLabel,
  startingChoiceShowSuggestedReset,
  startingChoiceSuggestionHint,
} from '../../lib/quick-npc/quick-npc-starting-choices.lib'
import { EyebrowActionHeader } from '@/lib/create-setup'

import { QuickNpcRequirementsFields } from './quick-npc-requirements-fields'
import {
  quickNpcStartingChoiceAllowanceEditClasses,
  quickNpcStartingChoiceAllowanceEditStackClasses,
  quickNpcStartingChoiceAllowanceHintClasses,
  quickNpcStartingChoiceCounterRowClasses,
  quickNpcStartingChoiceEmptyClasses,
  quickNpcStartingChoiceGrantedBlockClasses,
  quickNpcStartingChoiceGrantedLabelClasses,
  quickNpcStartingChoiceHeadingClasses,
  quickNpcStartingChoiceIdentityStackClasses,
  quickNpcStartingChoiceOptionRowClasses,
  quickNpcStartingChoiceOptionsContainerClasses,
  quickNpcStartingChoiceOptionsListClasses,
  quickNpcStartingChoiceProvenanceClasses,
  quickNpcStartingChoiceSectionBodyClasses,
  quickNpcStartingChoiceSectionClasses,
  quickNpcStartingChoicesClasses,
  quickNpcStartingChoiceStatusAfterOptionsClasses,
  quickNpcStartingChoiceStatusRowClasses,
  quickNpcStartingChoiceSuggestionHintClasses,
  quickNpcStartingChoiceValueClasses,
} from './quick-npc-starting-choices.variants'

const ADD_STARTING_CHOICE_LABEL = '+ Add starting choice'

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
  const [expandedKind, setExpandedKind] = React.useState<StartingChoiceCategory | null>(null)
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
  const suggestionLabels = React.useMemo(
    () =>
      resolveStartingChoiceSuggestionLabels({
        setup,
        context: buildContext,
        createContext,
      }),
    [buildContext, createContext, setup],
  )
  const satisfiedIds = choices.contributions.flatMap((entry) => [...entry.selectedIds])

  const addableKinds = (
    [
      optionSets.weapons.length > 0 ? 'weapon' : null,
      optionSets.spells.length > 0 ? 'spell' : null,
    ] as const
  ).filter((kind): kind is 'weapon' | 'spell' => kind !== null)

  function writeOverrides(next: Record<string, string[]>) {
    form.setValue(QUICK_NPC_STARTING_CHOICE_OVERRIDES_FIELD_NAME, next, { shouldDirty: true })
  }

  function beginEdit(kind: StartingChoiceCategory) {
    if (kind === 'skill' || kind === 'tool' || kind === 'language') {
      const next = { ...overrides }
      for (const entry of choices.contributions) {
        if (entry.category !== kind || entry.mechanic !== 'choice-allowance' || entry.overridden) {
          continue
        }
        next[entry.choiceSetId] = [...entry.selectedIds]
      }
      writeOverrides(next)
    }
    setExpandedKind(kind)
    setAddMenuOpen(false)
  }

  function finishEdit(kind: StartingChoiceCategory) {
    if (kind === 'skill' || kind === 'tool' || kind === 'language') {
      const next = { ...overrides }
      for (const entry of choices.contributions) {
        if (entry.category !== kind || entry.mechanic !== 'choice-allowance') continue
        const current = next[entry.choiceSetId] ?? [...entry.selectedIds]
        const canonical = resolveCanonicalStartingChoiceAllowance({
          setup,
          context: buildContext,
          createContext,
          choiceSetId: entry.choiceSetId,
          startingChoiceOverrides: next,
          requiredWeaponIds,
          requiredSpellIds,
        })
        const normalized = normalizeStartingChoiceOverride({
          currentIds: current,
          canonicalIds: canonical.selectedIds,
        })
        if (normalized) next[entry.choiceSetId] = normalized
        else delete next[entry.choiceSetId]
      }
      writeOverrides(next)
    }
    setExpandedKind(null)
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
              startingChoiceDisplayLabels({ context: buildContext, choices, contribution: entry }),
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
                    ? () => finishEdit(category.kind)
                    : category.canChange
                      ? () => beginEdit(category.kind)
                      : undefined
                }
              />
              <div className={quickNpcStartingChoiceSectionBodyClasses}>
                {expanded ? (
                  <StartingChoiceEditor
                    categoryKind={category.kind}
                    entries={category.entries}
                    choices={choices}
                    suggestionLabels={suggestionLabels}
                    setup={setup}
                    buildContext={buildContext}
                    createContext={createContext}
                    optionSets={optionSets}
                    satisfiedIds={satisfiedIds}
                    overrides={overrides}
                    requiredWeaponIds={requiredWeaponIds}
                    requiredSpellIds={requiredSpellIds}
                    onOverridesChange={writeOverrides}
                  />
                ) : (
                  <>
                    {valueLabel ? (
                      <p className={quickNpcStartingChoiceValueClasses}>{valueLabel}</p>
                    ) : null}
                    {category.entries.map((entry) => {
                      if (entry.mechanic === 'choice-allowance') {
                        const presentation = startingChoiceAllowancePresentation(choices, entry)
                        return (
                          <AllowanceFillStatusRow
                            key={entry.id}
                            heading={presentation?.heading}
                            sourceLabel={presentation?.sourceLabel}
                            selectedCount={entry.selectedIds.length}
                            required={entry.allowance.min}
                          />
                        )
                      }
                      const provenance = formatStartingChoiceProvenance(entry, buildContext)
                      if (!provenance) return null
                      return (
                        <p key={entry.id} className={quickNpcStartingChoiceProvenanceClasses}>
                          {provenance}
                        </p>
                      )
                    })}
                  </>
                )}
              </div>
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

function AllowanceFillStatusRow({
  heading,
  sourceLabel,
  selectedCount,
  required,
  showReset,
  resetLabel,
  onReset,
  className,
}: {
  heading?: string
  sourceLabel?: string
  selectedCount: number
  required: number
  showReset?: boolean
  resetLabel?: string
  onReset?: () => void
  className?: string
}) {
  return (
    <div className={cn(quickNpcStartingChoiceStatusRowClasses, className)}>
      <div className={quickNpcStartingChoiceIdentityStackClasses}>
        <div className={quickNpcStartingChoiceCounterRowClasses}>
          {heading ? <span className={quickNpcStartingChoiceHeadingClasses}>{heading}</span> : null}
          {heading ? <span className={quickNpcStartingChoiceProvenanceClasses}>·</span> : null}
          <ChoiceSelectionCounter selectedCount={selectedCount} max={required} />
        </div>
        {sourceLabel ? (
          <p className={quickNpcStartingChoiceProvenanceClasses}>{sourceLabel}</p>
        ) : null}
      </div>
      {showReset && resetLabel && onReset ? (
        <Button type="button" variant="text" size="sm" density="compact" onClick={onReset}>
          {resetLabel}
        </Button>
      ) : null}
    </div>
  )
}

function StartingChoiceEditor({
  categoryKind,
  entries,
  choices,
  suggestionLabels,
  setup,
  buildContext,
  createContext,
  optionSets,
  satisfiedIds,
  overrides,
  requiredWeaponIds,
  requiredSpellIds,
  onOverridesChange,
}: {
  categoryKind: StartingChoiceCategory
  entries: readonly StartingChoiceContribution[]
  choices: ReturnType<typeof resolveQuickNpcStartingChoices>
  suggestionLabels: ReturnType<typeof resolveStartingChoiceSuggestionLabels>
  setup: QuickNpcSetupValues
  buildContext: CharacterBuildContext
  createContext: QuickNpcCreateContext
  optionSets: QuickNpcRequirementOptionSets
  satisfiedIds: readonly string[]
  overrides: Record<string, string[]>
  requiredWeaponIds: readonly string[]
  requiredSpellIds: readonly string[]
  onOverridesChange: (next: Record<string, string[]>) => void
}) {
  if (categoryKind === 'weapon' || categoryKind === 'spell') {
    const manual = entries.find((entry) => entry.mechanic === 'explicit-constraint')
    return (
      <ManualDraftEditor
        kind={categoryKind}
        optionSets={optionSets}
        satisfiedIds={satisfiedIds.filter(
          (id) => !manual?.selectedIds.some((selected) => optionIdentitiesOverlap(selected, id)),
        )}
        onDone={() => undefined}
        hideDone
      />
    )
  }

  const fixedEntries = entries.filter((entry) => entry.mechanic === 'fixed-grant')
  const allowanceEntries = entries.filter((entry) => entry.mechanic === 'choice-allowance')

  return (
    <div className={quickNpcStartingChoiceAllowanceEditStackClasses}>
      {fixedEntries.length > 0 ? (
        <div className={quickNpcStartingChoiceGrantedBlockClasses}>
          <p className={quickNpcStartingChoiceGrantedLabelClasses}>Granted</p>
          {fixedEntries.map((entry) => {
            const labels = startingChoiceDisplayLabels({
              context: buildContext,
              choices,
              contribution: entry,
            })
            return (
              <div key={entry.id}>
                <p className={quickNpcStartingChoiceValueClasses}>{labels.join(', ')}</p>
                <p className={quickNpcStartingChoiceProvenanceClasses}>
                  {formatFixedGrantProvenance(entry, buildContext)}
                </p>
              </div>
            )
          })}
        </div>
      ) : null}
      {allowanceEntries.map((entry) => {
        const selectedIds = overrides[entry.choiceSetId] ?? [...entry.selectedIds]
        const labels = selectedIds.map((id, index) => {
          const labeled = startingChoiceDisplayLabels({
            context: buildContext,
            choices: {
              ...choices,
              contributions: [{ ...entry, selectedIds }],
            },
            contribution: { ...entry, selectedIds },
          })
          return labeled[index] ?? id
        })
        const options = startingChoicePickerOptions({
          context: buildContext,
          choices,
          choiceSetId: entry.choiceSetId,
          selectedIds,
        })
        const required = entry.allowance.min
        const choiceSetId = entry.choiceSetId
        const canonical = resolveCanonicalStartingChoiceAllowance({
          setup,
          context: buildContext,
          createContext,
          choiceSetId,
          startingChoiceOverrides: overrides,
          requiredWeaponIds,
          requiredSpellIds,
        })
        const showReset = startingChoiceShowSuggestedReset({
          currentIds: selectedIds,
          canonical,
          overridden: entry.overridden || overrides[choiceSetId] !== undefined,
        })
        const namedAttribution = startingChoiceHasNamedAttribution({
          selectedIds: canonical.selectedIds,
          suggestedBy: canonical.suggestedBy,
          labels: suggestionLabels,
        })
        const presentation = startingChoiceAllowancePresentation(choices, entry)
        const suggestionHint = startingChoiceSuggestionHint({
          selectedIds: canonical.selectedIds,
          suggestedBy: canonical.suggestedBy,
          labels: suggestionLabels,
        })
        function updateSelectedIds(nextIds: string[]) {
          onOverridesChange({ ...overrides, [choiceSetId]: nextIds })
        }
        return (
          <div key={entry.id} className={quickNpcStartingChoiceAllowanceEditClasses}>
            {presentation ? (
              <div className={quickNpcStartingChoiceIdentityStackClasses}>
                <p className={quickNpcStartingChoiceHeadingClasses}>{presentation.heading}</p>
                {presentation.sourceLabel ? (
                  <p className={quickNpcStartingChoiceProvenanceClasses}>
                    {presentation.sourceLabel}
                  </p>
                ) : null}
                <p className={quickNpcStartingChoiceAllowanceHintClasses}>
                  {presentation.poolDescription}
                </p>
              </div>
            ) : null}
            <div className={quickNpcStartingChoiceOptionsContainerClasses}>
              {labels.length > 0 ? (
                <div className={quickNpcStartingChoiceOptionsListClasses}>
                  {labels.map((label, index) => {
                    const selectedId = selectedIds[index]
                    const alsoGranted = selectedId
                      ? startingChoiceAlsoGrantedHint(
                          entry,
                          choices.contributions,
                          selectedId,
                          buildContext,
                        )
                      : undefined
                    return (
                      <div key={selectedId} className={quickNpcStartingChoiceOptionRowClasses}>
                        <span className={quickNpcStartingChoiceValueClasses}>
                          {label}
                          {alsoGranted ? (
                            <span className={quickNpcStartingChoiceSuggestionHintClasses}>
                              {' '}
                              · {alsoGranted}
                            </span>
                          ) : null}
                        </span>
                        <ActionButton
                          action="remove"
                          variant="ghost"
                          size="icon"
                          density="compact"
                          aria-label={`Remove ${label}`}
                          onClick={() => {
                            updateSelectedIds(selectedIds.filter((id) => id !== selectedId))
                          }}
                        />
                      </div>
                    )
                  })}
                </div>
              ) : null}
              {selectedIds.length < required && options.length > 0 ? (
                <ComboboxField
                  id={`starting-choice-${entry.choiceSetId}`}
                  label={`Add ${startingChoiceKindLabel(categoryKind).toLowerCase()}`}
                  options={options}
                  value=""
                  onChange={(next) => {
                    const value = Array.isArray(next) ? next[0] : next
                    if (!value || selectedIds.includes(value)) return
                    updateSelectedIds([...selectedIds, value])
                  }}
                  placeholder={`+ Add ${startingChoiceKindLabel(categoryKind).replace(/s$/, '').toLowerCase()}`}
                  emptyMessage="No matching options"
                />
              ) : null}
            </div>
            <AllowanceFillStatusRow
              className={quickNpcStartingChoiceStatusAfterOptionsClasses}
              selectedCount={selectedIds.length}
              required={required}
              showReset={showReset}
              resetLabel={startingChoiceResetLabel({ count: required, namedAttribution })}
              onReset={() => {
                const next = { ...overrides }
                delete next[choiceSetId]
                onOverridesChange(next)
              }}
            />
            {suggestionHint ? (
              <p className={quickNpcStartingChoiceSuggestionHintClasses}>{suggestionHint}</p>
            ) : null}
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
    (entry) => !satisfiedIds.some((id) => optionIdentitiesOverlap(id, entry.option.value)),
  )
  const spells = optionSets.spells.filter(
    (entry) => !satisfiedIds.some((id) => optionIdentitiesOverlap(id, entry.option.value)),
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
