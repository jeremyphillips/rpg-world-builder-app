import * as React from 'react'
import { ChevronDown } from 'lucide-react'
import { useFormContext } from 'react-hook-form'

import { EntityActionChoiceMenu } from '@/features/content'

import { Button, ChoiceSelectionCounter, ComboboxField, Eyebrow, StatusDot, cn } from '@rpg/ui'
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
  groupStartingChoicesByKind,
  normalizeStartingChoiceOverride,
  resolveCanonicalStartingChoiceAllowance,
  resolveQuickNpcStartingChoices,
  resolveStartingChoiceSuggestionLabels,
  startingChoiceAlsoGrantedHint,
  startingChoiceAllowancePresentation,
  resolveStartingChoiceCategoryAllowanceStatus,
  startingChoiceCategorySummary,
  startingChoiceDisplayLabels,
  startingChoiceHasNamedAttribution,
  startingChoiceKindLabel,
  startingChoicePickerOptions,
  startingChoiceResetLabel,
  startingChoiceShowSuggestedReset,
  startingChoiceSuggestionHint,
} from '../../lib/quick-npc/quick-npc-starting-choices.lib'

import { ChoiceGrantedRow } from '../../../components/builder/steps/shared/choice-section/choice-granted-row'
import { QuickNpcRequirementsFields } from './quick-npc-requirements-fields'
import { QuickNpcStartingChoiceSelectedRow } from './quick-npc-starting-choice-selected-row'
import {
  quickNpcStartingChoiceAddFooterClasses,
  quickNpcStartingChoiceAllowanceHintClasses,
  quickNpcStartingChoiceEmptyClasses,
  quickNpcStartingChoiceExpandedPanelClasses,
  quickNpcStartingChoiceHeadingClasses,
  quickNpcStartingChoiceIdentityStackClasses,
  quickNpcStartingChoiceInnerPanelClasses,
  quickNpcStartingChoiceInnerSectionClasses,
  quickNpcStartingChoiceOptionsContainerClasses,
  quickNpcStartingChoiceProvenanceClasses,
  quickNpcStartingChoiceRowActionsClasses,
  quickNpcStartingChoiceRowCaretClasses,
  quickNpcStartingChoiceRowCaretExpandedClasses,
  quickNpcStartingChoiceRowHeaderClasses,
  quickNpcStartingChoiceRowStatusSlotClasses,
  quickNpcStartingChoiceRowClasses,
  quickNpcStartingChoiceRowSummaryClasses,
  quickNpcStartingChoicesClasses,
  quickNpcStartingChoiceSelectedListClasses,
  quickNpcStartingChoiceStatusAfterOptionsClasses,
  quickNpcStartingChoiceStatusRowClasses,
  quickNpcStartingChoiceSuggestionHintClasses,
} from './quick-npc-starting-choices.variants'

const QUICK_NPC_ADD_STARTING_CHOICE_LABEL = 'Add starting choice'
const QUICK_NPC_ADD_STARTING_CHOICE_WEAPON_DESCRIPTION =
  'Require a weapon this NPC must carry or use.'
const QUICK_NPC_ADD_STARTING_CHOICE_SPELL_DESCRIPTION =
  'Require a spell this NPC must know or prepare.'

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

  function beginEdit(kind: StartingChoiceCategory) {
    if (expandedKind && expandedKind !== kind) {
      finishEdit(expandedKind)
    }
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
  }

  function toggleCategory(kind: StartingChoiceCategory) {
    if (expandedKind === kind) {
      finishEdit(kind)
      return
    }
    beginEdit(kind)
  }

  const showContainer = categories.length > 0 || addableKinds.length > 0

  if (!showContainer) {
    return (
      <p className={quickNpcStartingChoiceEmptyClasses}>No starting choices have been added.</p>
    )
  }

  return (
    <div className={quickNpcStartingChoicesClasses}>
      {categories.map((category) => {
        const expanded = expandedKind === category.kind
        const summary = startingChoiceCategorySummary({
          context: buildContext,
          choices,
          entries: category.entries,
        })
        const allowanceStatus = resolveStartingChoiceCategoryAllowanceStatus({
          entries: category.entries,
          overrides,
        })
        return (
          <StartingChoiceCategoryRow
            key={category.kind}
            eyebrow={category.label}
            summary={summary}
            allowanceStatus={allowanceStatus}
            expanded={expanded}
            onToggle={() => toggleCategory(category.kind)}
            panel={
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
            }
          />
        )
      })}
      {expandedKind === 'weapon' && !categories.some((category) => category.kind === 'weapon') ? (
        <StartingChoiceCategoryRow
          eyebrow={startingChoiceKindLabel('weapon')}
          summary=""
          allowanceStatus="none"
          expanded
          onToggle={() => finishEdit('weapon')}
          panel={
            <ManualDraftEditor kind="weapon" optionSets={optionSets} satisfiedIds={satisfiedIds} />
          }
        />
      ) : null}
      {expandedKind === 'spell' && !categories.some((category) => category.kind === 'spell') ? (
        <StartingChoiceCategoryRow
          eyebrow={startingChoiceKindLabel('spell')}
          summary=""
          allowanceStatus="none"
          expanded
          onToggle={() => finishEdit('spell')}
          panel={
            <ManualDraftEditor kind="spell" optionSets={optionSets} satisfiedIds={satisfiedIds} />
          }
        />
      ) : null}
      {addableKinds.length > 0 ? (
        <div className={quickNpcStartingChoiceAddFooterClasses}>
          <EntityActionChoiceMenu
            triggerLabel={QUICK_NPC_ADD_STARTING_CHOICE_LABEL}
            menuHeading={QUICK_NPC_ADD_STARTING_CHOICE_LABEL}
            items={addableKinds.map((kind) => ({
              id: kind,
              label: startingChoiceKindLabel(kind).replace(/s$/, ''),
              description:
                kind === 'weapon'
                  ? QUICK_NPC_ADD_STARTING_CHOICE_WEAPON_DESCRIPTION
                  : QUICK_NPC_ADD_STARTING_CHOICE_SPELL_DESCRIPTION,
              onSelect: () => beginEdit(kind),
            }))}
          />
        </div>
      ) : null}
    </div>
  )
}

