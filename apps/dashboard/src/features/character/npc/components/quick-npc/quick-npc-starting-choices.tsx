import * as React from 'react'
import { ChevronDown } from 'lucide-react'
import { useFormContext } from 'react-hook-form'

import { EntityActionChoiceMenu } from '@/features/content'

import { Button, ChoiceSelectionCounter, ComboboxField, Eyebrow, StatusDot, cn } from '@rpg/ui'

import type {
  CharacterBuildContext,
  StartingChoiceCategory,
  StartingChoiceContribution,
} from '@rpg/contracts'
import { indexCharacterBuildCatalog } from '@rpg/contracts'

import type { QuickNpcCreateContext } from '../../lib/quick-npc/quick-npc-create-context'
import type { QuickNpcAdditionalEquipmentOption } from '../../lib/quick-npc/quick-npc-additional-equipment.lib'
import {
  QUICK_NPC_CLASS_PACKAGE_FIELD_NAME,
  QUICK_NPC_EQUIPMENT_SELECTION_FIELD_NAME,
  type QuickNpcEquipmentSelection,
  QUICK_NPC_REQUIRED_SPELL_FIELD_NAME,
  QUICK_NPC_STARTING_CHOICE_OVERRIDES_FIELD_NAME,
  type QuickNpcAuthoringTabFormValues,
  type QuickNpcSetupValues,
} from '../../lib/quick-npc/quick-npc-form-fields'
import type { QuickNpcRequirementOptionSets } from '../../lib/quick-npc/quick-npc-requirement-options.lib'
import {
  buildStartingChoiceOptionLabelIndex,
  normalizeStartingChoiceOverride,
  resolveCanonicalStartingChoiceAllowances,
  resolveQuickNpcStartingChoices,
  resolveStartingChoiceSuggestionLabels,
  startingChoiceAddAccessibleName,
  startingChoiceAddPlaceholder,
  startingChoiceAlsoGrantedHint,
  startingChoiceAllowancePresentation,
  resolveStartingChoiceCategoryAllowanceStatus,
  resolveStartingChoiceCategoryLabels,
  formatFixedGrantProvenance,
  startingChoiceDisplayLabels,
  startingChoiceHasNamedAttribution,
  startingChoiceKindLabel,
  startingChoicePickerOptions,
  startingChoiceResetLabel,
  startingChoiceShowSuggestedReset,
  startingChoiceItemSuggestionCopy,
  groupStartingChoicesByKind,
} from '../../lib/quick-npc/quick-npc-starting-choices.lib'
import {
  isGrantedEquipmentContribution,
  resolveQuickNpcEquipmentCategoryStatus,
  resolveQuickNpcStartingEquipmentPackageContext,
  resolveStartingChoiceEquipmentCategoryLabels,
} from '../../lib/quick-npc/quick-npc-starting-equipment.lib'

import {
  QUICK_NPC_CATEGORY_NO_PACKAGE_SUMMARY,
  readQuickNpcClassPackage,
} from '../../lib/quick-npc/quick-npc-package-customization.lib'
import { useQuickNpcEditingLock } from './quick-npc-editing-lock'
import { QuickNpcStartingChoiceCategorySummary } from './quick-npc-starting-choice-category-summary'
import { QuickNpcRequirementsFields } from './quick-npc-requirements-fields'
import { QuickNpcStartingChoiceSelectedRow } from './quick-npc-starting-choice-selected-row'
import { QuickNpcStartingChoiceSubsectionHeader } from './quick-npc-starting-choice-subsection-header'
import { ChoiceGrantedRow } from '../../../components/builder/steps/shared/choice-section/choice-granted-row'
import { QuickNpcStartingEquipmentPanel } from './quick-npc-starting-equipment-panel'
import {
  quickNpcStartingChoiceAddControlClasses,
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
  quickNpcStartingChoiceRowEyebrowSlotClasses,
  quickNpcStartingChoiceRowHeaderClasses,
  quickNpcStartingChoiceRowStatusSlotClasses,
  quickNpcStartingChoiceRowClasses,
  quickNpcStartingChoicesClasses,
  quickNpcStartingChoiceSelectedListClasses,
  quickNpcStartingChoiceStatusRowClasses,
  QUICK_NPC_CREATE_CHOICE_SELECTION_COUNTER_SIZE,
} from './quick-npc-starting-choices.variants'

