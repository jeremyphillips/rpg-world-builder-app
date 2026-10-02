import type {
  CharacterBuildCatalogIndex,
  CharacterDerivationInput,
  CharacterLocationReferenceResolution,
  CharacterProficiencies,
  Equipment,
  MovementMode,
  OrganizationReferenceResolution,
  ResolvedCharacterCreationRules,
  Species,
  XpProgressionBody,
} from '@rpg/contracts'
import {
  ABILITY_ENTRIES,
  ABILITY_IDS,
  deriveCharacterProfile,
  formatSignedModifier,
  formatWeaponDamageWithModifier,
  getGenderLabel,
  getCharacterLocationConnectionDisplayLabel,
  getMovementModeLabel,
  getOrganizationDomainLabel,
  MOVEMENT_MODES,
  proficiencyBonus,
  resolveCharacterXpDisplay,
  resolveCreatureInitiativeModifier,
  resolveCreatureMovement,
  createDefaultCharacterVitalState,
  resolveEquippedArmorFromInventory,
  resolveTraitDisplay,
  resolveWeaponAttackAbilityModifier,
  weaponAttackBonus,
  getWeaponCategoryLabel,
  getArmorCategoryLabel,
  getToolCategoryLabel,
} from '@rpg/contracts'

import { resolveLanguagePreviewLabel } from '../builder-preview/language-preview-label'
import {
  buildCharacterSheetEquipmentCards,
  buildCharacterSheetSpellCards,
} from '../detail/character-sheet-catalog'
import {
  formatPreviewOptionalNumber,
  formatPreviewSignedNumber,
} from '../builder-preview/character-builder-preview-panel.lib'
import {
  CHARACTER_EMPTY_SECTION_TEXT,
  CHARACTER_PROFICIENCY_GROUP_LABELS,
  CHARACTER_SECTION_LABELS,
  CHARACTER_STAT_LABELS,
  UNAVAILABLE_LOCATION_LABEL,
  UNAVAILABLE_ORGANIZATION_LABEL,
} from './character-display-labels'
import type {
  CharacterAbilityTile,
  CharacterActionRowViewModel,
  CharacterDetailListItem,
  CharacterDetailListSection,
  CharacterDetailStatTile,
  CharacterDetailStatTileFooter,
  CharacterDetailViewModel,
  CharacterHitPointsViewModel,
  CharacterProficiencyGroup,
  CharacterProficiencyGroupId,
  CharacterProficienciesViewModel,
} from './character-display-types'
import {
  characterDetailSourceSummaryInput,
  type CharacterDetailSource,
} from './character-detail-source.lib'
import { formatContentReferenceLabel } from './format-content-reference-label'
import { resolveCharacterVitalStatusPresentation } from './character-vital-presentation'
import { formatCharacterSummaryFromCatalog } from './character-summary.lib'

export type CharacterDisplayInput = {
  source: CharacterDetailSource
  catalogIndex: CharacterBuildCatalogIndex
  rules: ResolvedCharacterCreationRules
  xpProgression: Pick<XpProgressionBody, 'entries'>
  organizationReferences?: readonly OrganizationReferenceResolution[]
  locationReferences?: readonly CharacterLocationReferenceResolution[]
}

function getDetailSourceTotalLevel(source: CharacterDetailSource): number {
  return source.classes.reduce((total, entry) => total + entry.level, 0)
}

function toCharacterDetailDerivationInput(
  source: CharacterDetailSource,
  catalogIndex: CharacterBuildCatalogIndex,
  rules: ResolvedCharacterCreationRules,
): CharacterDerivationInput {
  const primaryClassId = source.classes.find((entry) => entry.classId)?.classId
  const characterClass = primaryClassId ? catalogIndex.classes.get(primaryClassId) : undefined
  const equippedArmor = resolveEquippedArmorFromInventory({
    equipment: source.equipment,
    catalog: catalogIndex.equipment,
  })

  return {
    level: getDetailSourceTotalLevel(source),
    armorClassBase: rules.armorClass.base,
    abilityScores: source.abilityScores,
    characterClass,
    proficiencies: source.proficiencies,
    skillProficiencies: Array.from(catalogIndex.skillProficiencies.values()),
    equippedArmor: equippedArmor.length > 0 ? equippedArmor : undefined,
  }
}

