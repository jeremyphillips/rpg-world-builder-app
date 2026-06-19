import { pickArmor } from '../lib/fixtures/pick'

export const LEATHER = pickArmor('leather')
export const CHAIN_MAIL = pickArmor('chain-mail')
export const SHIELD = pickArmor('shield-steel')

export const ARMOR_LIST = [LEATHER, CHAIN_MAIL, SHIELD] as const
