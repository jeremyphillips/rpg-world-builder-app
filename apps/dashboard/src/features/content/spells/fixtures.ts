import { pickSpell } from '../lib/fixtures/pick'

export const FIRE_BOLT = pickSpell('fire-bolt')
export const DETECT_MAGIC = pickSpell('detect-magic')
export const CHILL_TOUCH = pickSpell('chill-touch')

export const SPELL_LIST = [FIRE_BOLT, DETECT_MAGIC, CHILL_TOUCH] as const