function resolveIdentitySummary(
  source: CharacterDetailSource,
  catalogIndex: CharacterBuildCatalogIndex,
): string {
  if (source.identitySummary) return source.identitySummary

  const summaryInput = characterDetailSourceSummaryInput(source)
  if (!summaryInput) return '—'

  return formatCharacterSummaryFromCatalog(summaryInput, catalogIndex)
}

function isCharacterProficientWithWeapon(
  proficiencies: CharacterProficiencies,
  weapon: Extract<Equipment, { kind: 'weapon' }>,
): boolean {
  return proficiencies.weapons.some((entry) => {
    if (entry.weaponId) return entry.weaponId === weapon.id
    if (entry.weaponCategory) return entry.weaponCategory === weapon.category
    return false
  })
}

function buildActionRows(
  source: CharacterDetailSource,
  catalogIndex: CharacterBuildCatalogIndex,
  level: number,
): CharacterActionRowViewModel[] {
  const profBonus = proficiencyBonus(level)
  const rows: CharacterActionRowViewModel[] = []
  const abilityScores = source.abilityScores ?? {}

  for (const entry of source.equipment.weapons) {
    const equipment = catalogIndex.equipment.get(entry.equipmentId)
    if (!equipment || equipment.kind !== 'weapon' || !equipment.damage) continue

    const abilityMod = resolveWeaponAttackAbilityModifier(equipment, abilityScores)
    if (abilityMod === undefined) continue

    const isProficient = isCharacterProficientWithWeapon(source.proficiencies, equipment)
    const attack = weaponAttackBonus(abilityMod, isProficient, profBonus)

    rows.push({
      id: entry.entryId ?? entry.equipmentId,
      name: entry.customName ?? equipment.name,
      attackBonus: formatSignedModifier(attack),
      damage: formatWeaponDamageWithModifier(equipment.damage, abilityMod),
    })
  }

  return rows
}

function buildSavingThrowSection(
  source: CharacterDetailSource,
  catalogIndex: CharacterBuildCatalogIndex,
  rules: ResolvedCharacterCreationRules,
): CharacterDetailListSection {
  const derivationInput = toCharacterDetailDerivationInput(source, catalogIndex, rules)
  const profile = deriveCharacterProfile(derivationInput)

  const items = profile.savingThrows
    .filter((save) => save.proficient)
    .map((save) => ({
      id: save.ability,
      label: ABILITY_ENTRIES[save.ability].label,
      detail:
        save.bonus === undefined
          ? undefined
          : save.bonus >= 0
            ? `+${save.bonus}`
            : String(save.bonus),
    }))

  return {
    title: CHARACTER_SECTION_LABELS.savingThrows,
    items,
    emptyText: CHARACTER_EMPTY_SECTION_TEXT.savingThrows,
  }
}

function buildProficiencyGroup(
  id: CharacterProficiencyGroupId,
  title: string,
  items: CharacterDetailListItem[],
): CharacterProficiencyGroup | undefined {
  if (items.length === 0) return undefined
  return { id, title, items }
}

