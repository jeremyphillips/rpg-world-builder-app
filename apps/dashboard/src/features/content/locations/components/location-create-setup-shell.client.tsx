'use client'

import type { RadioCardOption } from '@rpg/ui'

import {
  CreateSetupPanel,
  CreateSetupShell,
  isCreateSetupChoiceComplete,
  type CreateSetupSet,
} from '@/lib/create-setup'

import { LOCATION_CREATE_SETUP_CHANGE_LABEL } from '../lib/location-create-setup-chrome.lib'
import { locationCreateSetupModalBodyClasses } from './location-create-setup.variants'

export type LocationCreateSetupChoiceSet = {
  id: string
  fieldLabel: string
  prompt: string
  options: RadioCardOption[]
  value: string
  onValueChange: (value: string) => void
  required?: boolean
  /** Upstream choice-set ids — sequencer clears this set when any change. */
  dependsOn?: readonly string[]
}

function toCreateSetupSets(choiceSets: readonly LocationCreateSetupChoiceSet[]): CreateSetupSet[] {
  return choiceSets.map((choiceSet) => ({
    kind: 'choice',
    id: choiceSet.id,
    fieldLabel: choiceSet.fieldLabel,
    prompt: choiceSet.prompt,
    options: choiceSet.options,
    value: choiceSet.value,
    required: choiceSet.required,
    dependsOn: choiceSet.dependsOn,
    isComplete: isCreateSetupChoiceComplete(choiceSet.value),
    onValueChange: choiceSet.onValueChange,
    onReset: () => choiceSet.onValueChange(''),
  }))
}

export type LocationCreateSetupPanelProps = {
  choiceSets: LocationCreateSetupChoiceSet[]
  /** Controlled reopen override; omit for uncontrolled (shell owns local state). */
  reopenChoiceSetId?: string | null
  onReopenChoiceSetIdChange?: (choiceSetId: string | null) => void
  className?: string
}

/** Choice-set stack only — embed in page setup Modal or LocationCreateModal. */
export function LocationCreateSetupPanel({
  choiceSets,
  reopenChoiceSetId,
  onReopenChoiceSetIdChange,
  className = locationCreateSetupModalBodyClasses,
}: LocationCreateSetupPanelProps) {
  return (
    <CreateSetupPanel
      sets={toCreateSetupSets(choiceSets)}
      changeLabel={LOCATION_CREATE_SETUP_CHANGE_LABEL}
      reopenSetId={reopenChoiceSetId}
      onReopenSetIdChange={onReopenChoiceSetIdChange}
      className={className}
    />
  )
}

export type LocationCreateSetupShellProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  headline: string
  /**
   * Modal header subhead. Defaults to `false` (hidden). Pass a string for custom
   * copy, or `resolveLocationCreateSetupDefaultSubhead(noun)` for the generic fallback.
   */
  subhead?: string | false
  choiceSets: LocationCreateSetupChoiceSet[]
  onContinue: () => void
  /** Escape hatch for extra validation beyond required choice-set completion. */
  additionalContinueConstraint?: boolean
}

/** Shared create-setup modal: compact selected summaries + ID-sequenced expansion. */
export function LocationCreateSetupShell({
  open,
  onOpenChange,
  headline,
  subhead = false,
  choiceSets,
  onContinue,
  additionalContinueConstraint = true,
}: LocationCreateSetupShellProps) {
  return (
    <CreateSetupShell
      open={open}
      onOpenChange={onOpenChange}
      headline={headline}
      subhead={subhead}
      sets={toCreateSetupSets(choiceSets)}
      changeLabel={LOCATION_CREATE_SETUP_CHANGE_LABEL}
      onContinue={onContinue}
      additionalContinueConstraint={additionalContinueConstraint}
    />
  )
}
