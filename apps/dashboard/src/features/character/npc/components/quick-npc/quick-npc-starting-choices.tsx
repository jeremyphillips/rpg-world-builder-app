import * as React from 'react'
import { ChevronDown } from 'lucide-react'
import { useFormContext } from 'react-hook-form'

import { EntityActionChoiceMenu } from '@/features/content'

import { Button, ChoiceSelectionCounter, ComboboxField, Eyebrow, StatusDot, cn } from '@rpg/ui'

import { QUICK_NPC_CREATE_CHOICE_SELECTION_COUNTER_SIZE } from '../../lib/quick-npc/quick-npc-create-modal-setup.lib'
import {
  indexCharacterBuildCatalog,
  type CharacterBuildContext,
  type StartingChoiceCategory,
  type StartingChoiceContribution,
} from '@rpg/contracts'

import type { QuickNpcCreateContext } from '../../lib/quick-npc/quick-npc-create-context'
import {
  splitQuickNpcAdditionalEquipmentIds,
  type QuickNpcAdditionalEquipmentOption,
} from '../../lib/quick-npc/quick-npc-additional-equipment.lib'
import {
  QUICK_NPC_ADDITIONAL_EQUIPMENT_FIELD_NAME,
  QUICK_NPC_REQUIRED_SPELL_FIELD_NAME,
  QUICK_NPC_STARTING_CHOICE_OVERRIDES_FIELD_NAME,
  type QuickNpcAuthoringTabFormValues,
  type QuickNpcSetupValues,
} from '../../lib/quick-npc/quick-npc-form-fields'
import type { QuickNpcRequirementOptionSets } from '../../lib/quick-npc/quick-npc-requirement-options.lib'
import {
  normalizeStartingChoiceOverride,
  resolveCanonicalStartingChoiceAllowance,
  resolveQuickNpcStartingChoices,
  resolveStartingChoiceSuggestionLabels,
  startingChoiceAddPlaceholder,
  startingChoiceAlsoGrantedHint,
  startingChoiceAllowancePresentation,
  resolveStartingChoiceCategoryAllowanceStatus,
  resolveStartingChoiceCategoryLabels,
  startingChoiceDisplayLabels,
  startingChoiceHasNamedAttribution,
  startingChoiceKindLabel,
  startingChoicePickerOptions,
  startingChoiceResetLabel,
  startingChoiceShowSuggestedReset,
  startingChoiceSuggestionHint,
  groupStartingChoicesByKind,
} from '../../lib/quick-npc/quick-npc-starting-choices.lib'
import {
  resolveQuickNpcStartingEquipmentPackageContext,
  resolveStartingChoiceEquipmentCategoryLabels,
} from '../../lib/quick-npc/quick-npc-starting-equipment.lib'

import { QuickNpcStartingChoiceCategorySummary } from './quick-npc-starting-choice-category-summary'
import { QuickNpcRequirementsFields } from './quick-npc-requirements-fields'
import { QuickNpcStartingChoiceSelectedRow } from './quick-npc-starting-choice-selected-row'
import { QuickNpcStartingEquipmentPanel } from './quick-npc-starting-equipment-panel'
import {
  quickNpcStartingChoiceAddFooterClasses,
  quickNpcStartingChoiceAllowanceHintClasses,
  quickNpcStartingChoiceEmptyClasses,
  quickNpcStartingChoiceExpandedPanelClasses,
  quickNpcStartingChoiceHeadingClasses,
  quickNpcStartingChoiceHeadingRowClasses,
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
  quickNpcStartingChoicesClasses,
  quickNpcStartingChoiceSelectedListClasses,
  quickNpcStartingChoiceStatusRowClasses,
  quickNpcStartingChoiceSuggestionHintClasses,
} from './quick-npc-starting-choices.variants'

const QUICK_NPC_ADD_STARTING_CHOICE_LABEL = 'Add starting choice'
const QUICK_NPC_ADD_STARTING_CHOICE_SPELL_DESCRIPTION =
  'Require a spell this NPC must know or prepare.'

export type QuickNpcStartingChoicesProps = {
  setup: QuickNpcSetupValues
  buildContext: CharacterBuildContext
  createContext: QuickNpcCreateContext
  optionSets: QuickNpcRequirementOptionSets
  additionalEquipmentOptions: readonly QuickNpcAdditionalEquipmentOption[]
}