function buildProficienciesSection(
  source: CharacterDetailSource,
  catalogIndex: CharacterBuildCatalogIndex,
  rules: ResolvedCharacterCreationRules,
): CharacterProficienciesViewModel {
  const derivationInput = toCharacterDetailDerivationInput(source, catalogIndex, rules)
  const profile = deriveCharacterProfile(derivationInput)

  const groups = [
    buildProficiencyGroup(
      'skills',
      CHARACTER_PROFICIENCY_GROUP_LABELS.skills,
      profile.skills
        .filter((skill) => skill.rank !== undefined)
        .map((skill) => ({
          id: skill.skillId,
          label: skill.label,
          detail:
            skill.modifier === undefined
              ? undefined
              : skill.modifier >= 0
                ? `+${skill.modifier}`
                : String(skill.modifier),
        })),
    ),
    buildProficiencyGroup(
      'languages',
      CHARACTER_PROFICIENCY_GROUP_LABELS.languages,
      source.proficiencies.languages.map((entry) => ({
        id: entry.language,
        label: resolveLanguagePreviewLabel(entry.language, catalogIndex),
      })),
    ),
    buildProficiencyGroup(
      'weapons',
      CHARACTER_PROFICIENCY_GROUP_LABELS.weapons,
      source.proficiencies.weapons.map((weapon, index) => ({
        id: weapon.weaponId ?? `${weapon.weaponCategory ?? 'weapon'}-${index}`,
        label: weapon.weaponId
          ? (catalogIndex.equipment.get(weapon.weaponId)?.name ??
            formatContentReferenceLabel(weapon.weaponId))
          : weapon.weaponCategory
            ? getWeaponCategoryLabel(weapon.weaponCategory)
            : 'Weapon proficiency',
      })),
    ),
    buildProficiencyGroup(
      'tools',
      CHARACTER_PROFICIENCY_GROUP_LABELS.tools,
      source.proficiencies.tools.map((tool, index) => ({
        id: tool.toolId ?? `${tool.toolCategory ?? 'tool'}-${index}`,
        label: tool.toolId
          ? (catalogIndex.equipment.get(tool.toolId)?.name ??
            formatContentReferenceLabel(tool.toolId))
          : tool.toolCategory
            ? getToolCategoryLabel(tool.toolCategory)
            : 'Tool proficiency',
      })),
    ),
    buildProficiencyGroup(
      'armor',
      CHARACTER_PROFICIENCY_GROUP_LABELS.armor,
      source.proficiencies.armor.map((armor, index) => ({
        id: `${armor.armorCategory}-${index}`,
        label: getArmorCategoryLabel(armor.armorCategory),
      })),
    ),
  ].filter((group): group is CharacterProficiencyGroup => group !== undefined)

  return {
    title: CHARACTER_SECTION_LABELS.proficiencies,
    groups,
    emptyText: CHARACTER_EMPTY_SECTION_TEXT.proficiencies,
  }
}

function buildClassFeaturesSection(
  source: CharacterDetailSource,
  catalogIndex: CharacterBuildCatalogIndex,
): CharacterDetailListSection {
  const items: CharacterDetailListItem[] = []

  for (const classEntry of source.classes) {
    if (!classEntry.classId) continue
    const characterClass = catalogIndex.classes.get(classEntry.classId)
    if (!characterClass) continue

    for (const feature of characterClass.features) {
      if (feature.kind === 'subclass-choice' || feature.level > classEntry.level) continue
      items.push({
        id: feature.id,
        label: feature.name,
        detail: `Level ${feature.level}`,
      })
    }
  }

  return {
    title: CHARACTER_SECTION_LABELS.classFeatures,
    items,
    emptyText: CHARACTER_EMPTY_SECTION_TEXT.classFeatures,
  }
}

function buildSpeciesTraitsSection(
  source: CharacterDetailSource,
  catalogIndex: CharacterBuildCatalogIndex,
): CharacterDetailListSection {
  const speciesId = source.species?.id
  if (!speciesId) {
    return {
      title: CHARACTER_SECTION_LABELS.speciesTraits,
      items: [],
      emptyText: CHARACTER_EMPTY_SECTION_TEXT.speciesTraits,
    }
  }

  const species = catalogIndex.species.get(speciesId)
  if (!species) {
    return {
      title: CHARACTER_SECTION_LABELS.speciesTraits,
      items: [],
      emptyText: CHARACTER_EMPTY_SECTION_TEXT.speciesTraits,
    }
  }

  const traits = [...species.traits]
  const heritageOption = species.heritage?.options.find(
    (option) => option.id === source.species?.heritageId,
  )
  if (heritageOption) traits.push(heritageOption)

  const items = traits.map((trait) => {
    const display = resolveTraitDisplay(trait)
    return {
      id: trait.id,
      label: display.name,
      detail: display.descriptionHtml ? undefined : display.name,
    }
  })

  return {
    title: CHARACTER_SECTION_LABELS.speciesTraits,
    items,
    emptyText: CHARACTER_EMPTY_SECTION_TEXT.speciesTraits,
  }
}

