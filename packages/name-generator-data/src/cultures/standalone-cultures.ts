import type { NamingCulture } from '@rpg/contracts/name-generator'

export const STANDALONE_NAMING_CULTURES = [
  {
    id: 'akan',
    label: 'Akan',
    origin: 'historical',
    regionIds: ['west-africa'],
    description: 'Precisely labeled Akan naming tradition.',
  },
] as const satisfies readonly NamingCulture[]
