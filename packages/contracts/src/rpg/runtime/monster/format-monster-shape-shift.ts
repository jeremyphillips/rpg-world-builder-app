import { joinNaturalList, withIndefiniteArticle } from '../../primitives/prose'
import type { CreatureSize } from '../../vocab/creature-size'
import { formatCreatureSizeList } from '../../vocab/creature-size'
import {
  SHAPE_SHIFT_EQUIPMENT_SENTENCES,
  type ShapeShiftEquipment,
} from '../../vocab/shape-shift-equipment'
import { creatureFormSizesDiffer, resolveCreatureFormStatistics } from '../creature/forms'

export const FORM_STATISTICS_SAME_SENTENCE = 'Its game statistics are the same in each form.'
export const FORM_STATISTICS_EXCEPT_SENTENCE =
  'Except for the differences noted, its game statistics are the same in each form.'

export type ShapeShiftFormInput = {
  id: string
  name?: string
  appearance?: string
  overrides?: { sizes?: readonly CreatureSize[] }
  notes?: string
}

export type ShapeShiftDescriptionInput = {
  monsterName: string
  baseSizes: readonly CreatureSize[]
  trueForm: ShapeShiftFormInput
  alternates: readonly ShapeShiftFormInput[]
  equipment?: ShapeShiftEquipment
  prerequisite?: string
  description?: string
}

function lowerName(name: string | undefined): string {
  return (name ?? 'form').toLocaleLowerCase()
}

function destinationPhrase(
  form: ShapeShiftFormInput,
  baseSizes: readonly CreatureSize[],
  sizeVaries: boolean,
): string {
  const resolved = resolveCreatureFormStatistics({ sizes: baseSizes }, form).sizes
  const noun = form.appearance ?? form.name ?? 'form'
  const sized =
    sizeVaries && resolved.length > 0 ? `${formatCreatureSizeList(resolved)} ${noun}` : noun
  return withIndefiniteArticle(sized)
}

function sizeVariesAcross(
  baseSizes: readonly CreatureSize[],
  trueForm: ShapeShiftFormInput,
  alternates: readonly ShapeShiftFormInput[],
): boolean {
  const trueSizes = resolveCreatureFormStatistics({ sizes: baseSizes }, trueForm).sizes
  return alternates.some((form) =>
    creatureFormSizesDiffer(
      trueSizes,
      resolveCreatureFormStatistics({ sizes: baseSizes }, form).sizes,
    ),
  )
}

function retainedSentence(differs: boolean): string {
  return differs ? FORM_STATISTICS_EXCEPT_SENTENCE : FORM_STATISTICS_SAME_SENTENCE
}

function noteSentences(alternates: readonly ShapeShiftFormInput[]): string[] {
  return alternates.flatMap((form) =>
    form.notes ? [`While in ${lowerName(form.name)} form, ${form.notes}`] : [],
  )
}

function monsterSubject(name: string): string {
  return name.trim().toLocaleLowerCase()
}

/** Generated Shape-Shift prose. Movement and speech sentences arrive with those overrides. */
export function formatMonsterShapeShift(input: ShapeShiftDescriptionInput): string {
  const varies = sizeVariesAcross(input.baseSizes, input.trueForm, input.alternates)
  const destinations = input.alternates.map((form) =>
    destinationPhrase(form, input.baseSizes, varies),
  )
  const trueAppearance = input.trueForm.appearance?.trim()
  const returns = trueAppearance ? `its true ${trueAppearance} form` : 'its true form'
  const lead = input.prerequisite?.trim()
    ? `If ${input.prerequisite.trim()}, it shape-shifts into ${joinNaturalList(destinations, { conjunction: 'or' })}`
    : `The ${monsterSubject(input.monsterName)} shape-shifts into ${joinNaturalList(destinations, { conjunction: 'or' })}`
  const differs = varies || input.alternates.some((form) => Boolean(form.notes))
  const parts = [
    `${lead}, or it returns to ${returns}.`,
    retainedSentence(differs),
    input.equipment ? SHAPE_SHIFT_EQUIPMENT_SENTENCES[input.equipment] : undefined,
    ...noteSentences(input.alternates),
    input.description?.trim() || undefined,
  ]
  return parts.filter(Boolean).join(' ')
}

/** Read-only Traits entry used when forms exist and no Shape-Shift row does. */
export function formatMonsterAlternateForms(input: {
  monsterName: string
  baseSizes: readonly CreatureSize[]
  trueForm: ShapeShiftFormInput
  alternates: readonly ShapeShiftFormInput[]
}): string | undefined {
  if (input.alternates.length === 0) return undefined
  const varies = sizeVariesAcross(input.baseSizes, input.trueForm, input.alternates)
  const destinations = input.alternates.map((form) =>
    destinationPhrase(form, input.baseSizes, varies),
  )
  const trueLabel = input.trueForm.appearance?.trim() || lowerName(input.trueForm.name)
  const differs = varies || input.alternates.some((form) => Boolean(form.notes))
  const parts = [
    `In addition to its true ${trueLabel} form, the ${monsterSubject(input.monsterName)} can take these forms: ${joinNaturalList(destinations)}.`,
    retainedSentence(differs),
    ...noteSentences(input.alternates),
  ]
  return parts.join(' ')
}