function buildFeatsSection(source: CharacterDetailSource): CharacterDetailListSection {
  const items = source.feats.map((entry) => ({
    id: entry.featId,
    label: formatContentReferenceLabel(entry.featId),
    detail: entry.notes,
  }))

  return {
    title: CHARACTER_SECTION_LABELS.feats,
    items,
    emptyText: CHARACTER_EMPTY_SECTION_TEXT.feats,
  }
}

function resolvePrimaryMovementMode(species: Species | undefined): MovementMode | undefined {
  if (!species) return undefined

  const speeds = resolveCreatureMovement(species)
  if (speeds.walk !== undefined) return 'walk'

  return MOVEMENT_MODES.find((mode) => speeds[mode] !== undefined)
}

function resolveSpeedStatTile(species: Species | undefined): Pick<
  CharacterDetailStatTile,
  'value'
> & {
  footer?: CharacterDetailStatTileFooter
} {
  const mode = resolvePrimaryMovementMode(species)
  if (!mode) return { value: '—' }

  const speeds = resolveCreatureMovement(species!)
  const feet = speeds[mode]
  if (feet === undefined) return { value: '—' }

  return {
    value: String(feet),
    footer: { kind: 'meta', text: getMovementModeLabel(mode) },
  }
}

function buildStats(
  source: CharacterDetailSource,
  catalogIndex: CharacterBuildCatalogIndex,
  rules: ResolvedCharacterCreationRules,
): CharacterDetailStatTile[] {
  const derivationInput = toCharacterDetailDerivationInput(source, catalogIndex, rules)
  const profile = deriveCharacterProfile(derivationInput)
  const species = source.species?.id ? catalogIndex.species.get(source.species.id) : undefined
  const speed = resolveSpeedStatTile(species)
  const dexScore = source.abilityScores?.dex
  const initiative =
    dexScore !== undefined ? resolveCreatureInitiativeModifier(dexScore) : undefined
  return [
    {
      id: 'ac',
      label: CHARACTER_STAT_LABELS.armorClass,
      value: formatPreviewOptionalNumber(profile.ac),
    },
    {
      id: 'initiative',
      label: CHARACTER_STAT_LABELS.initiative,
      value: formatPreviewSignedNumber(initiative),
    },
    {
      id: 'speed',
      label: CHARACTER_STAT_LABELS.speed,
      value: speed.value,
      footer: speed.footer,
    },
    {
      id: 'proficiencyBonus',
      label: CHARACTER_STAT_LABELS.proficiency,
      value: formatPreviewOptionalNumber(profile.proficiencyBonus, '+'),
      footer: { kind: 'label', text: CHARACTER_STAT_LABELS.proficiencyBonusFooter },
    },
  ]
}

function hasCompleteAbilityScores(source: CharacterDetailSource): boolean {
  if (!source.abilityScores) return false
  return ABILITY_IDS.every((ability) => typeof source.abilityScores?.[ability] === 'number')
}

function allowDerivedHitPoints(source: CharacterDetailSource): boolean {
  return hasCompleteAbilityScores(source) || source.hitPoints?.base !== undefined
}

function resolveHitPointsMaxDisplay(
  source: CharacterDetailSource,
  derivedMaxHp: number | undefined,
): string {
  const storedBase = source.hitPoints?.base
  if (allowDerivedHitPoints(source) && derivedMaxHp !== undefined) {
    return formatPreviewOptionalNumber(derivedMaxHp)
  }
  if (storedBase !== undefined) {
    return formatPreviewOptionalNumber(storedBase)
  }
  return formatPreviewOptionalNumber(undefined)
}

function resolveHitPointsCurrentDisplay(
  source: CharacterDetailSource,
  maxDisplay: string,
  derivedMaxHp: number | undefined,
): string {
  const storedCurrent = source.hitPoints?.current
  if (storedCurrent !== undefined) {
    return formatPreviewOptionalNumber(storedCurrent)
  }

  const hasResolvedMax =
    allowDerivedHitPoints(source) &&
    (derivedMaxHp !== undefined || source.hitPoints?.base !== undefined)
  if (hasResolvedMax) return maxDisplay

  return formatPreviewOptionalNumber(undefined)
}

