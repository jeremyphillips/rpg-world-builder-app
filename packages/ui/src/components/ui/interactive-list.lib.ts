import type { IdentityRowSize } from './identity-row.variants'
import type { InteractiveListSize } from './interactive-list.variants'

/** Maps list row scale to identity typography (1:1 today; list owns geometry). */
export function identityRowSizeFromInteractiveListSize(
  size: InteractiveListSize = 'md',
): IdentityRowSize {
  return size
}
