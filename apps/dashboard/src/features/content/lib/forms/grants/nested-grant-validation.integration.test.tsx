import { Form, makeResolver, prepareFormIssues } from '@rpg/ui/form'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useEffect } from 'react'
import { useFormContext } from 'react-hook-form'
import { describe, expect, it, vi } from 'vitest'
import { z } from 'zod'

import {
  startingEquipmentOptionFormSchema,
  startingEquipmentOptionItemFields,
} from '@/features/content/classes/lib/character-creation/class-starting-equipment-form-fields'
import { subclassFeatureItemFields } from '@/features/content/classes/lib/class-feature-form-fields'
import {
  buildSubclassFields,
  subclassFormSchema,
} from '@/features/content/classes/lib/subclasses/subclass-form-fields'
import { makeContentFormCtx } from '@/features/content/lib/fixtures/content-form-ctx'
import { heritageOptionItemFields } from '@/features/content/species/lib/species-trait-form-fields'
import { heritageDraftFormSchema } from '@/features/content/species/lib/species-heritage-form-fields'
import { traitItemFields } from '@/features/content/species/lib/species-trait-form-fields'

import { GRANT_TYPE_LABELS, grantRowFormSchema } from './grant-form-schema'

const formValuesCapture = vi.hoisted(() => ({
  read: undefined as (() => unknown) | undefined,
}))

function CaptureFormValues() {
  const { getValues } = useFormContext()

  useEffect(() => {
    formValuesCapture.read = getValues
  }, [getValues])

  return null
}

const ctx = makeContentFormCtx()

const speciesTraitGrantSchema = z.object({
  traits: z.array(
    z.object({
      kind: z.literal('grant'),
      overrideDisplay: z.boolean().optional(),
      grants: z.array(grantRowFormSchema),
    }),
  ),
})

const classFeatureGrantSchema = z.object({
  features: z.array(
    z.object({
      level: z.coerce.number(),
      name: z.string(),
      grants: z.array(grantRowFormSchema),
    }),
  ),
})

const heritageGrantSchema = heritageDraftFormSchema

const startingEquipmentGrantSchema = z.object({
  options: z.array(startingEquipmentOptionFormSchema),
})

const weaponGrantDefaults = {
  grantType: 'weaponProficiency',
  proficiencySource: 'specific',
  weaponProficiencySlugs: [],
}

const movementGrantDefaults = {
  grantType: 'movement',
  movementMode: 'walk',
  movementOperation: 'increase',
}

