import type { FormItem } from '@rpg/ui/form'

import {
  resolveMonsterActionSectionFields,
  type MonsterActionDetailFieldsInput,
} from './section-composers'

/**
 * Detail body order: source, preview, advisory, primary prose, mechanics, supplemental prose.
 * Identity stays on the master-detail header.
 */
export function monsterActionDetailFields(input: MonsterActionDetailFieldsInput): FormItem[] {
  return resolveMonsterActionSectionFields(input)
}
