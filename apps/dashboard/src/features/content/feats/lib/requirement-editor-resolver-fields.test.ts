import { formatFieldMessage } from '@rpg/contracts'
import { makeResolver, resolveNestedFieldErrorMessage } from '@rpg/ui/form'
import { assertFieldPathsRegistered } from '@rpg/ui/form/test-utils'
import { describe, expect, it } from 'vitest'

import { createFeatFormSchema } from './feat-form-fields'
import { requirementEditorValidationMessages } from './requirement-editor-form'
import { newRequirementGroup } from './requirement-editor-form-schema'
import { prerequisiteEditorResolverFields } from './requirement-editor-resolver-fields'

describe('prerequisiteEditorResolverFields', () => {
  it('registers nested prerequisite editor paths for tier-1 copy', () => {
    assertFieldPathsRegistered(prerequisiteEditorResolverFields())
  })

  it('does not error on match rule for a newly added condition set', async () => {
    const schema = createFeatFormSchema()
    const resolver = makeResolver(schema, prerequisiteEditorResolverFields())
    const result = await resolver(
      {
        name: 'Test Feat',
        category: 'general',
        prerequisiteEditor: {
          groups: [newRequirementGroup()],
        },
        repeatableAllowed: false,
      },
      undefined,
      { fields: {}, shouldUseNativeValidation: false },
    )

    expect(
      resolveNestedFieldErrorMessage(result.errors, 'prerequisiteEditor.groups.0.kind'),
    ).toBeUndefined()
    expect(
      formatFieldMessage(
        resolveNestedFieldErrorMessage(
          result.errors!,
          'prerequisiteEditor.groups.0.requirements.0.type',
        ) ?? '',
      ),
    ).toBe(formatFieldMessage(requirementEditorValidationMessages.conditionTypeRequired()))
  })

  it('resolves match rule message for invalid kind values', async () => {
    const schema = createFeatFormSchema()
    const resolver = makeResolver(schema, prerequisiteEditorResolverFields())
    const result = await resolver(
      {
        name: 'Test Feat',
        category: 'general',
        prerequisiteEditor: {
          groups: [
            {
              ...newRequirementGroup(),
              kind: 'invalid' as 'all',
              requirements: [{ id: 'leaf-1', type: 'minLevel', level: 4 }],
            },
          ],
        },
        repeatableAllowed: false,
      },
      undefined,
      { fields: {}, shouldUseNativeValidation: false },
    )

    expect(result.errors).toBeDefined()
    expect(
      formatFieldMessage(
        resolveNestedFieldErrorMessage(result.errors!, 'prerequisiteEditor.groups.0.kind') ?? '',
      ),
    ).toBe('Choose a valid match rule.')
  })

  it('resolves condition type message through the feat resolver', async () => {
    const schema = createFeatFormSchema()
    const resolver = makeResolver(schema, prerequisiteEditorResolverFields())
    const result = await resolver(
      {
        name: 'Test Feat',
        category: 'general',
        prerequisiteEditor: {
          groups: [
            {
              ...newRequirementGroup(),
              requirements: [{ id: 'leaf-1' }],
            },
          ],
        },
        repeatableAllowed: false,
      },
      undefined,
      { fields: {}, shouldUseNativeValidation: false },
    )

    expect(result.errors).toBeDefined()
    expect(
      resolveNestedFieldErrorMessage(result.errors!, 'prerequisiteEditor.groups.0.kind'),
    ).toBeUndefined()
    expect(
      formatFieldMessage(
        resolveNestedFieldErrorMessage(
          result.errors!,
          'prerequisiteEditor.groups.0.requirements.0.type',
        ) ?? '',
      ),
    ).toBe(formatFieldMessage(requirementEditorValidationMessages.conditionTypeRequired()))
  })
})
