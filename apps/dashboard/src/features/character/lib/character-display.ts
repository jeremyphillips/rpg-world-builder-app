import {
  ABILITY_ENTRIES,
  ABILITY_IDS,
  deriveCharacterProfile,
  formatMovementDisplay,
  formatSignedModifier,
  formatWeaponDamageWithModifier,
  getCharacterTotalLevel,
  proficiencyBonus,
  resolveCharacterXpDisplay,
  resolveCreatureInitiativeModifier,
  resolveCreatureMovement,
  resolveTraitDisplay,
  resolveWeaponAttackAbilityModifier,
  toCharacterSheetDerivationInput,
  weaponAttackBonus,
  type Ability,
  type CharacterBuildCatalogIndex,
  type CharacterClassEntry,
  type CharacterEquipment,
  type CharacterEquipmentEntry,
  type CharacterNarrative,
  type CharacterProficiencies,
  type Equipment,
  type PcCharacter,
  type ResolvedCharacterCreationRules,
  type XpProgressionBody,
} from '@rpg/contracts'

import { resolveLanguagePreviewLabel } from './language-preview-label'
import {
  formatPreviewAbilityCell,
  formatPreviewOptionalNumber,
  formatPreviewSignedNumber,
} from './character-builder-preview-panel.lib'

export const CHARACTER_STAT_LABELS = {
  armorClass: 'AC',
  initiative: 'Initiative',
  speed: 'Speed',
  proficiencyBonus: 'Proficiency bonus',
  hitPoints: 'HP',
  experience: 'XP',
} as const

export const CHARACTER_SECTION_LABELS = {
  abilities: 'Abilities',
  actions: 'Actions',
  savingThrows: 'Saving throws',
  proficiencies: 'Proficiencies',
  spells: 'Spells',
  equipment: 'Equipment',
  wealth: 'Wealth',
  classFeatures: 'Class features',
  speciesTraits: 'Species traits',
  feats: 'Feats',
  narrative: 'Narrative',
} as const

export const CHARACTER_EMPTY_SECTION_TEXT = {
  actions: 'No weapon attacks to show.',
  savingThrows: 'No proficient saving throws.',
  proficiencies: 'No proficiencies recorded.',
  spells: 'No spells known.',
  equipment: 'No equipment carried.',
  classFeatures: 'No class features at this level.',
  speciesTraits: 'No species traits.',
  feats: 'No feats.',
} as const

export type CharacterCardViewModel = {
  id: string
  name: string
  summary: string
}

export type CharacterDetailStatRow = {
  label: string
  value: string
}

export type CharacterAbilityViewModel = {
  id: Ability
  label: string
  display: string
}

export type CharacterActionRowViewModel = {
  id: string
  name: string
  attackBonus: string
  damage: string
}

export type CharacterDetailListItem = {
  id: string
  label: string
  detail?: string
}

export type CharacterDetailListSection = {
  title: string
  items: CharacterDetailListItem[]
  emptyText: string
}

export type CharacterDetailViewModel = {
  id: string
  identity: {
    name: string
    summary: string
  }
  stats: CharacterDetailStatRow[]
  abilities: CharacterAbilityViewModel[]
  actions: CharacterActionRowViewModel[]
  savingThrows: CharacterDetailListSection
  proficiencies: CharacterDetailListSection
  spells: CharacterDetailListSection
  equipment: CharacterDetailListSection
  wealth: CharacterDetailStatRow
  classFeatures: CharacterDetailListSection
  speciesTraits: CharacterDetailListSection
  feats: CharacterDetailListSection
  narrative: CharacterNarrative | undefined
}

export type CharacterDisplayInput = {
  character: PcCharacter
  catalogIndex: CharacterBuildCatalogIndex
  rules: ResolvedCharacterCreationRules
  xpProgression: Pick<XpProgressionBody, 'entries'>
}

function formatContentIdLabel(id: string): string {
  const slug = id.includes(':') ? (id.split(':').pop() ?? id) : id
  return slug
    .split('-')
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(' ')
}