const STARTING_CHOICE_CATEGORY_STATUS_LABEL = {
  complete: 'All required choices complete',
  incomplete: 'Required choices incomplete',
} as const

function StartingChoiceCategoryRow({
  eyebrow,
  summary,
  allowanceStatus,
  expanded,
  onToggle,
  panel,
}: {
  eyebrow: string
  summary: string
  allowanceStatus: ReturnType<typeof resolveStartingChoiceCategoryAllowanceStatus>
  expanded: boolean
  onToggle: () => void
  panel: React.ReactNode
}) {
  const statusLabel =
    allowanceStatus === 'none' ? undefined : STARTING_CHOICE_CATEGORY_STATUS_LABEL[allowanceStatus]
  const actionLabel = expanded ? `Done editing ${eyebrow}` : `Expand ${eyebrow}`
  const ariaLabel = statusLabel ? `${actionLabel}. ${statusLabel}.` : actionLabel

  return (
    <section className={quickNpcStartingChoiceRowClasses}>
      <button
        type="button"
        className={quickNpcStartingChoiceRowHeaderClasses}
        aria-expanded={expanded}
        aria-label={ariaLabel}
        onClick={onToggle}
      >
        <Eyebrow size="sm" className="shrink-0">
          {eyebrow}
        </Eyebrow>
        <span className={quickNpcStartingChoiceRowSummaryClasses}>{summary}</span>
        <span className={quickNpcStartingChoiceRowActionsClasses}>
          <span className={quickNpcStartingChoiceRowStatusSlotClasses}>
            {allowanceStatus === 'complete' ? (
              <StatusDot tone="success" size="md" />
            ) : allowanceStatus === 'incomplete' ? (
              <StatusDot tone="warning" size="md" />
            ) : null}
          </span>
          <ChevronDown
            className={cn(
              quickNpcStartingChoiceRowCaretClasses,
              expanded && quickNpcStartingChoiceRowCaretExpandedClasses,
            )}
            aria-hidden
          />
        </span>
      </button>
      {expanded ? (
        <div className={quickNpcStartingChoiceExpandedPanelClasses}>
          <div className={quickNpcStartingChoiceInnerPanelClasses}>{panel}</div>
        </div>
      ) : null}
    </section>
  )
}

function AllowanceFillStatusRow({
  selectedCount,
  required,
  showReset,
  resetLabel,
  onReset,
  className,
}: {
  selectedCount: number
  required: number
  showReset?: boolean
  resetLabel?: string
  onReset?: () => void
  className?: string
}) {
  return (
    <div className={cn(quickNpcStartingChoiceStatusRowClasses, className)}>
      <ChoiceSelectionCounter selectedCount={selectedCount} max={required} />
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
      />
    )
  }

  const fixedEntries = entries.filter((entry) => entry.mechanic === 'fixed-grant')
  const allowanceEntries = entries.filter((entry) => entry.mechanic === 'choice-allowance')

  return (
    <>
      {fixedEntries.map((entry) => {
        const labels = startingChoiceDisplayLabels({
          context: buildContext,
          choices,
          contribution: entry,
        })
        const sourceLabel = formatFixedGrantProvenance(entry, buildContext)
        return (
          <div key={entry.id} className={quickNpcStartingChoiceInnerSectionClasses}>
            <ul className={quickNpcStartingChoiceSelectedListClasses}>
              {labels.map((label) => (
                <li key={`${entry.id}-${label}`}>
                  <ChoiceGrantedRow
                    row={{
                      id: `${entry.id}:${label}`,
                      label,
                      sourceLabel,
                    }}
                  />
                </li>
              ))}
            </ul>
          </div>
        )
      })}
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
          <div key={entry.id} className={quickNpcStartingChoiceInnerSectionClasses}>
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
                <ul className={quickNpcStartingChoiceSelectedListClasses}>
                  {labels.map((label, index) => {
                    const selectedId = selectedIds[index]
                    const alsoGrantedHint = selectedId
                      ? startingChoiceAlsoGrantedHint(
                          entry,
                          choices.contributions,
                          selectedId,
                          buildContext,
                        )
                      : undefined
                    return (
                      <li key={selectedId}>
                        <QuickNpcStartingChoiceSelectedRow
                          label={label}
                          alsoGrantedHint={alsoGrantedHint}
                          onRemove={() => {
                            updateSelectedIds(selectedIds.filter((id) => id !== selectedId))
                          }}
                        />
                      </li>
                    )
                  })}
                </ul>
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
    </>
  )
}

function ManualDraftEditor({
  kind,
  optionSets,
  satisfiedIds,
}: {
  kind: 'weapon' | 'spell'
  optionSets: QuickNpcRequirementOptionSets
  satisfiedIds: readonly string[]
}) {
  const weapons = optionSets.weapons.filter(
    (entry) => !satisfiedIds.some((id) => optionIdentitiesOverlap(id, entry.option.value)),
  )
  const spells = optionSets.spells.filter(
    (entry) => !satisfiedIds.some((id) => optionIdentitiesOverlap(id, entry.option.value)),
  )
  return (
    <div className={quickNpcStartingChoiceInnerSectionClasses}>
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
