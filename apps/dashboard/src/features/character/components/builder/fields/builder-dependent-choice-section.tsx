/**
 * Neutral dependent-choice section shell for character-builder parent→child flows.
 *
 * Subclass step reuse: pass `dependentKindLabel: 'subclass'`, heading from `choiceSet.label`
 * (e.g. "Martial Archetype"), and change affordance via the parent step sheet
 * (`CHANGE_SUBCLASS_LABEL`). Parent cards may add level-gated `titleMeta`
 * (e.g. "Subclass at L3") outside this section.
 */

import type { Ref } from 'react'

import type { RadioCardOption } from '@rpg/ui'
import {
  Button,
  RadioCard,
  SelectionOptionCardEmbeddedPanel,
  SelectionOptionCardEmbeddedPanelHeader,
  SelectionOptionCardEmbeddedPanelRowStatus,
  Text,
} from '@rpg/ui'

import type { DependentChoiceSectionCopy } from '../../../lib/builder/builder-dependent-choice.lib'
import {
  resolveDependentChoiceVisibleOptions,
  useDependentChoiceExpandedState,
  useDependentChoiceValueChangeHandler,
} from '../../../lib/builder/builder-dependent-choice-section.lib'
import { CHANGE_HERITAGE_LABEL } from '../../../lib/builder/builder-parent-choice-status.lib'
import { BuilderDependentChoiceSectionHeader } from './builder-dependent-choice-section-header'
import {
  builderDependentChoiceSectionClasses,
  builderDependentChoiceSectionCopyClasses,
  builderDependentChoiceSectionRadioGroupClasses,
} from './builder-dependent-choice-section.variants'

export type BuilderDependentChoiceSectionProps = {
  /** Rules-facing label, e.g. "Elven Lineage", "Martial Archetype". */
  title: string
  sectionCopy: DependentChoiceSectionCopy
  /** Domain kind for stories/tests; copy comes from `sectionCopy`. */
  dependentKindLabel: string
  options: RadioCardOption[]
  value: string
  onValueChange: (optionId: string) => void
  sectionRef?: Ref<HTMLElement>
  idPrefix: string
  /** Tighter rhythm when nested inside a parent RadioCard shell. */
  embedded?: boolean
  /** Controlled expanded state for revisiting resolved choices. */
  expanded?: boolean
  onExpandedChange?: (expanded: boolean) => void
  /** Label for the expand affordance when a choice is resolved. Defaults to heritage copy. */
  changeLabel?: string
}

export function BuilderDependentChoiceSection({
  title,
  sectionCopy,
  dependentKindLabel: _dependentKindLabel,
  options,
  value,
  onValueChange,
  sectionRef,
  idPrefix,
  embedded = false,
  expanded: expandedProp,
  onExpandedChange,
  changeLabel = CHANGE_HERITAGE_LABEL,
}: BuilderDependentChoiceSectionProps) {
  const { expanded, setExpanded } = useDependentChoiceExpandedState(expandedProp, onExpandedChange)
  const isResolved = value.length > 0
  const visibleOptions = resolveDependentChoiceVisibleOptions(options, value, expanded)
  const handleValueChange = useDependentChoiceValueChangeHandler({
    expanded,
    isResolved,
    onValueChange,
    setExpanded,
  })

  const headingId = `${idPrefix}-heading`
  const changeButtonId = `${idPrefix}-change`

  const radioGroup = (
    <RadioCard
      variant="row"
      density="compact"
      className={builderDependentChoiceSectionRadioGroupClasses}
      value={value}
      onValueChange={handleValueChange}
      options={visibleOptions}
      idPrefix={idPrefix}
    />
  )

  const changeButton =
    isResolved && !expanded ? (
      <Button
        type="button"
        variant="text"
        size="sm"
        id={changeButtonId}
        onClick={() => setExpanded(true)}
      >
        {changeLabel}
      </Button>
    ) : null

  return (
    <section
      ref={sectionRef}
      role="region"
      aria-labelledby={headingId}
      className={embedded ? undefined : builderDependentChoiceSectionClasses}
    >
      {embedded ? (
        <SelectionOptionCardEmbeddedPanel>
          <SelectionOptionCardEmbeddedPanelHeader
            title={title}
            titleAs="h3"
            titleId={headingId}
            endSlot={
              sectionCopy.statusText ? (
                <SelectionOptionCardEmbeddedPanelRowStatus className="shrink-0 text-right leading-snug">
                  {sectionCopy.statusText}
                </SelectionOptionCardEmbeddedPanelRowStatus>
              ) : undefined
            }
            description={sectionCopy.helperText ?? undefined}
          />
          {radioGroup}
          {changeButton}
        </SelectionOptionCardEmbeddedPanel>
      ) : (
        <>
          <div className={builderDependentChoiceSectionCopyClasses}>
            <BuilderDependentChoiceSectionHeader
              title={title}
              headingId={headingId}
              sectionCopy={sectionCopy}
              embedded={false}
            />
            {sectionCopy.helperText ? <Text variant="muted">{sectionCopy.helperText}</Text> : null}
          </div>
          {radioGroup}
          {changeButton}
        </>
      )}
    </section>
  )
}
