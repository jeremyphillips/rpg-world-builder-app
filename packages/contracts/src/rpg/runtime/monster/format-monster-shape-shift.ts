import { joinNaturalList, withIndefiniteArticle } from '../../primitives/prose'
import type { MonsterForms } from '../../content/monster/forms'
import type { CreatureSize } from '../../vocab/creature-size'
import type { MovementSpeeds } from '../../vocab/movement-mode'
import { getCreatureSizeLabel, sortCreatureSizes } from '../../vocab/creature-size'
import {
  SHAPE_SHIFT_EQUIPMENT_SENTENCES,
  type ShapeShiftEquipment,
} from '../../vocab/shape-shift-equipment'
import {
  analyzeCreatureFormDifferences,
  creatureFormMechanicalDifferencesExist,
} from '../creature/form-differences'
import {
  creatureFormSizesDiffer,
  resolveCreatureFormsContext,
  resolveCreatureFormStatistics,
  type ResolvedCreatureFormIdentity,
} from '../creature/forms'
import {
  formatFormSpeechDescriptionSentence,
  TRUE_FORM_ONLY_FLY_SENTENCE,
} from './format-form-speech'
import { formatMovementParenthetical } from './format-monster-speed-stat-row'
import { resolveFormDifferencesPresentation } from './form-differences-presentation'

export const FORM_STATISTICS_SAME_SENTENCE = 'Its game statistics are the same in each form.'
export const FORM_STATISTICS_EXCEPT_SENTENCE =
  'Except for the differences noted, its game statistics are the same in each form.'

export type ShapeShiftDescriptionInput = {
  monsterName: string
  baseSizes: readonly CreatureSize[]
  baseMovement: MovementSpeeds
  baseHover?: boolean
  forms: MonsterForms
  equipment?: ShapeShiftEquipment
  prerequisite?: string
  description?: string
  hasShapeShift?: boolean
}

function lowerName(name: string | undefined): string {
  return (name ?? 'form').toLocaleLowerCase()
}

function destinationPhrase(
  form: ResolvedCreatureFormIdentity,
  input: ShapeShiftDescriptionInput,
  sizeVaries: boolean,
  includeMovement: boolean,
): string {
  const resolved = resolveCreatureFormStatistics(
    {
      sizes: input.baseSizes,
      movement: input.baseMovement,
      hover: input.baseHover,
    },
    form.form,
    { usesBaseStatistics: form.usesBaseStatistics },
  ).sizes
  const noun = lowerName(form.name)
  const sizeList = joinNaturalList(
    sortCreatureSizes(resolved, 'asc').map((size) => getCreatureSizeLabel(size)),
    { conjunction: 'or' },
  )
  const sized = sizeVaries && resolved.length > 0 ? `${sizeList} ${noun}` : noun
  let phrase = withIndefiniteArticle(sized)
  if (includeMovement) {
    const stats = resolveCreatureFormStatistics(
      {
        sizes: input.baseSizes,
        movement: input.baseMovement,
        hover: input.baseHover,
      },
      form.form,
      { usesBaseStatistics: form.usesBaseStatistics },
    )
    const parenthetical = formatMovementParenthetical(stats.movement.speeds, stats.movement.hover)
    if (parenthetical) phrase = `${phrase} (${parenthetical})`
  }
  return phrase
}

function sizeVariesAcross(
  input: ShapeShiftDescriptionInput,
  trueForm: ResolvedCreatureFormIdentity,
  destinations: readonly ResolvedCreatureFormIdentity[],
): boolean {
  const trueSizes = resolveCreatureFormStatistics(
    { sizes: input.baseSizes, movement: input.baseMovement, hover: input.baseHover },
    trueForm.form,
    { usesBaseStatistics: true },
  ).sizes
  return destinations.some((form) =>
    creatureFormSizesDiffer(
      trueSizes,
      resolveCreatureFormStatistics(
        { sizes: input.baseSizes, movement: input.baseMovement, hover: input.baseHover },
        form.form,
        { usesBaseStatistics: form.usesBaseStatistics },
      ).sizes,
    ),
  )
}

function retainedSentence(differs: boolean): string {
  return differs ? FORM_STATISTICS_EXCEPT_SENTENCE : FORM_STATISTICS_SAME_SENTENCE
}

function noteSentences(forms: readonly ResolvedCreatureFormIdentity[]): string[] {
  return forms.flatMap((form) =>
    form.form?.notes ? [`While in ${lowerName(form.name)} form, ${form.form.notes}`] : [],
  )
}

