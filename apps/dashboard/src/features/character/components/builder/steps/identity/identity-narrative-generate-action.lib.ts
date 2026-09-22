import type { UseFormReturn } from 'react-hook-form'

import type { CharacterBuildContext, CharacterBuilderDraft } from '@rpg/contracts'
import type { GeneratedNarrative } from '@rpg/contracts/character-narrative'

import { listLocations } from '@/features/content'
import type { IdentityFormValues } from '../../../../lib/steps/identity-form-fields'
import { identityFormValuesToDraft } from '../../../../lib/steps/identity-form-values'

export function isEmptyNarrativeText(value: string | undefined): boolean {
  return (
    !value ||
    value
      .replace(/<[^>]+>/g, '')
      .replace(/&nbsp;/gi, ' ')
      .trim() === ''
  )
}

export function escapeNarrativeHtml(value: string): string {
  return value.replace(
    /[&<>"']/g,
    (character) =>
      ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;',
      })[character] ?? character,
  )
}

type NarrativeSnapshot = {
  personalityTraits?: { value?: string }[]
  ideals?: { value?: string }[]
  bonds?: { value?: string }[]
  flaws?: { value?: string }[]
  backstory?: string
}

export function canGenerateNarrative(narrative: NarrativeSnapshot | undefined): boolean {
  return [
    narrative?.personalityTraits?.some(({ value }) => value?.trim()),
    narrative?.ideals?.some(({ value }) => value?.trim()),
    narrative?.bonds?.some(({ value }) => value?.trim()),
    narrative?.flaws?.some(({ value }) => value?.trim()),
    !isEmptyNarrativeText(narrative?.backstory),
  ].some((filled) => !filled)
}

function mapNarrativeItems(items: { value?: string }[] | undefined) {
  return (items ?? [{ value: '' }]).map(({ value }) => ({ value: value ?? '' }))
}

export function buildDraftFromIdentityValues(
  draft: CharacterBuilderDraft,
  values: IdentityFormValues,
): CharacterBuilderDraft {
  return {
    ...draft,
    identity: identityFormValuesToDraft({
      name: values.name ?? '',
      gender: values.gender,
      alignment: values.alignment,
      narrative: {
        personalityTraits: mapNarrativeItems(values.narrative?.personalityTraits),
        ideals: mapNarrativeItems(values.narrative?.ideals),
        bonds: mapNarrativeItems(values.narrative?.bonds),
        flaws: mapNarrativeItems(values.narrative?.flaws),
        backstory: values.narrative?.backstory,
      },
    }),
  }
}

export async function listCampaignLocations(context: CharacterBuildContext) {
  const campaignId =
    context.rulesScope.type === 'campaign' ? context.rulesScope.campaignId : undefined
  return campaignId ? (await listLocations(campaignId)).items : []
}

type NarrativeArrayField = 'personalityTraits' | 'ideals' | 'bonds' | 'flaws'

function applyNarrativeArrayField(
  form: UseFormReturn<IdentityFormValues>,
  field: NarrativeArrayField,
  currentItems: { value: string }[],
  generatedItems: string[],
) {
  if (currentItems.some(({ value }) => value.trim())) return
  form.setValue(
    `narrative.${field}`,
    generatedItems.map((value) => ({ value })),
    { shouldDirty: true, shouldValidate: true },
  )
}

export function applyGeneratedNarrativeToForm(
  form: UseFormReturn<IdentityFormValues>,
  narrative: GeneratedNarrative,
) {
  const current = form.getValues().narrative
  applyNarrativeArrayField(
    form,
    'personalityTraits',
    current.personalityTraits,
    narrative.personalityTraits,
  )
  applyNarrativeArrayField(form, 'ideals', current.ideals, narrative.ideals)
  applyNarrativeArrayField(form, 'bonds', current.bonds, narrative.bonds)
  applyNarrativeArrayField(form, 'flaws', current.flaws, narrative.flaws)
  if (isEmptyNarrativeText(current.backstory)) {
    form.setValue(
      'narrative.backstory',
      narrative.backstoryParagraphs
        .map((paragraph) => `<p>${escapeNarrativeHtml(paragraph)}</p>`)
        .join(''),
      { shouldDirty: true, shouldValidate: true },
    )
  }
}
