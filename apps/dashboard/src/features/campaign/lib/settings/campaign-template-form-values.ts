import type { CampaignTemplate } from '@rpg/contracts'

import type { CampaignCreateValues } from './campaign-settings-form-values'

function omitUndefined<T extends Record<string, unknown>>(values: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(values).filter(([, value]) => value !== undefined),
  ) as Partial<T>
}

/** Flatten the template defaults that are editable in the campaign creation wizard. */
export function mapCampaignTemplateToCreateValues(
  template: CampaignTemplate,
): Partial<CampaignCreateValues> {
  const flavor = template.defaults.configuration?.flavor
  const characterCreation = template.defaults.characterCreation

  return omitUndefined({
    description: template.defaults.identity?.description,
    startingLevel: characterCreation?.startingLevel,
    importedCharactersPolicy: characterCreation?.importedCharacters?.policy,
    playStyle: flavor?.playStyle,
    mood: flavor?.mood,
    magicLevel: flavor?.magicLevel,
    difficulty: flavor?.difficulty,
  })
}