function monsterSubject(name: string): string {
  return name.trim().toLocaleLowerCase()
}

/** Generated Shape-Shift prose from resolved form context and difference analysis. */
// fallow-ignore-next-line complexity
export function formatMonsterShapeShift(input: ShapeShiftDescriptionInput): string {
  const context = resolveCreatureFormsContext(input.forms, input.monsterName)
  if (context.status !== 'complete') return ''

  const hasShapeShift = input.hasShapeShift !== false
  const presentation = resolveFormDifferencesPresentation(input.forms, hasShapeShift)
  const analysis = analyzeCreatureFormDifferences({
    sizes: input.baseSizes,
    movement: input.baseMovement,
    hover: input.baseHover,
    forms: input.forms,
    monsterName: input.monsterName,
  })
  const includeMovementInDestinations = presentation === 'transformation-description'
  const varies = sizeVariesAcross(input, context.trueForm, context.alternateDestinations)
  const destinations = context.alternateDestinations.map((form) =>
    destinationPhrase(form, input, varies, includeMovementInDestinations),
  )
  const explicitTrueName =
    context.trueForm.kind === 'defined'
      ? context.trueForm.name
      : input.forms.trueForm.kind === 'profile'
        ? input.forms.trueForm.name?.trim()
        : undefined
  const returns = explicitTrueName
    ? `its true ${explicitTrueName.toLocaleLowerCase()} form`
    : 'its true form'
  const lead = input.prerequisite?.trim()
    ? `If ${input.prerequisite.trim()}, it shape-shifts into ${joinNaturalList(destinations, { conjunction: 'or' })}`
    : `The ${monsterSubject(input.monsterName)} shape-shifts into ${joinNaturalList(destinations, { conjunction: 'or' })}`

  const mechanicalDiffers = creatureFormMechanicalDifferencesExist(analysis)
  const differs =
    mechanicalDiffers || context.definedForms.some((form) => Boolean(form.form?.notes))

  const parts = [`${lead}, or it returns to ${returns}.`]

  if (
    presentation === 'transformation-description' &&
    analysis?.trueFormOnlyModes.includes('fly')
  ) {
    parts.push(TRUE_FORM_ONLY_FLY_SENTENCE)
  }

  parts.push(retainedSentence(differs))

  if (input.equipment) parts.push(SHAPE_SHIFT_EQUIPMENT_SENTENCES[input.equipment])

  if (presentation === 'transformation-description' && analysis?.speechDiffers) {
    const speech = formatFormSpeechDescriptionSentence(input.monsterName, analysis.silentFormNames)
    if (speech) parts.push(speech)
  }

  parts.push(...noteSentences(context.definedForms))

  if (input.description?.trim()) parts.push(input.description.trim())

  return parts.filter(Boolean).join(' ')
}

/** Read-only Traits entry used when forms exist and no Shape-Shift row does. */
export function formatMonsterForms(input: {
  monsterName: string
  baseSizes: readonly CreatureSize[]
  baseMovement: MovementSpeeds
  baseHover?: boolean
  forms: MonsterForms
}): string | undefined {
  const context = resolveCreatureFormsContext(input.forms, input.monsterName)
  if (context.status !== 'complete' || context.alternateDestinations.length === 0) return undefined
  const analysis = analyzeCreatureFormDifferences({
    sizes: input.baseSizes,
    movement: input.baseMovement,
    hover: input.baseHover,
    forms: input.forms,
    monsterName: input.monsterName,
  })
  const varies = sizeVariesAcross(input, context.trueForm, context.alternateDestinations)
  const destinations = context.alternateDestinations.map((form) =>
    destinationPhrase(form, input, varies, false),
  )
  const explicitTrueName =
    context.trueForm.kind === 'defined'
      ? context.trueForm.name
      : input.forms.trueForm.kind === 'profile'
        ? input.forms.trueForm.name?.trim()
        : undefined
  const truePhrase = explicitTrueName
    ? `its true ${explicitTrueName.toLocaleLowerCase()} form`
    : 'its true form'
  const differs =
    creatureFormMechanicalDifferencesExist(analysis) ||
    context.definedForms.some((form) => Boolean(form.form?.notes))
  const parts = [
    `In addition to ${truePhrase}, the ${monsterSubject(input.monsterName)} can take these forms: ${joinNaturalList(destinations)}.`,
    retainedSentence(differs),
    ...noteSentences(context.definedForms),
  ]
  return parts.join(' ')
}
