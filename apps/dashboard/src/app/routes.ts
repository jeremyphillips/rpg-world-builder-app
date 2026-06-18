export const ROUTES = {
  home: '/',
  characters: '/characters',
  profile: '/profile',
  account: '/account',
  campaign: {
    create: '/campaigns/new',
    detail: (id: string) => `/campaigns/${id}`,
    sessions: (id: string) => `/campaigns/${id}/sessions`,
    settings: (id: string) => `/campaigns/${id}/settings`,
  },
  admin: {
    users: '/admin/users',
    settings: '/admin/settings',
  },
  content: {
    classes: {
      overview: (campaignId: string) => `/campaigns/${campaignId}/classes`,
      detail: (campaignId: string, classId: string) =>
        `/campaigns/${campaignId}/classes/${classId}`,
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
      edit: (campaignId: string, armorId: string) =>
        `/campaigns/${campaignId}/armor/${armorId}/edit`,
      create: (campaignId: string) => `/campaigns/${campaignId}/armor/new`,
    },
  },
} as const