function buildHitPoints(
  source: CharacterDetailSource,
  catalogIndex: CharacterBuildCatalogIndex,
  rules: ResolvedCharacterCreationRules,
): CharacterHitPointsViewModel {
  const derivationInput = toCharacterDetailDerivationInput(source, catalogIndex, rules)
  const profile = deriveCharacterProfile(derivationInput)
  const max = resolveHitPointsMaxDisplay(source, profile.maxHp)
  const current = resolveHitPointsCurrentDisplay(source, max, profile.maxHp)
  const temporary = source.hitPoints?.temporary

  return {
    current,
    max,
    temporary: temporary && temporary > 0 ? String(temporary) : '—',
  }
}

function buildAbilities(
  source: CharacterDetailSource,
  catalogIndex: CharacterBuildCatalogIndex,
  rules: ResolvedCharacterCreationRules,
): CharacterAbilityTile[] {
  const derivationInput = toCharacterDetailDerivationInput(source, catalogIndex, rules)
  const profile = deriveCharacterProfile(derivationInput)

  return ABILITY_IDS.map((ability) => {
    const entry = profile.abilityScores[ability]
    return {
      id: ability,
      label: ABILITY_ENTRIES[ability].label,
      score: formatPreviewOptionalNumber(entry?.score),
      modifier: formatPreviewSignedNumber(entry?.modifier),
    }
  })
}

function buildIdentityXp(
  source: CharacterDetailSource,
  xpProgression: Pick<XpProgressionBody, 'entries'>,
): string | null {
  if (source.xp === undefined) return null
  const xp = resolveCharacterXpDisplay({ xp: source.xp }, xpProgression)
  return xp === null ? null : String(xp)
}

export function buildCharacterDetailViewModel({
  source,
  catalogIndex,
  rules,
  xpProgression,
  organizationReferences = [],
  locationReferences = [],
}: CharacterDisplayInput): CharacterDetailViewModel {
  const level = getDetailSourceTotalLevel(source)

  const organizationItems = organizationReferences.map(
    ({ organizationId, organization, title }) => ({
      id: `organization:${organizationId}`,
      label: organization?.name ?? UNAVAILABLE_ORGANIZATION_LABEL,
      detail: title
        ? title
        : organization?.organizationDomain
          ? getOrganizationDomainLabel(organization.organizationDomain)
          : organization
            ? 'Type not set'
            : 'This organization is missing or no longer available.',
    }),
  )

  const locationItems = locationReferences.map(({ connection, location }) => ({
    id: `location:${connection.id}`,
    label: location?.name ?? UNAVAILABLE_LOCATION_LABEL,
    detail: location
      ? getCharacterLocationConnectionDisplayLabel(connection.kind, 'forward')
      : 'This location is missing or no longer available.',
  }))

  const vital = source.vital ?? createDefaultCharacterVitalState()

  return {
    id: source.id,
    identity: {
      name: source.name,
      summary: resolveIdentitySummary(source, catalogIndex),
      gender: source.gender ? getGenderLabel(source.gender) : '—',
      xp: buildIdentityXp(source, xpProgression),
      vital,
      vitalLabel: resolveCharacterVitalStatusPresentation(vital.status).label,
    },
    stats: buildStats(source, catalogIndex, rules),
    abilities: buildAbilities(source, catalogIndex, rules),
    hitPoints: buildHitPoints(source, catalogIndex, rules),
    actions: buildActionRows(source, catalogIndex, level),
    savingThrows: buildSavingThrowSection(source, catalogIndex, rules),
    proficiencies: buildProficienciesSection(source, catalogIndex, rules),
    spells: buildCharacterSheetSpellCards({ spells: [...source.spells] }, catalogIndex),
    equipment: buildCharacterSheetEquipmentCards(source, catalogIndex),
    wealth: {
      label: CHARACTER_SECTION_LABELS.wealth,
      value: source.wealth !== undefined ? `${source.wealth.gp} gp` : '—',
    },
    classFeatures: buildClassFeaturesSection(source, catalogIndex),
    speciesTraits: buildSpeciesTraitsSection(source, catalogIndex),
    feats: buildFeatsSection(source),
    connections: {
      title: CHARACTER_SECTION_LABELS.connections,
      items: [...organizationItems, ...locationItems],
      emptyText: CHARACTER_EMPTY_SECTION_TEXT.connections,
    },
    narrative: source.narrative,
  }
}
