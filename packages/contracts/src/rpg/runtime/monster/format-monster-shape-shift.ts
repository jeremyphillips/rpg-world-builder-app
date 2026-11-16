import { joinNaturalList, withIndefiniteArticle } from '../../primitives/prose'
import type { CreatureFormsDraft } from '../../content/creature/forms'
import type { CreatureSize } from '../../vocab/creature-size'
import { getCreatureSizeLabel, sortCreatureSizes } from '../../vocab/creature-size'
import {
  SHAPE_SHIFT_EQUIPMENT_SENTENCES,
  type ShapeShiftEquipment,
} from '../../vocab/shape-shift-equipment'
import {
  creatureFormSizesDiffer,
  resolveCreatureFormsContext,
  resolveCreatureFormStatistics,
  type ResolvedCreatureFormIdentity,
} from '../creature/forms'

export const FORM_STATISTICS_SAME_SENTENCE = 'Its game statistics are the same in each form.'
export const FORM_STATISTICS_EXCEPT_SENTENCE =
  'Except for the differences noted, its game statistics are the same in each form.'

export type ShapeShiftDescriptionInput = {
  monsterName: string
  baseSizes: readonly CreatureSize[]
  forms: CreatureFormsDraft
  equipment?: ShapeShiftEquipment
  prerequisite?: string
  description?: string
}

function lowerName(name: string | undefined): string {
  return (name ?? 'form').toLocaleLowerCase()
}

function destinationPhrase(
  form: ResolvedCreatureFormIdentity,
  baseSizes: readonly CreatureSize[],
  sizeVaries: boolean,
): string {
  const resolved = resolveCreatureFormStatistics({ sizes: baseSizes }, form.form, {
    usesBaseStatistics: form.usesBaseStatistics,
  }).sizes
  const noun = lowerName(form.name)
  const sizeList = joinNaturalList(
    sortCreatureSizes(resolved, 'asc').map((size) => getCreatureSizeLabel(size)),
    { conjunction: 'or' },
  )
  const sized = sizeVaries && resolved.length > 0 ? `${sizeList} ${noun}` : noun
  return withIndefiniteArticle(sized)
}

function sizeVariesAcross(
  baseSizes: readonly CreatureSize[],
  trueForm: ResolvedCreatureFormIdentity,
  destinations: readonly ResolvedCreatureFormIdentity[],
): boolean {
  const trueSizes = resolveCreatureFormStatistics({ sizes: baseSizes }, trueForm.form, {
    usesBaseStatistics: true,
  }).sizes
  return destinations.some((form) =>
    creatureFormSizesDiffer(
      trueSizes,
      resolveCreatureFormStatistics({ sizes: baseSizes }, form.form, {
        usesBaseStatistics: form.usesBaseStatistics,
      }).sizes,
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

/** Generated Shape-Shift prose. Movement and speech sentences arrive with those overrides. */
export function formatMonsterShapeShift(input: ShapeShiftDescriptionInput): string {
  const context = resolveCreatureFormsContext(input.forms, input.monsterName)
  if (context.status !== 'complete') return ''
  const varies = sizeVariesAcross(input.baseSizes, context.trueForm, context.alternateDestinations)
  const destinations = context.alternateDestinations.map((form) =>
    destinationPhrase(form, input.baseSizes, varies),
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
  const differs = varies || context.definedForms.some((form) => Boolean(form.form?.notes))
  const parts = [
    `${lead}, or it returns to ${returns}.`,
    retainedSentence(differs),
    input.equipment ? SHAPE_SHIFT_EQUIPMENT_SENTENCES[input.equipment] : undefined,
    ...noteSentences(context.definedForms),
    input.description?.trim() || undefined,
  ]
  return parts.filter(Boolean).join(' ')
}

/** Read-only Traits entry used when forms exist and no Shape-Shift row does. */
export function formatMonsterForms(input: {
  monsterName: string
  baseSizes: readonly CreatureSize[]
  forms: CreatureFormsDraft
}): string | undefined {
  const context = resolveCreatureFormsContext(input.forms, input.monsterName)
  if (context.status !== 'complete' || context.alternateDestinations.length === 0) return undefined
  const varies = sizeVariesAcross(input.baseSizes, context.trueForm, context.alternateDestinations)
  const destinations = context.alternateDestinations.map((form) =>
    destinationPhrase(form, input.baseSizes, varies),
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
  const differs = varies || context.definedForms.some((form) => Boolean(form.form?.notes))
  const parts = [
    `In addition to ${truePhrase}, the ${monsterSubject(input.monsterName)} can take these forms: ${joinNaturalList(destinations)}.`,
    retainedSentence(differs),
    ...noteSentences(context.definedForms),
  ]
  return parts.join(' ')
}
