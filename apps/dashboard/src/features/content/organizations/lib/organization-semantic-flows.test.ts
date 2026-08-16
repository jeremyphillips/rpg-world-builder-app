import { describe, expect, it } from 'vitest'
import {
  ORGANIZATION_AUTHORING_PRESET_IDS,
  ORGANIZATION_AUTHORING_PRESETS,
  resolveOrganizationMemberTitleSuggestions,
} from '@rpg/contracts'

import {
  buildOrganizationCreateInput,
  buildOrganizationFormValueSyncs,
  type OrganizationFormValues,
} from '../../lib/forms/organization-form-projection'

describe('initial Organization semantic flows', () => {
  it.each(ORGANIZATION_AUTHORING_PRESET_IDS)(
    'applies %s identically in standalone and embedded authoring',
    (presetId) => {
      const recipe = ORGANIZATION_AUTHORING_PRESETS[presetId]
      const standalone = buildOrganizationFormValueSyncs()[0]!.apply(
        { authoringPresetId: presetId },
        ['authoringPresetId'],
      )!
      const embedded = buildOrganizationFormValueSyncs('operatorOrganization')[0]!.apply(
        { 'operatorOrganization.authoringPresetId': presetId },
        ['operatorOrganization.authoringPresetId'],
      )!

      expect(embedded).toEqual(
        Object.fromEntries(
          Object.entries(standalone).map(([key, value]) => [`operatorOrganization.${key}`, value]),
        ),
      )

      const input = buildOrganizationCreateInput({
        name: recipe.label,
        organizationDomain: standalone.organizationDomain,
        organizationForm: standalone.organizationForm,
        activities: standalone.activities,
      } as OrganizationFormValues)
      expect(input).not.toHaveProperty('authoringPresetId')
      expect(
        resolveOrganizationMemberTitleSuggestions({
          domain: input.organizationDomain,
          form: input.organizationForm,
          activities: input.activities,
        }).length,
      ).toBeGreaterThanOrEqual(5)
    },
  )

  it('does not seed name when applying a familiar starting point', () => {
    const [sync] = buildOrganizationFormValueSyncs()
    const applied = sync?.apply({ name: 'Royal Navy', authoringPresetId: 'army' }, [
      'authoringPresetId',
    ])

    expect(applied).toEqual({
      authoringPresetId: undefined,
      organizationDomain: 'military',
      organizationForm: 'force',
      activities: ['warfare', 'defense'],
    })
    expect(applied).not.toHaveProperty('name')
  })

  it('reopens canonical Smuggling ring values without reconstructing preset identity', () => {
    const input = buildOrganizationCreateInput({
      name: 'Dockside Exchange',
      organizationDomain: 'criminal',
      organizationForm: 'network',
      activities: ['smuggling'],
    })
    expect(input).toMatchObject({
      organizationDomain: 'criminal',
      organizationForm: 'network',
      activities: ['smuggling'],
    })
    expect(input).not.toHaveProperty('type')
    expect(input).not.toHaveProperty('authoringPresetId')
  })
})
