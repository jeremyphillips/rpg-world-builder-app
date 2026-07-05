import type { CharacterBuilderDraftIdentity } from '@rpg/contracts'

import type { IdentityFormValues } from './identity-form-fields'

export function identityDraftToFormValues(
  identity: CharacterBuilderDraftIdentity,
): IdentityFormValues {
  return {
    name: identity.name ?? '',
    description: identity.description,
    alignment: identity.alignment,
  }
}

export function identityFormValuesToDraft(
  values: IdentityFormValues,
): CharacterBuilderDraftIdentity {
  const description = values.description?.trim()

  return {
    name: values.name.trim(),
    description: description ? description : undefined,
    alignment: values.alignment || undefined,
  }
}

function identityDraftFingerprint(identity: CharacterBuilderDraftIdentity): string {
  const name = identity.name ?? ''
  const description = identity.description ?? ''
  const imageKey = identity.imageKey ?? ''
  const alignment = identity.alignment ?? ''
  return `${name}\0${description}\0${imageKey}\0${alignment}`
}

/** Compares normalized identity slices — avoids redundant draft writes during live sync. */
export function areIdentityDraftsEqual(
  left: CharacterBuilderDraftIdentity,
  right: CharacterBuilderDraftIdentity,
): boolean {
  return identityDraftFingerprint(left) === identityDraftFingerprint(right)
}
