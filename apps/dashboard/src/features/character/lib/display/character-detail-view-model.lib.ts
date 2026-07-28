import type {
  Character,
  CharacterBuildCatalogIndex,
  CharacterProficiencies,
  Equipment,
  MovementMode,
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
  getCharacterTotalLevel,
  getMovementModeLabel,
  MOVEMENT_MODES,
  proficiencyBonus,
  resolveCharacterXpDisplay,
  resolveCreatureInitiativeModifier,
  resolveCreatureMovement,
  resolveTraitDisplay,
  resolveWeaponAttackAbilityModifier,
  toCharacterSheetDerivationInput,
  weaponAttackBonus,
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
import { formatContentReferenceLabel } from './format-content-reference-label'
import { resolveCharacterVitalStatusPresentation } from './character-vital-presentation'
import { formatCharacterSummary } from './character-summary.lib'

export type CharacterDisplayInput = {
  character: Character
  catalogIndex: CharacterBuildCatalogIndex
  rules: ResolvedCharacterCreationRules
  xpProgression: Pick<XpProgressionBody, 'entries'>
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
  character: Character,
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
  character: Character,
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

function buildProficiencyGroup(
  id: CharacterProficiencyGroupId,
  title: string,
  items: CharacterDetailListItem[],
): CharacterProficiencyGroup | undefined {
  if (items.length === 0) return undefined
  return { id, title, items }
}

function buildProficienciesSection(
  character: Character,
  catalogIndex: CharacterBuildCatalogIndex,
  rules: ResolvedCharacterCreationRules,
): CharacterProficienciesViewModel {
  const derivationInput = toCharacterSheetDerivationInput(character, catalogIndex, rules)
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
      character.proficiencies.languages.map((entry) => ({
        id: entry.language,
        label: resolveLanguagePreviewLabel(entry.language, catalogIndex),
      })),
    ),
    buildProficiencyGroup(
      'weapons',
      CHARACTER_PROFICIENCY_GROUP_LABELS.weapons,
      character.proficiencies.weapons.map((weapon, index) => ({
        id: weapon.weaponId ?? `${weapon.weaponCategory ?? 'weapon'}-${index}`,
        label: weapon.weaponId
          ? (catalogIndex.equipment.get(weapon.weaponId)?.name ??
            formatContentReferenceLabel(weapon.weaponId))
          : weapon.weaponCategory
            ? formatContentReferenceLabel(weapon.weaponCategory)
            : 'Weapon proficiency',
      })),
    ),
    buildProficiencyGroup(
      'tools',
      CHARACTER_PROFICIENCY_GROUP_LABELS.tools,
      character.proficiencies.tools.map((tool, index) => ({
        id: tool.toolId ?? `${tool.toolCategory ?? 'tool'}-${index}`,
        label: tool.toolId
          ? (catalogIndex.equipment.get(tool.toolId)?.name ??
            formatContentReferenceLabel(tool.toolId))
          : tool.toolCategory
            ? formatContentReferenceLabel(tool.toolCategory)
            : 'Tool proficiency',
      })),
    ),
    buildProficiencyGroup(
      'armor',
      CHARACTER_PROFICIENCY_GROUP_LABELS.armor,
      character.proficiencies.armor.map((armor, index) => ({
        id: `${armor.armorCategory}-${index}`,
        label: formatContentReferenceLabel(armor.armorCategory),
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
  character: Character,
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
  character: Character,
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

function buildFeatsSection(character: Character): CharacterDetailListSection {
  const items = character.feats.map((entry) => ({
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
  character: Character,
  catalogIndex: CharacterBuildCatalogIndex,
  rules: ResolvedCharacterCreationRules,
): CharacterDetailStatTile[] {
  const derivationInput = toCharacterSheetDerivationInput(character, catalogIndex, rules)
  const profile = deriveCharacterProfile(derivationInput)
  const species = catalogIndex.species.get(character.species.id)
  const speed = resolveSpeedStatTile(species)
  const initiative = resolveCreatureInitiativeModifier(character.abilityScores.dex)
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

function buildHitPoints(
  character: Character,
  catalogIndex: CharacterBuildCatalogIndex,
  rules: ResolvedCharacterCreationRules,
): CharacterHitPointsViewModel {
  const derivationInput = toCharacterSheetDerivationInput(character, catalogIndex, rules)
  const profile = deriveCharacterProfile(derivationInput)
  const maxHp = formatPreviewOptionalNumber(profile.maxHp ?? character.hitPoints.base)
  const temporary = character.hitPoints.temporary

  return {
    current: formatPreviewOptionalNumber(character.hitPoints.current ?? character.hitPoints.base),
    max: maxHp,
    temporary: temporary && temporary > 0 ? String(temporary) : '—',
  }
}

function buildAbilities(
  character: Character,
  catalogIndex: CharacterBuildCatalogIndex,
  rules: ResolvedCharacterCreationRules,
): CharacterAbilityTile[] {
  const derivationInput = toCharacterSheetDerivationInput(character, catalogIndex, rules)
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
  character: Character,
  xpProgression: Pick<XpProgressionBody, 'entries'>,
): string | null {
  const xp = resolveCharacterXpDisplay(character, xpProgression)
  return xp === null ? null : String(xp)
}

export function buildCharacterDetailViewModel({
  character,
  catalogIndex,
  rules,
  xpProgression,
}: CharacterDisplayInput): CharacterDetailViewModel {
  const level = getCharacterTotalLevel(character)

  return {
    id: character.id,
    identity: {
      name: character.name,
      summary: formatCharacterSummary(character, catalogIndex),
      xp: buildIdentityXp(character, xpProgression),
      vital: character.vital,
      vitalLabel: resolveCharacterVitalStatusPresentation(character.vital.status).label,
    },
    stats: buildStats(character, catalogIndex, rules),
    abilities: buildAbilities(character, catalogIndex, rules),
    hitPoints: buildHitPoints(character, catalogIndex, rules),
    actions: buildActionRows(character, catalogIndex, level),
    savingThrows: buildSavingThrowSection(character, catalogIndex, rules),
    proficiencies: buildProficienciesSection(character, catalogIndex, rules),
    spells: buildCharacterSheetSpellCards(character, catalogIndex),
    equipment: buildCharacterSheetEquipmentCards(character, catalogIndex),
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
