import type { CharacterBuilderDraftIdentity, CharacterNarrative } from '@rpg/contracts'

import type { IdentityFormValues } from './identity-form-fields'

type NarrativeFormValues = IdentityFormValues['narrative']
type NarrativeFormItem = NarrativeFormValues['personalityTraits'][number]

const BLANK_NARRATIVE_ITEM: NarrativeFormItem = { value: '' }

/** Default narrative form slice — one blank row per array field. */
export const emptyNarrativeFormValues = (): NarrativeFormValues => ({
  personalityTraits: [{ ...BLANK_NARRATIVE_ITEM }],
  ideals: [{ ...BLANK_NARRATIVE_ITEM }],
  bonds: [{ ...BLANK_NARRATIVE_ITEM }],
  flaws: [{ ...BLANK_NARRATIVE_ITEM }],
})

function stringArrayToFormItems(values: string[] | undefined): NarrativeFormItem[] {
  if (!values?.length) return [{ ...BLANK_NARRATIVE_ITEM }]
  return values.map((value) => ({ value }))
}

function formItemsToStringArray(items: NarrativeFormItem[] | undefined): string[] | undefined {
  const values = (items ?? []).map((item) => item.value.trim()).filter(Boolean)
  return values.length > 0 ? values : undefined
}

function narrativeDraftToFormValues(
  narrative: CharacterNarrative | undefined,
): NarrativeFormValues {
  if (!narrative) return emptyNarrativeFormValues()

  return {
    personalityTraits: stringArrayToFormItems(narrative.personalityTraits),
    ideals: stringArrayToFormItems(narrative.ideals),
    bonds: stringArrayToFormItems(narrative.bonds),
    flaws: stringArrayToFormItems(narrative.flaws),
    backstory: narrative.backstory,
  }
}

function narrativeFormValuesToDraft(
  narrative: NarrativeFormValues,
): CharacterNarrative | undefined {
  const result: CharacterNarrative = {}

  const personalityTraits = formItemsToStringArray(narrative.personalityTraits)
  const ideals = formItemsToStringArray(narrative.ideals)
  const bonds = formItemsToStringArray(narrative.bonds)
  const flaws = formItemsToStringArray(narrative.flaws)
  const backstory = narrative.backstory?.trim()

  if (personalityTraits) result.personalityTraits = personalityTraits
  if (ideals) result.ideals = ideals
  if (bonds) result.bonds = bonds
  if (flaws) result.flaws = flaws
  if (backstory) result.backstory = backstory

  return Object.keys(result).length > 0 ? result : undefined
}

export function identityDraftToFormValues(
  identity: CharacterBuilderDraftIdentity,
): IdentityFormValues {
  return {
    name: identity.name ?? '',
    narrative: narrativeDraftToFormValues(identity.narrative),
    alignment: identity.alignment,
  }
}

export function identityFormValuesToDraft(
  values: IdentityFormValues,
): CharacterBuilderDraftIdentity {
  return {
    name: values.name.trim(),
    narrative: narrativeFormValuesToDraft(values.narrative),
    alignment: values.alignment || undefined,
  }
}

function narrativeFingerprint(narrative: CharacterNarrative | undefined): string {
  if (!narrative) return ''

  return JSON.stringify({
    personalityTraits: narrative.personalityTraits ?? [],
    ideals: narrative.ideals ?? [],
    bonds: narrative.bonds ?? [],
    flaws: narrative.flaws ?? [],
    backstory: narrative.backstory ?? '',
  })
}

function identityDraftFingerprint(identity: CharacterBuilderDraftIdentity): string {
  const name = identity.name ?? ''
  const imageKey = identity.imageKey ?? ''
  const alignment = identity.alignment ?? ''
  return `${name}\0${narrativeFingerprint(identity.narrative)}\0${imageKey}\0${alignment}`
}

/** Compares normalized identity slices — avoids redundant draft writes during live sync. */
export function areIdentityDraftsEqual(
  left: CharacterBuilderDraftIdentity,
  right: CharacterBuilderDraftIdentity,
): boolean {
  return identityDraftFingerprint(left) === identityDraftFingerprint(right)
}
