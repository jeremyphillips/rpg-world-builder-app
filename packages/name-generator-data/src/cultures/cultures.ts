import type { NamingCulture } from '@rpg/contracts/name-generator'

import { STANDALONE_NAMING_CULTURES } from './standalone-cultures'

/** @deprecated Use STANDALONE_NAMING_CULTURES for standalone entries only. */
export const NAMING_CULTURES = STANDALONE_NAMING_CULTURES satisfies readonly NamingCulture[]
