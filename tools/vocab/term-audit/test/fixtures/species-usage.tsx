import { getContentTypeTerm } from '@rpg/contracts'

const copy = {
  label: 'Species',
  placeholder: 'species',
  title: 'Species',
}
const sentence = 'Species determines your ancestry.'
const dynamic = `A ${'species'} choice`
const helper = getContentTypeTerm('species')

// Species
export { copy, dynamic, helper, sentence }
