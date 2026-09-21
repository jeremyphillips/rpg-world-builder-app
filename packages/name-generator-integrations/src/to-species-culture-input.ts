import type { Species } from '@rpg/contracts/rpg/content'

import type { SpeciesCultureInput } from './resolve-campaign-conventions'

/** Maps catalog {@link Species} to the integrations naming input shape. */
export function toSpeciesCultureInput(species: Species): SpeciesCultureInput {
  return {
    id: species.id,
    slug: species.slug,
    name: species.name,
    source: species.source,
    languageAffinities: species.languageAffinities,
    culture: species.culture,
    heritage:
      species.heritage === undefined
        ? undefined
        : {
            options: species.heritage.options.map((option) => ({
              id: option.id,
              name: 'name' in option ? option.name : undefined,
            })),
          },
  }
}
