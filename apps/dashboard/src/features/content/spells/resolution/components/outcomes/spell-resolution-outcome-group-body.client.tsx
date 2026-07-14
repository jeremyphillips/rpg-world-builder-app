'use client'

import { getSpellResolutionOutcomeAuthoringLabel } from '@rpg/contracts'
import { ButtonDropdown, Heading, TextareaField } from '@rpg/ui'
import type { ButtonDropdownItem } from '@rpg/ui'
import type { ComponentProps } from 'react'

import {
  RESOLUTION_FIELD_LABELS,
  RESOLUTION_SECTION_LABELS,
} from '../../lib/form/resolution-form-labels'
import type {
  ResolutionEffectFormItem,
  ResolutionOutcomeApplicationFormItem,
} from '../../lib/form/resolution-form-schema'
import { SpellResolutionOutcomeApplicationRow } from './spell-resolution-outcome-application-row.client'

export type SpellResolutionOutcomeGroupBodyProps = {
  headingId: string
  noteId: string
  result: Parameters<typeof getSpellResolutionOutcomeAuthoringLabel>[0]
  outcomeIndex: number
  applications: readonly ResolutionOutcomeApplicationFormItem[]
  effects: readonly ResolutionEffectFormItem[]
  menuItems: ButtonDropdownItem[]
  noteValue: string
  noteError?: string
  onNoteChange: ComponentProps<typeof TextareaField>['onChange']
  onNoteBlur: () => void
  onAppendApplication: (effectId: string) => void
  onRemoveApplication: (applicationIndex: number) => void
}

/** Expanded outcome editor with applications, add menu, and note. */
export function SpellResolutionOutcomeGroupBody({
  headingId,
  noteId,
  result,
  outcomeIndex,
  applications,
  effects,
  menuItems,
  noteValue,
  noteError,
  onNoteChange,
  onNoteBlur,
  onAppendApplication,
  onRemoveApplication,
}: SpellResolutionOutcomeGroupBodyProps) {
  return (
    <section aria-labelledby={headingId} className="space-y-3 rounded-md border border-border p-3">
      <Heading variant="group" as="h3" id={headingId}>
        {getSpellResolutionOutcomeAuthoringLabel(result)}
      </Heading>

      {applications.length > 0 ? (
        <ul className="space-y-2" aria-label="Applied effects">
          {applications.map((application, applicationIndex) => (
            <li key={`${application.effectId}-${applicationIndex}`}>
              <SpellResolutionOutcomeApplicationRow
                outcomeIndex={outcomeIndex}
                applicationIndex={applicationIndex}
                application={application}
                effects={effects}
                onRemove={() => onRemoveApplication(applicationIndex)}
              />
            </li>
          ))}
        </ul>
      ) : null}

      {menuItems.length > 0 ? (
        <ButtonDropdown
          label={RESOLUTION_SECTION_LABELS.addOutcomeApplication}
          items={menuItems}
          groups={[{ id: 'effects', label: 'Effects' }]}
          onSelectItem={onAppendApplication}
        />
      ) : null}

      <TextareaField
        id={noteId}
        label={RESOLUTION_FIELD_LABELS.hitNote}
        value={noteValue}
        onChange={onNoteChange}
        onBlur={onNoteBlur}
        error={noteError}
        rows={3}
        width="full"
        size="sm"
      />
    </section>
  )
}
