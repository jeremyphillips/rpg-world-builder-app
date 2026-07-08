'use client'

/**
 * Neutral dependent-choice section shell for character-builder parent→child flows.
 *
 * Subclass step reuse: pass `dependentKindLabel: 'subclass'`, heading from `choiceSet.label`
 * (e.g. "Martial Archetype"), and manage affordance via the parent step sheet
 * (`manageLabel: 'Manage subclass'`). Parent cards may add level-gated `titleMeta`
 * (e.g. "Subclass at L3") outside this section.
 */

import type { Ref } from 'react'

import type { RadioCardOption } from '@rpg/ui'
import { Heading, RadioCard, Text } from '@rpg/ui'

import type { DependentChoiceSectionCopy } from '../lib/builder-dependent-choice.lib'
import {
  builderDependentChoiceSectionClasses,
  builderDependentChoiceSectionCopyClasses,
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
}: BuilderDependentChoiceSectionProps) {
  const headingId = `${idPrefix}-heading`

  return (
    <section
      ref={sectionRef}
      role="region"
      aria-labelledby={headingId}
      className={builderDependentChoiceSectionClasses}
    >
      <div className={builderDependentChoiceSectionCopyClasses}>
        <Heading variant="subsection" as="h3" id={headingId}>
          {title}
        </Heading>
        <Text variant="muted">{sectionCopy.statusText}</Text>
        {sectionCopy.helperText ? <Text variant="muted">{sectionCopy.helperText}</Text> : null}
      </div>

      <RadioCard
        density="compact"
        value={value}
        onValueChange={onValueChange}
        options={options}
        idPrefix={idPrefix}
      />
    </section>
  )
}
