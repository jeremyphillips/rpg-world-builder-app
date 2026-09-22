import {
  NARRATIVE_SLOTS,
  NARRATIVE_STORY_SLOTS,
  NARRATIVE_THEMES,
  NARRATIVE_TOKEN_PATTERN,
  narrativeCollectionSchema,
  narrativeGenerationContextSchema,
  narrativeGenerationResultSchema,
  type NarrativeCollection,
  type NarrativeFragment,
  type NarrativeGenerationContext,
  type NarrativeGenerationResult,
  type NarrativeSlot,
  type NarrativeTheme,
  type NarrativeToken,
} from '@rpg/contracts/character-narrative'
import { bindNarrativeReferences, collectSelectedBindings } from './bind-references'
import {
  createNarrativeRandom,
  fragmentWeight,
  isFragmentEligible,
  pickWeighted,
} from './selection'

const MAX_COMPOSITION_ATTEMPTS = 12
const FAILURE_REASON = 'No complete compatible narrative is available.'
const INVALID_REASON = 'The narrative collection or generation context is invalid.'
const slotCount = (slot: NarrativeSlot) => (slot === 'personalityTraits' ? 2 : 1)

function selectComposition(
  fragments: NarrativeFragment[],
  context: NarrativeGenerationContext,
  theme: NarrativeTheme,
  random: () => number,
  fallback: boolean,
): NarrativeFragment[] | undefined {
  const selected: NarrativeFragment[] = []
  for (const slot of NARRATIVE_SLOTS) {
    for (let count = 0; count < slotCount(slot); count++) {
      const candidates = fragments.filter(
        (fragment) =>
          fragment.slot === slot &&
          (!fallback || fragment.fallback) &&
          isFragmentEligible(fragment, context, theme) &&
          !selected.some(
            (prior) =>
              prior.id === fragment.id ||
              prior.conflictTags.some((tag) => fragment.conflictTags.includes(tag)),
          ),
      )
      const fragment = pickWeighted(candidates, (entry) => fragmentWeight(entry, context), random)
      if (!fragment) return undefined
      selected.push(fragment)
    }
  }
  return selected
}

function renderComposition(selected: NarrativeFragment[], context: NarrativeGenerationContext) {
  const render = (slot: NarrativeSlot) =>
    selected
      .filter((entry) => entry.slot === slot)
      .map((entry) =>
        entry.text.replace(
          new RegExp(NARRATIVE_TOKEN_PATTERN),
          (_, token: NarrativeToken) => context.tokens[token]!,
        ),
      )
  return {
    personalityTraits: render('personalityTraits'),
    ideals: render('ideals'),
    bonds: render('bonds'),
    flaws: render('flaws'),
    backstoryParagraphs: NARRATIVE_STORY_SLOTS.flatMap(render),
  }
}

/** Pure: same context, collection revision, and seed produce the same text. */
export function generateNarrative(input: {
  context: NarrativeGenerationContext
  collection: NarrativeCollection
  seed: number
}): NarrativeGenerationResult {
  const collection = narrativeCollectionSchema.safeParse(input.collection)
  const parsedContext = narrativeGenerationContextSchema.safeParse(input.context)
  if (!collection.success || !parsedContext.success || !Number.isSafeInteger(input.seed))
    return { ok: false, reason: INVALID_REASON }
  const fragments = [...collection.data.fragments].sort((a, b) => a.id.localeCompare(b.id))
  const random = createNarrativeRandom(input.seed)
  // Viability includes an unconditional complete fallback for this theme.
  const themes = NARRATIVE_THEMES.filter((theme) =>
    NARRATIVE_SLOTS.every(
      (slot) =>
        fragments.filter(
          (fragment) =>
            fragment.slot === slot &&
            fragment.fallback &&
            isFragmentEligible(fragment, parsedContext.data, theme),
        ).length >= slotCount(slot),
    ),
  )
  const theme = pickWeighted(themes, () => 1, random)
  if (!theme) return { ok: false, reason: FAILURE_REASON }
  const { context, plan } = bindNarrativeReferences(parsedContext.data, theme, random)
  let selected: NarrativeFragment[] | undefined
  for (let attempt = 0; attempt < MAX_COMPOSITION_ATTEMPTS && !selected; attempt++) {
    selected = selectComposition(fragments, context, theme, random, false)
  }
  const usedFallback = !selected
  selected ??= selectComposition(fragments, context, theme, random, true)
  if (!selected) return { ok: false, reason: FAILURE_REASON }
  const result = narrativeGenerationResultSchema.safeParse({
    ok: true,
    narrative: renderComposition(selected, context),
    plan,
    seed: input.seed,
    revision: collection.data.revision,
    fragmentIds: selected.map(({ id }) => id),
    usedFallback,
    omittedReferenceIds: [...context.omittedReferenceIds].sort(),
    selectedBindings: collectSelectedBindings(plan),
  })
  return result.success ? result.data : { ok: false, reason: INVALID_REASON }
}