function resolveHeritageName(
  catalogIndex: CharacterBuildCatalogIndex,
  character: PcCharacter,
): string | undefined {
  const heritageId = character.species.heritageId
  if (!heritageId) return undefined

  const species = catalogIndex.species.get(character.species.id)
  const heritageOption = species?.heritage?.options.find((option) => option.id === heritageId)
  return heritageOption
    ? resolveTraitDisplay(heritageOption).name
    : formatContentIdLabel(heritageId)
}

function resolveClassName(catalogIndex: CharacterBuildCatalogIndex, classId: string): string {
  return catalogIndex.classes.get(classId)?.name ?? formatContentIdLabel(classId)
}

function resolveSubclassLabel(subclassId: string | undefined): string | undefined {
  if (!subclassId) return undefined
  return formatContentIdLabel(subclassId)
}

function formatSingleClassSegment(
  entry: CharacterClassEntry,
  catalogIndex: CharacterBuildCatalogIndex,
): string {
  const className = resolveClassName(catalogIndex, entry.classId)
  const subclassLabel = resolveSubclassLabel(entry.subclassId)
  return subclassLabel ? `${className} (${subclassLabel})` : className
}

function formatMulticlassSegment(
  entry: CharacterClassEntry,
  catalogIndex: CharacterBuildCatalogIndex,
): string {
  const className = resolveClassName(catalogIndex, entry.classId)
  const subclassLabel = resolveSubclassLabel(entry.subclassId)
  const subclassPart = subclassLabel ? ` (${subclassLabel})` : ''
  return `${className} ${entry.level}${subclassPart}`
}

export function formatCharacterSummary(
  character: PcCharacter,
  catalogIndex: CharacterBuildCatalogIndex,
): string {
  const species = catalogIndex.species.get(character.species.id)
  const speciesName = species?.name ?? formatContentIdLabel(character.species.id)
  const heritageName = resolveHeritageName(catalogIndex, character)
  const speciesPart = heritageName ? `${speciesName} (${heritageName})` : speciesName
  const totalLevel = getCharacterTotalLevel(character)

  const classPart =
    character.classes.length === 1
      ? formatSingleClassSegment(character.classes[0]!, catalogIndex)
      : character.classes.map((entry) => formatMulticlassSegment(entry, catalogIndex)).join(' / ')

  return `${speciesPart} · Level ${totalLevel} ${classPart}`
}

