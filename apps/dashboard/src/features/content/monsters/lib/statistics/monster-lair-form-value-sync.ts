import type { FormValueSync } from '@rpg/ui/form'

/** Ensures the `lair` object exists when the switch is first enabled. */
export function buildMonsterLairFormValueSyncs(): FormValueSync[] {
  return [
    {
      dependsOn: ['lair.enabled'],
      apply: (values, changedKeys) => {
        if (!changedKeys.includes('lair.enabled')) return undefined
        const enabled = (values.lair as { enabled?: boolean } | undefined)?.enabled
        if (enabled === true && values.lair === undefined) {
          return { lair: { enabled: true } }
        }
        return undefined
      },
    },
  ]
}
