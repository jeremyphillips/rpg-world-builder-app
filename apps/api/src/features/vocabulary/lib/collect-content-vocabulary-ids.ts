function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function collectDamageTypeIdsFromGrants(grants: Record<string, unknown>, ids: Set<string>): void {
  const damageType = grants.damageType
  if (Array.isArray(damageType)) {
    for (const id of damageType) {
      if (typeof id === 'string') ids.add(id)
    }
  }

  const resistances = grants.resistances
  if (Array.isArray(resistances)) {
    for (const id of resistances) {
      if (typeof id === 'string') ids.add(id)
    }
  }
}

function collectSenseTypeIdsFromGrants(grants: Record<string, unknown>, ids: Set<string>): void {
  const senses = grants.senses
  if (!Array.isArray(senses)) return
  for (const sense of senses) {
    if (isRecord(sense) && typeof sense.type === 'string') {
      ids.add(sense.type)
    }
  }
}

function collectFromTrait(
  trait: unknown,
  damageIds: Set<string>,
  senseIds: Set<string>,
  languageIds: Set<string>,
): void {
  if (!isRecord(trait) || !isRecord(trait.grants)) return
  collectDamageTypeIdsFromGrants(trait.grants, damageIds)
  collectSenseTypeIdsFromGrants(trait.grants, senseIds)
  collectLanguageIdsFromGrants(trait.grants, languageIds)
}

function collectLanguageIdsFromGrants(grants: Record<string, unknown>, ids: Set<string>): void {
  const languages = grants.languages
  if (Array.isArray(languages)) {
    for (const id of languages) {
      if (typeof id === 'string') ids.add(id)
    }
  }

  const languageChoices = grants.languageChoices
  if (!Array.isArray(languageChoices)) return
  for (const choice of languageChoices) {
    if (!isRecord(choice) || !Array.isArray(choice.from)) continue
    for (const id of choice.from) {
      if (typeof id === 'string') ids.add(id)
    }
  }
}

function collectFromTraits(
  traits: unknown,
  damageIds: Set<string>,
  senseIds: Set<string>,
  languageIds: Set<string>,
): void {
  if (!Array.isArray(traits)) return
  for (const trait of traits) {
    collectFromTrait(trait, damageIds, senseIds, languageIds)
  }
}

function collectFromHeritage(
  heritage: unknown,
  damageIds: Set<string>,
  senseIds: Set<string>,
  languageIds: Set<string>,
): void {
  if (!isRecord(heritage) || !Array.isArray(heritage.options)) return
  for (const option of heritage.options) {
    collectFromTrait(option, damageIds, senseIds, languageIds)
  }
}

/** Collects damage type ids referenced in species-like content body fields. */
export function collectDamageTypeIdsFromBody(body: Record<string, unknown>): string[] {
  const ids = new Set<string>()
  collectFromTraits(body.traits, ids, new Set(), new Set())
  collectFromHeritage(body.heritage, ids, new Set(), new Set())
  return [...ids]
}

/** Collects sense type ids referenced in species-like content body fields. */
export function collectSenseTypeIdsFromBody(body: Record<string, unknown>): string[] {
  const ids = new Set<string>()
  collectFromTraits(body.traits, new Set(), ids, new Set())
  collectFromHeritage(body.heritage, new Set(), ids, new Set())
  return [...ids]
}

/** Collects language ids referenced in species-like content body fields. */
export function collectLanguageIdsFromBody(body: Record<string, unknown>): string[] {
  const ids = new Set<string>()
  collectFromTraits(body.traits, new Set(), new Set(), ids)
  collectFromHeritage(body.heritage, new Set(), new Set(), ids)
  return [...ids]
}

/** Collects damage type ids from spell tag fields. */
export function collectDamageTypeIdsFromSpellBody(body: Record<string, unknown>): string[] {
  const tags = body.tags
  if (!isRecord(tags) || !Array.isArray(tags.damageTypes)) return []
  return tags.damageTypes.filter((id): id is string => typeof id === 'string')
}

/** Collects the spell school id from a spell body. */
export function collectSpellSchoolIdFromSpellBody(body: Record<string, unknown>): string[] {
  const school = body.school
  return typeof school === 'string' ? [school] : []
}
