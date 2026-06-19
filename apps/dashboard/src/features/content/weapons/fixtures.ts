import { pickWeapon } from '../lib/fixtures/pick'

export const LONGSWORD = pickWeapon('longsword')
export const SHORTBOW = pickWeapon('shortbow')
export const DAGGER = pickWeapon('dagger')

export const WEAPONS_LIST = [LONGSWORD, SHORTBOW, DAGGER] as const
