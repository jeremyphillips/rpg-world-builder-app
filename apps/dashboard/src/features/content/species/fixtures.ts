import { pickSpecies } from '../lib/fixtures/pick'

export const ELF = pickSpecies('elf')
export const ORC = pickSpecies('orc')
export const HUMAN = pickSpecies('human')
export const DWARF = pickSpecies('dwarf')
/** Only SRD species without language affinities. */
export const TIEFLING = pickSpecies('tiefling')

export const SPECIES_LIST = [ELF, ORC, HUMAN, DWARF] as const