const QUICK_NPC_ADD_STARTING_CHOICE_LABEL = 'Add starting choice'
const QUICK_NPC_ADD_STARTING_CHOICE_SPELL_MENU_LABEL = 'Spell'
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
  const classPackage = form.watch(QUICK_NPC_CLASS_PACKAGE_FIELD_NAME)
  const editingLock = useQuickNpcEditingLock()
  const equipmentSelections = (form.watch(QUICK_NPC_EQUIPMENT_SELECTION_FIELD_NAME) ??
    []) as QuickNpcEquipmentSelection[]
  const requiredSpellIds = form.watch(QUICK_NPC_REQUIRED_SPELL_FIELD_NAME) ?? []
  const [expandedKind, setExpandedKind] = React.useState<StartingChoiceCategory | null>(null)
  const [editSessionOverrides, setEditSessionOverrides] = React.useState<Record<
    string,
    string[]
  > | null>(null)

  const mergedOverrides = React.useMemo(
    () => ({ ...overrides, ...(editSessionOverrides ?? {}) }),
    [editSessionOverrides, overrides],
  )

  const choices = React.useMemo(
    () =>
      resolveQuickNpcStartingChoices({
        setup,
        context: buildContext,
        createContext,
        startingChoiceOverrides: mergedOverrides,
        classPackage: readQuickNpcClassPackage(classPackage),
        requiredSpellIds,
      }),
    [buildContext, classPackage, createContext, mergedOverrides, requiredSpellIds, setup],
  )

  const catalogIndex = React.useMemo(
    () => indexCharacterBuildCatalog(buildContext.catalog),
    [buildContext.catalog],
  )

  const canonicalAllowances = React.useMemo(
    () =>
      resolveCanonicalStartingChoiceAllowances({
        setup,
        context: buildContext,
        createContext,
        startingChoiceOverrides: mergedOverrides,
        requiredSpellIds,
      }),
    [buildContext, createContext, mergedOverrides, requiredSpellIds, setup],
  )

  const equipmentPackageContext = React.useMemo(
    () =>
      resolveQuickNpcStartingEquipmentPackageContext({
        setup,
        context: buildContext,
        choices,
      }),
    [buildContext, choices, setup],
  )

  const baseCategories = groupStartingChoicesByKind(choices)
  const hasEquipmentPackages = equipmentPackageContext !== null
  const equipmentEntries = choices.contributions.filter((entry) => entry.category === 'equipment')
  const showEquipmentCategory =
    hasEquipmentPackages ||
    equipmentEntries.length > 0 ||
    equipmentSelections.length > 0 ||
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

  const addableSpell = optionSets.spells.length > 0

  function writeOverrides(next: Record<string, string[]>) {
    form.setValue(QUICK_NPC_STARTING_CHOICE_OVERRIDES_FIELD_NAME, next, { shouldDirty: true })
  }

  function finishEdit(kind: StartingChoiceCategory) {
    if (kind === 'skill' || kind === 'tool' || kind === 'language') {
      const session = editSessionOverrides ?? overrides
      const next = { ...overrides }
      for (const entry of choices.contributions) {
        if (entry.category !== kind || entry.mechanic !== 'choice-allowance') continue
        const current = session[entry.choiceSetId] ?? [...entry.selectedIds]
        const canonical = canonicalAllowances.get(entry.choiceSetId) ?? { selectedIds: [] }
        const normalized = normalizeStartingChoiceOverride({
          currentIds: current,
          canonicalIds: canonical.selectedIds,
          allowance: entry.allowance,
        })
        if (normalized) next[entry.choiceSetId] = normalized
        else delete next[entry.choiceSetId]
      }
      writeOverrides(next)
    }
    setEditSessionOverrides(null)
    setExpandedKind(null)
  }

  function beginEdit(kind: StartingChoiceCategory) {
    if (expandedKind && expandedKind !== kind) {
      finishEdit(expandedKind)
    }
    if (kind === 'skill' || kind === 'tool' || kind === 'language') {
      const next = { ...overrides }
      for (const entry of choices.contributions) {
        if (entry.category !== kind || entry.mechanic !== 'choice-allowance') continue
        next[entry.choiceSetId] = [...(mergedOverrides[entry.choiceSetId] ?? entry.selectedIds)]
      }
      setEditSessionOverrides(next)
    } else {
      setEditSessionOverrides(null)
    }
    setExpandedKind(kind)
  }

  function toggleCategory(kind: StartingChoiceCategory) {
    if (editingLock.isLocked) {
      editingLock.requestFocus()
      return
    }
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

  // fallow-ignore-next-line complexity
  const categoryRows = categories.map((category) => {
    const expanded = expandedKind === category.kind
    const equipmentLabels =
      category.kind === 'equipment'
        ? resolveStartingChoiceEquipmentCategoryLabels({
            context: buildContext,
            choices,
            setup,
            equipmentSelections,
            additionalOptionLabels,
            catalogIndex,
          })
        : []
    const summaryLabels =
      category.kind === 'equipment'
        ? equipmentLabels.length === 0 && classPackage?.state === 'declined'
          ? [QUICK_NPC_CATEGORY_NO_PACKAGE_SUMMARY]
          : equipmentLabels
        : resolveStartingChoiceCategoryLabels({
            context: buildContext,
            choices,
            entries: category.entries,
          })
    const packageContext = category.kind === 'equipment' ? equipmentPackageContext : null
    const allowanceStatus =
      category.kind === 'equipment'
        ? resolveQuickNpcEquipmentCategoryStatus({
            choiceSets: packageContext?.resolvedChoiceSets ?? [],
            draftSelections: choices.draft.choiceSelections,
            overrides: mergedOverrides,
          })
        : resolveStartingChoiceCategoryAllowanceStatus({
            entries: category.entries,
            overrides: mergedOverrides,
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
            optionSets={optionSets}
            overrides={expanded ? (editSessionOverrides ?? overrides) : overrides}
            additionalEquipmentOptions={additionalEquipmentOptions}
            equipmentPackageContext={equipmentPackageContext}
            catalogIndex={catalogIndex}
            canonicalAllowances={canonicalAllowances}
            onOverridesChange={(next) => setEditSessionOverrides(next)}
          />
        }
      />
    )
  })

  return (
    <div className={quickNpcStartingChoicesClasses}>
      {categoryRows}
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
                label: QUICK_NPC_ADD_STARTING_CHOICE_SPELL_MENU_LABEL,
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
        <Eyebrow size="sm" className={quickNpcStartingChoiceRowEyebrowSlotClasses}>
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

type QuickNpcEquipmentPackageContext = NonNullable<
  ReturnType<typeof resolveQuickNpcStartingEquipmentPackageContext>
>

function StartingChoiceEditor({
  categoryKind,
  entries,
  choices,
  suggestionLabels,
  setup,
  buildContext,
  optionSets,
  overrides,
  additionalEquipmentOptions,
  equipmentPackageContext,
  catalogIndex,
  canonicalAllowances,
  onOverridesChange,
}: {
  categoryKind: StartingChoiceCategory
  entries: readonly StartingChoiceContribution[]
  choices: ReturnType<typeof resolveQuickNpcStartingChoices>
  suggestionLabels: ReturnType<typeof resolveStartingChoiceSuggestionLabels>
  setup: QuickNpcSetupValues
  buildContext: CharacterBuildContext
  optionSets: QuickNpcRequirementOptionSets
  overrides: Record<string, string[]>
  additionalEquipmentOptions: readonly QuickNpcAdditionalEquipmentOption[]
  equipmentPackageContext: QuickNpcEquipmentPackageContext | null
  catalogIndex: ReturnType<typeof indexCharacterBuildCatalog>
  canonicalAllowances: ReturnType<typeof resolveCanonicalStartingChoiceAllowances>
  onOverridesChange: (next: Record<string, string[]>) => void
}) {
  if (categoryKind === 'equipment') {
    return (
      <>
        <QuickNpcStartingEquipmentPanel
          setup={setup}
          choices={choices}
          buildContext={buildContext}
          additionalOptions={additionalEquipmentOptions}
          packageContext={equipmentPackageContext}
        />
        <GrantedCategorySubsection
          categoryLabel={startingChoiceKindLabel(categoryKind)}
          entries={entries.filter(isGrantedEquipmentContribution)}
          choices={choices}
          buildContext={buildContext}
        />
      </>
    )
  }

  if (categoryKind === 'spell') {
    return <ManualSpellEditor optionSets={optionSets} />
  }

  const allowanceEntries = entries.filter((entry) => entry.mechanic === 'choice-allowance')
  const optionLabels = buildStartingChoiceOptionLabelIndex(choices)

  return (
    <>
      {allowanceEntries.map((entry) => {
        const selectedIds = overrides[entry.choiceSetId] ?? [...entry.selectedIds]
        const labels = startingChoiceDisplayLabels({
          context: buildContext,
          choices,
          contribution: { ...entry, selectedIds },
          catalogIndex,
          optionLabels,
        })
        const options = startingChoicePickerOptions({
          context: buildContext,
          choices,
          choiceSetId: entry.choiceSetId,
          selectedIds,
        })
        const required = entry.allowance.min
        const max = entry.allowance.max
        const choiceSetId = entry.choiceSetId
        const canonical = canonicalAllowances.get(choiceSetId) ?? { selectedIds: [] }
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
        const isComplete = selectedIds.length >= required
        const hasEligibleOptions = options.length > 0
        const showAddControl = !isComplete
        const addDisabled = !hasEligibleOptions
        const addPlaceholder = startingChoiceAddPlaceholder(categoryKind)
        const addAccessibleName = startingChoiceAddAccessibleName(categoryKind)

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
                    max={max}
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
                    const suggestion = selectedId
                      ? startingChoiceItemSuggestionCopy({
                          selectedId,
                          suggestedBy: canonical.suggestedBy,
                          labels: suggestionLabels,
                        })
                      : undefined
                    return (
                      <li key={selectedId}>
                        <QuickNpcStartingChoiceSelectedRow
                          label={label}
                          suggestionHint={suggestion?.hint}
                          suggestionTitle={suggestion?.title}
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
                <div
                  className={
                    labels.length > 0 ? quickNpcStartingChoiceAddControlClasses : undefined
                  }
                >
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
                </div>
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
          </div>
        )
      })}
      <GrantedCategorySubsection
        categoryLabel={startingChoiceKindLabel(categoryKind)}
        entries={entries}
        choices={choices}
        buildContext={buildContext}
      />
    </>
  )
}

function GrantedCategorySubsection({
  categoryLabel,
  entries,
  choices,
  buildContext,
}: {
  categoryLabel: string
  entries: readonly StartingChoiceContribution[]
  choices: ReturnType<typeof resolveQuickNpcStartingChoices>
  buildContext: CharacterBuildContext
}) {
  const grantedEntries = entries.filter(
    (entry): entry is Extract<StartingChoiceContribution, { mechanic: 'fixed-grant' }> =>
      entry.mechanic === 'fixed-grant',
  )
  if (grantedEntries.length === 0) return null

  return (
    <div className={quickNpcStartingChoiceInnerSectionClasses}>
      <QuickNpcStartingChoiceSubsectionHeader
        title={`Granted ${categoryLabel}`}
        itemCountLabel={undefined}
        description="Items this NPC receives and cannot remove."
      />
      <ul className={quickNpcStartingChoiceSelectedListClasses}>
        {grantedEntries.flatMap((entry) => {
          const labels = startingChoiceDisplayLabels({
            context: buildContext,
            choices,
            contribution: entry,
          })
          const sourceLabel = formatFixedGrantProvenance(entry, buildContext)
          return labels.map((label) => (
            <li key={`${entry.id}-${label}`}>
              <ChoiceGrantedRow
                row={{
                  id: `${entry.id}:${label}`,
                  label,
                  sourceLabel,
                }}
              />
            </li>
          ))
        })}
      </ul>
    </div>
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
