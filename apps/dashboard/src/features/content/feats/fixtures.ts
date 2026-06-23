import { pickFeat } from '../lib/fixtures/pick'

export const ALERT = pickFeat('alert')
export const GRAPPLER = pickFeat('grappler')
export const MAGIC_INITIATE = pickFeat('magic-initiate')

export const FEAT_LIST = [ALERT, GRAPPLER, MAGIC_INITIATE] as const
