import type { UseFormReturn } from 'react-hook-form'

import {
  buildNarrativeContext,
  generateCharacterNarrative,
} from '@rpg/character-narrative-integrations'
import {
  getErrorMessage,
  type CharacterBuildContext,
  type CharacterBuilderDraft,
} from '@rpg/contracts'
import type { GeneratedNarrative } from '@rpg/contracts/character-narrative'
import type { Location } from '@rpg/contracts/rpg/content'

import { formatContentListLoadErrorMessage } from '@/features/content/lib/content-type-labels'

import type { IdentityFormValues } from '../../../../lib/steps/identity-form-fields'
import { identityFormValuesToDraft } from '../../../../lib/steps/identity-form-values'

export const NARRATIVE_ALL_FIELDS_FILLED_MESSAGE =
  'All narrative fields already have text. Clear a field to generate again.'
export const NARRATIVE_OMITTED_REFERENCES_MESSAGE =
  'Some connections could not be included in the generated background.'

export function isEmptyNarrativeText(value: string | undefined): boolean {
  if (!value) return true
  return (
    value
      .replace(/<[^>]+>/g, ' ')
      .replace(/&nbsp;/gi, ' ')
      .replace(/\s+/g, ' ')
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

export type NarrativeGenerationFeedback = {
  tone: 'destructive' | 'muted'
  message: string
}

export async function runNarrativeGeneration(input: {
  form: UseFormReturn<IdentityFormValues>
  draft: CharacterBuilderDraft
  context: CharacterBuildContext
  campaignId?: string
  locations: readonly Location[]
  locationsQueryError: unknown
  locationsQueryIsError: boolean
}): Promise<NarrativeGenerationFeedback | undefined> {
  const snapshot = JSON.stringify(input.form.getValues())
  if (input.campaignId && input.locationsQueryIsError) {
    return {
      tone: 'destructive',
      message: getErrorMessage(
        input.locationsQueryError,
        formatContentListLoadErrorMessage('locations'),
      ),
    }
  }

  try {
    const currentDraft = buildDraftFromIdentityValues(input.draft, input.form.getValues())
    const generationContext = buildNarrativeContext({
      draft: currentDraft,
      context: input.context,
      locations: input.locations,
    })
    const result = await generateCharacterNarrative(
      generationContext,
      Math.floor(Math.random() * 2 ** 31),
    )
    if (JSON.stringify(input.form.getValues()) !== snapshot) {
      return {
        tone: 'destructive',
        message: 'Character details changed while generating. Try again.',
      }
    }
    if (!result.ok) {
      return { tone: 'destructive', message: result.reason }
    }
    applyGeneratedNarrativeToForm(input.form, result.narrative)
    if (result.omittedReferenceIds.length > 0) {
      return { tone: 'muted', message: NARRATIVE_OMITTED_REFERENCES_MESSAGE }
    }
    return undefined
  } catch {
    return {
      tone: 'destructive',
      message: 'Narrative generation could not load the available campaign context. Try again.',
    }
  }
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
