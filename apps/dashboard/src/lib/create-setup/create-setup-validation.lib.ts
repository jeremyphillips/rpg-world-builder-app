import type { CreateSetupSet } from './create-setup.types'

export function assertCreateSetupSetsOnReset(sets: readonly CreateSetupSet[]): void {
  for (const set of sets) {
    if ((set.dependsOn?.length ?? 0) > 0 && set.onReset == null) {
      throw new Error(`Create setup set "${set.id}" has dependsOn but no onReset handler`)
    }
  }
}
