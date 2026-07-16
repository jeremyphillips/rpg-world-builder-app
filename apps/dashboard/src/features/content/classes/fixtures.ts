import { pickClass, pickSubclass, pickSubclassesForClass } from '../lib/fixtures/pick'

export const FIGHTER = pickClass('fighter')
export const ROGUE = pickClass('rogue')
export const WIZARD = pickClass('wizard')
export const CLERIC = pickClass('cleric')
export const CHAMPION = pickSubclass('champion')

export const CLASS_LIST = [FIGHTER, WIZARD, CLERIC] as const

export const SUBCLASSES_FOR_FIGHTER = pickSubclassesForClass('fighter')
