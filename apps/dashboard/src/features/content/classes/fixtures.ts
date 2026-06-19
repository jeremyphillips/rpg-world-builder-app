import { pickClass, pickSubclass, pickSubclassesForClass } from '../lib/fixtures/pick'

export const FIGHTER = pickClass('fighter')
export const CHAMPION = pickSubclass('champion')

export const SUBCLASSES_FOR_FIGHTER = pickSubclassesForClass('fighter')
