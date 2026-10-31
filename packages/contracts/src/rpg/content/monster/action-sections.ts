/** Monster action arrays keyed by stable entry id. Shared by provenance hosts and catalog checks. */
export const MONSTER_ACTION_SECTIONS = ['actions', 'bonusActions', 'reactions'] as const

export type MonsterActionSection = (typeof MONSTER_ACTION_SECTIONS)[number]
