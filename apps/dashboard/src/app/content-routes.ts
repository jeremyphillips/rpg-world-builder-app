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
    hub: (campaignId: string) => `/campaigns/${campaignId}/equipment`,
    /** Alias for the equipment hub route. */
    overview: (campaignId: string) => `/campaigns/${campaignId}/equipment`,
    family: (campaignId: string, family: string) => `/campaigns/${campaignId}/equipment/${family}`,
    detail: (campaignId: string, family: string, equipmentId: string) =>
      `/campaigns/${campaignId}/equipment/${family}/${equipmentId}`,
    edit: (campaignId: string, family: string, equipmentId: string) =>
      `/campaigns/${campaignId}/equipment/${family}/${equipmentId}/edit`,
    create: (campaignId: string, family: string) =>
      `/campaigns/${campaignId}/equipment/${family}/new`,
  },
  skillProficiencies: {
    overview: (campaignId: string) => `/campaigns/${campaignId}/skill-proficiencies`,
    detail: (campaignId: string, skillId: string) =>
      `/campaigns/${campaignId}/skill-proficiencies/${skillId}`,
    edit: (campaignId: string, skillId: string) =>
      `/campaigns/${campaignId}/skill-proficiencies/${skillId}/edit`,
    create: (campaignId: string) => `/campaigns/${campaignId}/skill-proficiencies/new`,
  },
  organizations: {
    overview: (campaignId: string) => `/campaigns/${campaignId}/organizations`,
    detail: (campaignId: string, organizationId: string) =>
      `/campaigns/${campaignId}/organizations/${organizationId}`,
    edit: (campaignId: string, organizationId: string) =>
      `/campaigns/${campaignId}/organizations/${organizationId}/edit`,
    create: (campaignId: string) => `/campaigns/${campaignId}/organizations/new`,
  },
  species: {
    overview: (campaignId: string) => `/campaigns/${campaignId}/species`,
    detail: (campaignId: string, speciesId: string) =>
      `/campaigns/${campaignId}/species/${speciesId}`,
    edit: (campaignId: string, speciesId: string) =>
      `/campaigns/${campaignId}/species/${speciesId}/edit`,
    create: (campaignId: string) => `/campaigns/${campaignId}/species/new`,
  },
  feats: {
    overview: (campaignId: string) => `/campaigns/${campaignId}/feats`,
    detail: (campaignId: string, featId: string) => `/campaigns/${campaignId}/feats/${featId}`,
    edit: (campaignId: string, featId: string) => `/campaigns/${campaignId}/feats/${featId}/edit`,
    create: (campaignId: string) => `/campaigns/${campaignId}/feats/new`,
  },
  spells: {
    overview: (campaignId: string) => `/campaigns/${campaignId}/spells`,
    detail: (campaignId: string, spellId: string) => `/campaigns/${campaignId}/spells/${spellId}`,
    edit: (campaignId: string, spellId: string) =>
      `/campaigns/${campaignId}/spells/${spellId}/edit`,
    create: (campaignId: string) => `/campaigns/${campaignId}/spells/new`,
  },
} as const