// fallow-ignore-next-line complexity
export function QuickNpcStartingChoices({
  setup,
  buildContext,
  createContext,
  optionSets,
  additionalEquipmentOptions,
}: QuickNpcStartingChoicesProps) {
  const form = useFormContext<QuickNpcAuthoringTabFormValues>()
  const overrides = form.watch(QUICK_NPC_STARTING_CHOICE_OVERRIDES_FIELD_NAME) ?? {}
  const additionalEquipmentIds = form.watch(QUICK_NPC_ADDITIONAL_EQUIPMENT_FIELD_NAME) ?? []
  const requiredSpellIds = form.watch(QUICK_NPC_REQUIRED_SPELL_FIELD_NAME) ?? []
  const [expandedKind, setExpandedKind] = React.useState<StartingChoiceCategory | null>(null)

  const catalogIndex = React.useMemo(
    () => indexCharacterBuildCatalog(buildContext.catalog),
    [buildContext.catalog],
  )
  const { requiredWeaponIds } = React.useMemo(
    () =>
      splitQuickNpcAdditionalEquipmentIds({
        additionalEquipmentIds,
        catalogIndex,
      }),
    [additionalEquipmentIds, catalogIndex],
  )

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

  const baseCategories = groupStartingChoicesByKind(choices)
  const hasEquipmentPackages =
    resolveQuickNpcStartingEquipmentPackageContext({
      setup,
      context: buildContext,
      choices,
    }) !== null
  const equipmentEntries = choices.contributions.filter((entry) => entry.category === 'equipment')
  const showEquipmentCategory =
    hasEquipmentPackages ||
    equipmentEntries.length > 0 ||
    additionalEquipmentIds.length > 0 ||
    additionalEquipmentOptions.length > 0

  const additionalOptionLabels = React.useMemo(
    () =>
      new Map(additionalEquipmentOptions.map((entry) => [entry.option.value, entry.option.label])),
    [additionalEquipmentOptions],
  )

  const categories = React.useMemo(() => {
    if (
      !showEquipmentCategory ||
      baseCategories.some((category) => category.kind === 'equipment')
    ) {
      return baseCategories
    }
    return [
      ...baseCategories,
      {
        kind: 'equipment' as const,
        label: startingChoiceKindLabel('equipment'),
        entries: equipmentEntries,
        canChange: true,
      },
    ]
  }, [baseCategories, equipmentEntries, showEquipmentCategory])

  const suggestionLabels = React.useMemo(
    () =>
      resolveStartingChoiceSuggestionLabels({
        setup,
        context: buildContext,
        createContext,
      }),
    [buildContext, createContext, setup],
  )

  const excludedEquipmentIds = React.useMemo(
    () =>
      equipmentEntries.flatMap((entry) =>
        entry.mechanic === 'fixed-grant' ? [...entry.selectedIds] : [],
      ),
    [equipmentEntries],
  )

  const addableSpell = optionSets.spells.length > 0

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

  const showContainer = categories.length > 0 || addableSpell

  if (!showContainer) {
    return (
      <p className={quickNpcStartingChoiceEmptyClasses}>No starting choices have been added.</p>
    )
  }

  return (
    <div className={quickNpcStartingChoicesClasses}>
      {categories.map((category) => {
        const expanded = expandedKind === category.kind
        const summaryLabels =
          category.kind === 'equipment'
            ? resolveStartingChoiceEquipmentCategoryLabels({
                context: buildContext,
                choices,
                setup,
                additionalEquipmentIds,
                additionalOptionLabels,
              })
            : resolveStartingChoiceCategoryLabels({
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
            summaryLabels={summaryLabels}
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
                overrides={overrides}
                requiredWeaponIds={requiredWeaponIds}
                requiredSpellIds={requiredSpellIds}
                additionalEquipmentOptions={additionalEquipmentOptions}
                excludedEquipmentIds={excludedEquipmentIds}
                onOverridesChange={writeOverrides}
              />
            }
          />
        )
      })}
      {expandedKind === 'spell' && !categories.some((category) => category.kind === 'spell') ? (
        <StartingChoiceCategoryRow
          eyebrow={startingChoiceKindLabel('spell')}
          summaryLabels={[]}
          allowanceStatus="none"
          expanded
          onToggle={() => finishEdit('spell')}
          panel={<ManualSpellEditor optionSets={optionSets} />}
        />
      ) : null}
      {addableSpell ? (
        <div className={quickNpcStartingChoiceAddFooterClasses}>
          <EntityActionChoiceMenu
            triggerLabel={QUICK_NPC_ADD_STARTING_CHOICE_LABEL}
            menuHeading={QUICK_NPC_ADD_STARTING_CHOICE_LABEL}
            items={[
              {
                id: 'spell',
                label: startingChoiceKindLabel('spell').replace(/s$/, ''),
                description: QUICK_NPC_ADD_STARTING_CHOICE_SPELL_DESCRIPTION,
                onSelect: () => beginEdit('spell'),
              },
            ]}
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
  summaryLabels,
  allowanceStatus,
  expanded,
  onToggle,
  panel,
}: {
  eyebrow: string
  summaryLabels: readonly string[]
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
        <QuickNpcStartingChoiceCategorySummary labels={summaryLabels} />
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

function StartingChoiceEditor({
  categoryKind,
  entries,
  choices,
  suggestionLabels,
  setup,
  buildContext,
  createContext,
  optionSets,
  overrides,
  requiredWeaponIds,
  requiredSpellIds,
  additionalEquipmentOptions,
  excludedEquipmentIds,
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
  overrides: Record<string, string[]>
  requiredWeaponIds: readonly string[]
  requiredSpellIds: readonly string[]
  additionalEquipmentOptions: readonly QuickNpcAdditionalEquipmentOption[]
  excludedEquipmentIds: readonly string[]
  onOverridesChange: (next: Record<string, string[]>) => void
}) {
  if (categoryKind === 'equipment') {
    return (
      <QuickNpcStartingEquipmentPanel
        setup={setup}
        choices={choices}
        buildContext={buildContext}
        equipmentEntries={entries}
        additionalOptions={additionalEquipmentOptions}
        excludedEquipmentIds={excludedEquipmentIds}
      />
    )
  }

  if (categoryKind === 'spell') {
    return <ManualSpellEditor optionSets={optionSets} />
  }

  const allowanceEntries = entries.filter((entry) => entry.mechanic === 'choice-allowance')

  return (
    <>
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
        const isComplete = selectedIds.length >= required
        const hasEligibleOptions = options.length > 0
        const showAddControl = !isComplete
        const addDisabled = !hasEligibleOptions
        const addPlaceholder = startingChoiceAddPlaceholder(categoryKind)
        const addAccessibleName = addPlaceholder.replace(/^\+ /, '')

        function updateSelectedIds(nextIds: string[]) {
          onOverridesChange({ ...overrides, [choiceSetId]: nextIds })
        }
        return (
          <div key={entry.id} className={quickNpcStartingChoiceInnerSectionClasses}>
            {presentation ? (
              <div className={quickNpcStartingChoiceIdentityStackClasses}>
                <div className={quickNpcStartingChoiceHeadingRowClasses}>
                  <p className={quickNpcStartingChoiceHeadingClasses}>{presentation.heading}</p>
                  <ChoiceSelectionCounter
                    selectedCount={selectedIds.length}
                    max={required}
                    size={QUICK_NPC_CREATE_CHOICE_SELECTION_COUNTER_SIZE}
                  />
                </div>
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
              {showAddControl ? (
                <ComboboxField
                  id={`starting-choice-${entry.choiceSetId}`}
                  label={addAccessibleName}
                  labelVisibility="srOnly"
                  options={options}
                  value=""
                  disabled={addDisabled}
                  onChange={(next) => {
                    const value = Array.isArray(next) ? next[0] : next
                    if (!value || selectedIds.includes(value)) return
                    updateSelectedIds([...selectedIds, value])
                  }}
                  placeholder={addPlaceholder}
                  emptyMessage="No matching options"
                />
              ) : null}
            </div>
            {showReset ? (
              <div className={quickNpcStartingChoiceStatusRowClasses}>
                <Button
                  type="button"
                  variant="text"
                  size="sm"
                  density="compact"
                  onClick={() => {
                    const next = { ...overrides }
                    delete next[choiceSetId]
                    onOverridesChange(next)
                  }}
                >
                  {startingChoiceResetLabel({ count: required, namedAttribution })}
                </Button>
              </div>
            ) : null}
            {suggestionHint ? (
              <p className={quickNpcStartingChoiceSuggestionHintClasses}>{suggestionHint}</p>
            ) : null}
          </div>
        )
      })}
    </>
  )
}

function ManualSpellEditor({ optionSets }: { optionSets: QuickNpcRequirementOptionSets }) {
  return (
    <div className={quickNpcStartingChoiceInnerSectionClasses}>
      <QuickNpcRequirementsFields optionSets={{ weapons: [], spells: optionSets.spells }} />
      <p className={quickNpcStartingChoiceProvenanceClasses}>Added manually</p>
    </div>
  )
}
