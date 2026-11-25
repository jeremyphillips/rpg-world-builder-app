import type { SchemaFact } from './schema-tree'
import type { CollectionDecision } from './policy'

/**
 * Explicit collection classes. A new array or unsupported node fails coverage
 * until it is named here. Scalar fields are not collections and are not listed.
 *
 * `restore` matches the editor lock: seed rows of that collection cannot be
 * deleted. `delete` means the editor already allows removing seed rows.
 */
const RESTORE_SEGMENTS = new Set([
  'traits',
  'actions',
  'bonusActions',
  'reactions',
  'features',
  'options',
  'effects',
  'grants',
  'choices',
  'items',
])

const DELETE_SEGMENTS = new Set([
  'equipment',
  'sections',
  'tables',
  'columns',
  'rows',
  'definedForms',
  'images',
])

const ORDERED_VALUE_SEGMENTS = new Set([
  'examples',
  'steps',
  'outcomes',
  'effects',
  'grantGroups',
  'tracks',
  'entries',
  'recommendations',
  'rows',
])

const VALUE_SEGMENTS = new Set([
  ...ORDERED_VALUE_SEGMENTS,
  'actionIds',
  'onlyInFormIds',
  'modes',
  'properties',
  'omittedComponents',
  'spells',
  'standardActions',
  'categories',
  'items',
  'classIds',
  'sizes',
  'senses',
  'savingThrows',
  'skills',
  'languages',
  'weapons',
  'vulnerabilities',
  'resistances',
  'immunities',
  'conditionImmunities',
  'creatureFamilyIds',
  'languageAffinities',
  'primaryAbilities',
  'holySymbolUsage',
  'crafts',
  'utilizes',
  'tags',
  'damageTypes',
  'functions',
  'roles',
  'conditions',
  'requiredGear',
  'focusKinds',
  'recommendedGear',
  'spellIds',
  'equipmentSlugs',
  'toolSlugs',
  'toolCategories',
  'from',
  'modifiers',
  'adjustments',
  'magicProperties',
  'choices',
  'interruptedByDamageTypes',
  'ids',
  'conditionIds',
  'requirements',
  'occupantRequirements',
  'gaps',
  'abilityScoreOrder',
  'classLevelCaps',
  'essential',
  'strong',
  'participantIds',
])

const ATOMIC_SEGMENTS = new Set([
  'media',
  'movement',
  'speeds',
  'armorClass',
  'hitPoints',
  'communication',
  'faces',
  'reach',
  'feet',
  'limit',
  'hitDie',
  'prerequisite',
  'naming',
  'cells',
  'abilityScoreRequirements',
  'areaOfEffect',
  'presentation',
])

/** Whole-object replacement. Children are not overlay paths. */
export function isAtomicPath(path: string): boolean {
  return ATOMIC_SEGMENTS.has(lastSegment(path))
}

function lastSegment(path: string): string {
  return path.split('.').pop() ?? path
}

/** Classify one array or unsupported node. `undefined` means the path is not covered. */
export function collectionDecision(path: string, fact: SchemaFact): CollectionDecision | undefined {
  const segment = lastSegment(path)
  if (fact.type === 'unsupported') {
    return ATOMIC_SEGMENTS.has(segment) ? { kind: 'atomic' } : undefined
  }
  if (fact.type !== 'array') return undefined
  if (fact.idKey) {
    if (RESTORE_SEGMENTS.has(segment)) {
      return {
        kind: 'identity',
        idKey: fact.idKey,
        missingSeedRow: 'restore',
        order: 'authored',
      }
    }
    if (DELETE_SEGMENTS.has(segment)) {
      return {
        kind: 'identity',
        idKey: fact.idKey,
        missingSeedRow: 'delete',
        order: segment === 'images' ? 'immaterial' : 'authored',
      }
    }
    return undefined
  }
  if (!VALUE_SEGMENTS.has(segment)) return undefined
  return { kind: 'value-list', ordered: ORDERED_VALUE_SEGMENTS.has(segment) }
}
