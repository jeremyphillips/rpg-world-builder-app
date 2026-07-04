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
    alignment: values.alignment,
  }
}
