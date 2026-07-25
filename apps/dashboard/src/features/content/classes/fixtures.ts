import type { ClassListItem } from '@rpg/contracts'

import { pickClass, pickSubclass, pickSubclassesForClass } from '../lib/fixtures/pick'

function toClassListItem(classItem: ReturnType<typeof pickClass>): ClassListItem {
  return {
    ...classItem,
    subclasses: pickSubclassesForClass(classItem.slug).map(({ id, name }) => ({ id, name })),
  }
}

export const FIGHTER = toClassListItem(pickClass('fighter'))
export const ROGUE = toClassListItem(pickClass('rogue'))
export const WIZARD = toClassListItem(pickClass('wizard'))
export const CLERIC = toClassListItem(pickClass('cleric'))
export const CHAMPION = pickSubclass('champion')

export const CLASS_LIST = [FIGHTER, WIZARD, CLERIC] as const

export const SUBCLASSES_FOR_FIGHTER = pickSubclassesForClass('fighter')
