/**
 * Content catalog route helpers, separated from the top-level route map so
 * that adding a new content type only churns this file, not the higher-traffic
 * `routes.ts` which has 16+ dependents.
 */
export const CONTENT_ROUTES = {
  classes: {
    overview: (campaignId: string) => `/campaigns/${campaignId}/classes`,
    detail: (campaignId: string, classId: string) => `/campaigns/${campaignId}/classes/${classId}`,
    edit: (campaignId: string, classId: string) =>
      `/campaigns/${campaignId}/classes/${classId}/edit`,
    create: (campaignId: string) => `/campaigns/${campaignId}/classes/new`,
  },
  equipment: {
    overview: (campaignId: string) => `/campaigns/${campaignId}/equipment`,
    detail: (campaignId: string, equipmentId: string) =>
      `/campaigns/${campaignId}/equipment/${equipmentId}`,
    edit: (campaignId: string, equipmentId: string) =>
      `/campaigns/${campaignId}/equipment/${equipmentId}/edit`,
    create: (campaignId: string) => `/campaigns/${campaignId}/equipment/new`,
  },
  skillProficiencies: {
    overview: (campaignId: string) => `/campaigns/${campaignId}/skill-proficiencies`,
    detail: (campaignId: string, skillId: string) =>
      `/campaigns/${campaignId}/skill-proficiencies/${skillId}`,
    edit: (campaignId: string, skillId: string) =>
      `/campaigns/${campaignId}/skill-proficiencies/${skillId}/edit`,
    create: (campaignId: string) => `/campaigns/${campaignId}/skill-proficiencies/new`,
  },
  weapons: {
    overview: (campaignId: string) => `/campaigns/${campaignId}/weapons`,
    detail: (campaignId: string, weaponId: string) =>
      `/campaigns/${campaignId}/weapons/${weaponId}`,
    edit: (campaignId: string, weaponId: string) =>
      `/campaigns/${campaignId}/weapons/${weaponId}/edit`,
    create: (campaignId: string) => `/campaigns/${campaignId}/weapons/new`,
  },
  armor: {
    overview: (campaignId: string) => `/campaigns/${campaignId}/armor`,
    detail: (campaignId: string, armorId: string) => `/campaigns/${campaignId}/armor/${armorId}`,
    edit: (campaignId: string, armorId: string) => `/campaigns/${campaignId}/armor/${armorId}/edit`,
    create: (campaignId: string) => `/campaigns/${campaignId}/armor/new`,
  },
  species: {
    overview: (campaignId: string) => `/campaigns/${campaignId}/species`,
    detail: (campaignId: string, speciesId: string) =>
      `/campaigns/${campaignId}/species/${speciesId}`,
    edit: (campaignId: string, speciesId: string) =>
      `/campaigns/${campaignId}/species/${speciesId}/edit`,
    create: (campaignId: string) => `/campaigns/${campaignId}/species/new`,
  },
  spells: {
    overview: (campaignId: string) => `/campaigns/${campaignId}/spells`,
    detail: (campaignId: string, spellId: string) => `/campaigns/${campaignId}/spells/${spellId}`,
  },
} as const
