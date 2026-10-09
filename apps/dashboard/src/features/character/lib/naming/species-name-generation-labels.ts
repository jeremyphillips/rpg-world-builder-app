import { getContentTypeSentenceForm } from '@rpg/contracts'

const speciesSingular = getContentTypeSentenceForm('species', 1)

export const GENERATE_NAME_ACTION_LABEL = 'Generate' as const
export const SPECIES_NAME_GENERATION_FAILED =
  `Could not generate a name for this ${speciesSingular}.` as const
export const SPECIES_REQUIRED_FOR_NAME_GENERATION_HINT =
  `Choose a ${speciesSingular} to generate a name.` as const