describe('nested grant validation integration', () => {
  it('species trait grants surface weapon and movement issues without hidden enum noise', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()

    render(
      <Form
        schema={speciesTraitGrantSchema}
        fields={[
          {
            kind: 'array',
            name: 'traits',
            fields: traitItemFields(ctx),
          },
        ]}
        defaultValues={{
          traits: [
            {
              kind: 'grant',
              grants: [weaponGrantDefaults, movementGrantDefaults],
            },
          ],
        }}
        onSubmit={onSubmit}
        footer={<button type="submit">Save</button>}
      />,
    )

    await user.click(screen.getByRole('button', { name: 'Save' }))

    await waitFor(() => {
      expect(screen.getByRole('combobox', { name: 'Weapons' })).toHaveAttribute(
        'aria-invalid',
        'true',
      )
    })

    const form = screen.getByRole('button', { name: 'Save' }).closest('form')
    expect(form).toBeTruthy()

    const issues = prepareFormIssues(
      (
        await makeResolver(speciesTraitGrantSchema, [
          { kind: 'array', name: 'traits', fields: traitItemFields(ctx) },
        ])(
          {
            traits: [
              {
                kind: 'grant',
                grants: [weaponGrantDefaults, movementGrantDefaults],
              },
            ],
          },
          undefined,
          { fields: {}, shouldUseNativeValidation: false },
        )
      ).errors,
      [{ kind: 'array', name: 'traits', fields: traitItemFields(ctx) }],
    )

    const presentationPaths = issues.map((issue) => issue.presentationPath ?? issue.path)
    expect(presentationPaths).toContain('traits.0.grants.0.weaponProficiencySlugs')
    expect(presentationPaths).toContain('traits.0.grants.1.movementFeet')
    expect(presentationPaths.some((path) => path.includes('language'))).toBe(false)
    expect(presentationPaths.some((path) => path.includes('senseType'))).toBe(false)
    expect(presentationPaths.some((path) => path.includes('spellAbility'))).toBe(false)
  })

  it('class feature grants surface validation on nested grant controls', async () => {
    const user = userEvent.setup()

    render(
      <Form
        schema={classFeatureGrantSchema}
        fields={[
          {
            kind: 'array',
            name: 'features',
            fields: subclassFeatureItemFields(ctx),
          },
        ]}
        defaultValues={{
          features: [
            {
              level: 1,
              name: 'Rage',
              grants: [weaponGrantDefaults],
            },
          ],
        }}
        onSubmit={vi.fn()}
        footer={<button type="submit">Save</button>}
      />,
    )

    await user.click(screen.getByRole('button', { name: 'Save' }))

    await waitFor(() => {
      expect(screen.getByRole('combobox', { name: 'Weapons' })).toHaveAttribute(
        'aria-invalid',
        'true',
      )
    })

    const issues = prepareFormIssues(
      (
        await makeResolver(classFeatureGrantSchema, [
          { kind: 'array', name: 'features', fields: subclassFeatureItemFields(ctx) },
        ])(
          {
            features: [{ level: 1, name: 'Rage', grants: [weaponGrantDefaults] }],
          },
          undefined,
          { fields: {}, shouldUseNativeValidation: false },
        )
      ).errors,
      [{ kind: 'array', name: 'features', fields: subclassFeatureItemFields(ctx) }],
    )

    expect(issues.map((issue) => issue.presentationPath ?? issue.path)).toContain(
      'features.0.grants.0.weaponProficiencySlugs',
    )
  })

  it('heritage option grants surface validation without hidden enum noise', async () => {
    const heritageFields = [
      {
        kind: 'array' as const,
        name: 'options',
        fields: heritageOptionItemFields(ctx),
      },
    ]

    const issues = prepareFormIssues(
      (
        await makeResolver(heritageGrantSchema, heritageFields)(
          {
            name: 'Elf',
            options: [
              {
                kind: 'custom',
                name: 'High Elf',
                grants: [weaponGrantDefaults, movementGrantDefaults],
              },
            ],
          },
          undefined,
          { fields: {}, shouldUseNativeValidation: false },
        )
      ).errors,
      heritageFields,
    )

    const presentationPaths = issues.map((issue) => issue.presentationPath ?? issue.path)
    expect(presentationPaths).toContain('options.0.grants.0.weaponProficiencySlugs')
    expect(presentationPaths).toContain('options.0.grants.1.movementFeet')
    expect(presentationPaths.some((path) => path.includes('language'))).toBe(false)
    expect(presentationPaths.some((path) => path.includes('senseType'))).toBe(false)
    expect(presentationPaths.some((path) => path.includes('spellAbility'))).toBe(false)
  })

  it('starting equipment item grants surface combobox validation on presentation paths', async () => {
    const user = userEvent.setup()
    const optionFields = [
      {
        kind: 'array' as const,
        name: 'options',
        fields: startingEquipmentOptionItemFields(ctx),
      },
    ]
    const invalidOption = {
      label: 'Standard',
      items: [
        {
          itemKind: 'choice',
          choose: 1,
          poolSource: 'explicit',
          poolEquipmentSlugs: [],
        },
      ],
    }

    render(
      <Form
        schema={startingEquipmentGrantSchema}
        fields={optionFields}
        defaultValues={{ options: [invalidOption] }}
        onSubmit={vi.fn()}
        footer={<button type="submit">Save</button>}
      />,
    )

    await user.click(screen.getByRole('button', { name: 'Save' }))

    await waitFor(() => {
      expect(screen.getByRole('combobox', { name: /equipment/i })).toHaveAttribute(
        'aria-invalid',
        'true',
      )
    })

    const issues = prepareFormIssues(
      (
        await makeResolver(startingEquipmentGrantSchema, optionFields)(
          { options: [invalidOption] },
          undefined,
          { fields: {}, shouldUseNativeValidation: false },
        )
      ).errors,
      optionFields,
    )

    expect(issues.map((issue) => issue.presentationPath ?? issue.path)).toContain(
      'options.0.items.0.poolEquipmentSlugs',
    )
  })

  it('subclass add feature then add grant keeps JSON-serializable schema-shaped values', async () => {
    const user = userEvent.setup()

    render(
      <Form
        schema={subclassFormSchema}
        fields={buildSubclassFields(ctx)}
        defaultValues={subclassFormSchema.parse({ name: 'Berserker', features: [] })}
        onSubmit={vi.fn()}
        footer={
          <>
            <CaptureFormValues />
            <button type="submit">Save</button>
          </>
        }
      />,
    )

    await user.click(screen.getByRole('button', { name: 'Add feature' }))
    await user.click(screen.getByRole('button', { name: 'Add grant' }))
    await user.type(
      screen.getByRole('searchbox', { name: 'Search Add grant' }),
      'weapon proficiency',
    )
    await user.click(screen.getByRole('option', { name: GRANT_TYPE_LABELS.weaponProficiency }))

    await waitFor(() => {
      expect(formValuesCapture.read?.()).toBeDefined()
    })

    const latestValues = formValuesCapture.read?.()
    expect(() => JSON.stringify(latestValues)).not.toThrow()

    const values = latestValues as {
      features: Array<{ grants: Array<Record<string, unknown>> }>
    }
    expect(values.features).toHaveLength(1)
    expect(values.features[0]?.grants).toHaveLength(1)
    expect(values.features[0]?.grants[0]).toMatchObject({
      grantType: 'weaponProficiency',
      proficiencySource: 'specific',
    })
    expect(values.features[0]?.grants[0]).not.toHaveProperty('nativeEvent')
  })
})
