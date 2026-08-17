import { pickSpecies } from '../lib/fixtures/pick'

export const ELF = pickSpecies('elf')
export const ORC = pickSpecies('orc')
export const HUMAN = pickSpecies('human')
export const DWARF = pickSpecies('dwarf')

export const SPECIES_LIST = [ELF, ORC, HUMAN, DWARF] as const
