import { resolveMonsterCreateDefaultValues, type MonsterFormValues } from './monster-form-values'

/**
 * Test/story fixture builder. Normalization and Zod parse enforce real section shapes at save.
 */
export function monsterFormTestValues(
  overrides: Partial<MonsterFormValues> & Pick<MonsterFormValues, 'name'>,
): MonsterFormValues {
  return structuredClone({
    ...resolveMonsterCreateDefaultValues(),
    ...overrides,
  }) as MonsterFormValues
}