export function buildCharacterCardViewModel(
  character: PcCharacter,
  catalogIndex: CharacterBuildCatalogIndex,
): CharacterCardViewModel {
  return {
    id: character.id,
    name: character.name,
    summary: formatCharacterSummary(character, catalogIndex),
  }
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

function resolveEquipmentEntryLabel(
  entry: CharacterEquipmentEntry,
  catalogIndex: CharacterBuildCatalogIndex,
): string {
  const equipment = catalogIndex.equipment.get(entry.equipmentId)
  const baseName = entry.customName ?? equipment?.name ?? formatContentIdLabel(entry.equipmentId)
  return entry.quantity > 1 ? `${baseName} ×${entry.quantity}` : baseName
}

function collectEquipmentEntries(
  equipment: CharacterEquipment,
  catalogIndex: CharacterBuildCatalogIndex,
): CharacterDetailListItem[] {
  const buckets = [
    equipment.weapons,
    equipment.armor,
    equipment.tools,
    equipment.gear,
    equipment.magicItems,
    equipment.vehicles,
    equipment.mounts,
  ] as const

  return buckets.flatMap((entries) =>
    entries.map((entry) => ({
      id: entry.entryId ?? entry.equipmentId,
      label: resolveEquipmentEntryLabel(entry, catalogIndex),
      detail: entry.equipped ? 'Equipped' : undefined,
    })),
  )
}

function buildActionRows(
  character: PcCharacter,
  catalogIndex: CharacterBuildCatalogIndex,
  level: number,
): CharacterActionRowViewModel[] {
  const profBonus = proficiencyBonus(level)
  const rows: CharacterActionRowViewModel[] = []

  for (const entry of character.equipment.weapons) {
    const equipment = catalogIndex.equipment.get(entry.equipmentId)
    if (!equipment || equipment.kind !== 'weapon' || !equipment.damage) continue

    const abilityMod = resolveWeaponAttackAbilityModifier(equipment, character.abilityScores)
    if (abilityMod === undefined) continue

    const isProficient = isCharacterProficientWithWeapon(character.proficiencies, equipment)
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
  character: PcCharacter,
  catalogIndex: CharacterBuildCatalogIndex,
  rules: ResolvedCharacterCreationRules,
): CharacterDetailListSection {
  const derivationInput = toCharacterSheetDerivationInput(character, catalogIndex, rules)
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

function buildProficienciesSection(
  character: PcCharacter,
  catalogIndex: CharacterBuildCatalogIndex,
  rules: ResolvedCharacterCreationRules,
): CharacterDetailListSection {
  const derivationInput = toCharacterSheetDerivationInput(character, catalogIndex, rules)
  const profile = deriveCharacterProfile(derivationInput)

  const items: CharacterDetailListItem[] = [
    ...profile.skills
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
    ...character.proficiencies.languages.map((entry) => ({
      id: entry.language,
      label: resolveLanguagePreviewLabel(entry.language, catalogIndex),
    })),
    ...character.proficiencies.tools.map((tool, index) => ({
      id: tool.toolId ?? `${tool.toolCategory ?? 'tool'}-${index}`,
      label: tool.toolId
        ? (catalogIndex.equipment.get(tool.toolId)?.name ?? formatContentIdLabel(tool.toolId))
        : tool.toolCategory
          ? formatContentIdLabel(tool.toolCategory)
          : 'Tool proficiency',
    })),
    ...character.proficiencies.weapons.map((weapon, index) => ({
      id: weapon.weaponId ?? `${weapon.weaponCategory ?? 'weapon'}-${index}`,
      label: weapon.weaponId
        ? (catalogIndex.equipment.get(weapon.weaponId)?.name ??
          formatContentIdLabel(weapon.weaponId))
        : weapon.weaponCategory
          ? formatContentIdLabel(weapon.weaponCategory)
          : 'Weapon proficiency',
    })),
    ...character.proficiencies.armor.map((armor, index) => ({
      id: `${armor.armorCategory}-${index}`,
      label: formatContentIdLabel(armor.armorCategory),
    })),
  ]

  return {
    title: CHARACTER_SECTION_LABELS.proficiencies,
    items,
    emptyText: CHARACTER_EMPTY_SECTION_TEXT.proficiencies,
  }
}

function buildSpellsSection(
  character: PcCharacter,
  catalogIndex: CharacterBuildCatalogIndex,
): CharacterDetailListSection {
  const items = character.spells.map((entry) => ({
    id: entry.spellId,
    label: catalogIndex.spells.get(entry.spellId)?.name ?? formatContentIdLabel(entry.spellId),
    detail: entry.selection?.prepared ? 'Prepared' : undefined,
  }))

  return {
    title: CHARACTER_SECTION_LABELS.spells,
    items,
    emptyText: CHARACTER_EMPTY_SECTION_TEXT.spells,
  }
}

function buildClassFeaturesSection(
  character: PcCharacter,
  catalogIndex: CharacterBuildCatalogIndex,
): CharacterDetailListSection {
  const items: CharacterDetailListItem[] = []

  for (const classEntry of character.classes) {
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
  character: PcCharacter,
  catalogIndex: CharacterBuildCatalogIndex,
): CharacterDetailListSection {
  const species = catalogIndex.species.get(character.species.id)
  if (!species) {
    return {
      title: CHARACTER_SECTION_LABELS.speciesTraits,
      items: [],
      emptyText: CHARACTER_EMPTY_SECTION_TEXT.speciesTraits,
    }
  }

  const traits = [...species.traits]
  const heritageOption = species.heritage?.options.find(
    (option) => option.id === character.species.heritageId,
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

function buildFeatsSection(character: PcCharacter): CharacterDetailListSection {
  const items = character.feats.map((entry) => ({
    id: entry.featId,
    label: formatContentIdLabel(entry.featId),
    detail: entry.notes,
  }))

  return {
    title: CHARACTER_SECTION_LABELS.feats,
    items,
    emptyText: CHARACTER_EMPTY_SECTION_TEXT.feats,
  }
}

function buildStats(
  character: PcCharacter,
  catalogIndex: CharacterBuildCatalogIndex,
  rules: ResolvedCharacterCreationRules,
  xpProgression: Pick<XpProgressionBody, 'entries'>,
): CharacterDetailStatRow[] {
  const derivationInput = toCharacterSheetDerivationInput(character, catalogIndex, rules)
  const profile = deriveCharacterProfile(derivationInput)
  const species = catalogIndex.species.get(character.species.id)
  const speed = species ? formatMovementDisplay(resolveCreatureMovement(species)) : '—'
  const initiative = resolveCreatureInitiativeModifier(character.abilityScores.dex)
  const xp = resolveCharacterXpDisplay(character, xpProgression)

  return [
    {
      label: CHARACTER_STAT_LABELS.armorClass,
      value: formatPreviewOptionalNumber(profile.ac),
    },
    {
      label: CHARACTER_STAT_LABELS.initiative,
      value: formatPreviewSignedNumber(initiative),
    },
    {
      label: CHARACTER_STAT_LABELS.speed,
      value: speed,
    },
    {
      label: CHARACTER_STAT_LABELS.proficiencyBonus,
      value: formatPreviewOptionalNumber(profile.proficiencyBonus, '+'),
    },
    {
      label: CHARACTER_STAT_LABELS.hitPoints,
      value: `${character.hitPoints.current ?? character.hitPoints.base}/${formatPreviewOptionalNumber(profile.maxHp ?? character.hitPoints.base)}`,
    },
    {
      label: CHARACTER_STAT_LABELS.experience,
      value: String(xp),
    },
  ]
}

function buildAbilities(
  character: PcCharacter,
  catalogIndex: CharacterBuildCatalogIndex,
  rules: ResolvedCharacterCreationRules,
): CharacterAbilityViewModel[] {
  const derivationInput = toCharacterSheetDerivationInput(character, catalogIndex, rules)
  const profile = deriveCharacterProfile(derivationInput)

  return ABILITY_IDS.map((ability) => {
    const entry = profile.abilityScores[ability]
    return {
      id: ability,
      label: ABILITY_ENTRIES[ability].label,
      display: formatPreviewAbilityCell(entry?.score, entry?.modifier),
    }
  })
}

export function buildCharacterDetailViewModel({
  character,
  catalogIndex,
  rules,
  xpProgression,
}: CharacterDisplayInput): CharacterDetailViewModel {
  const level = getCharacterTotalLevel(character)
  const equipmentItems = collectEquipmentEntries(character.equipment, catalogIndex)

  return {
    id: character.id,
    identity: {
      name: character.name,
      summary: formatCharacterSummary(character, catalogIndex),
    },
    stats: buildStats(character, catalogIndex, rules, xpProgression),
    abilities: buildAbilities(character, catalogIndex, rules),
    actions: buildActionRows(character, catalogIndex, level),
    savingThrows: buildSavingThrowSection(character, catalogIndex, rules),
    proficiencies: buildProficienciesSection(character, catalogIndex, rules),
    spells: buildSpellsSection(character, catalogIndex),
    equipment: {
      title: CHARACTER_SECTION_LABELS.equipment,
      items: equipmentItems,
      emptyText: CHARACTER_EMPTY_SECTION_TEXT.equipment,
    },
    wealth: {
      label: CHARACTER_SECTION_LABELS.wealth,
      value: `${character.wealth.gp} gp`,
    },
    classFeatures: buildClassFeaturesSection(character, catalogIndex),
    speciesTraits: buildSpeciesTraitsSection(character, catalogIndex),
    feats: buildFeatsSection(character),
    narrative: character.narrative,
  }
}
