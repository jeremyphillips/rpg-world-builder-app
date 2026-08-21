import { describe, expect, it } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useEffect } from 'react'
import { useFormContext } from 'react-hook-form'
import { z } from 'zod'
import { Form } from '@rpg/ui/form'

import {
  OrganizationAuthoringProvider,
  useOrganizationAuthoringContext,
} from './organization-authoring-context.client'
import { OrganizationAuthoringPresetBridge } from './organization-authoring-preset-bridge.client'
import { buildOrganizationFormValueSyncs } from '../../../lib/forms/organization-form-projection'

const schema = z.object({
  name: z.string(),
  organizationDomain: z.string().optional(),
  authoringPresetId: z.string().optional(),
  practices: z.array(z.string()).default([]),
})

function RecommendationProbe({ onChange }: { onChange: (ids: readonly string[]) => void }) {
  const { practiceRecommendations } = useOrganizationAuthoringContext()
  useEffect(() => {
    onChange(practiceRecommendations)
  }, [onChange, practiceRecommendations])
  return null
}

function BridgeHarness({
  onRecommendationsChange,
}: {
  onRecommendationsChange: (ids: readonly string[]) => void
}) {
  const form = useFormContext()

  return (
    <>
      <OrganizationAuthoringPresetBridge />
      <RecommendationProbe onChange={onRecommendationsChange} />
      <button type="button" onClick={() => form.setValue('authoringPresetId', 'thieves_guild')}>
        Pick thieves guild
      </button>
      <button type="button" onClick={() => form.setValue('authoringPresetId', 'protection_racket')}>
        Pick protection racket
      </button>
      <button type="button" onClick={() => form.setValue('practices', [], { shouldDirty: true })}>
        Clear practices
      </button>
    </>
  )
}

function renderHarness() {
  const recommendations: string[][] = []

  render(
    <OrganizationAuthoringProvider>
      <Form
        schema={schema}
        fields={[
          { type: 'text', name: 'name', label: 'Name' },
          { type: 'text', name: 'authoringPresetId', label: 'Preset' },
          { type: 'text', name: 'practices', label: 'Practices' },
        ]}
        defaultValues={{ name: 'Test', practices: [] }}
        valueSyncs={buildOrganizationFormValueSyncs()}
        onSubmit={() => undefined}
        header={() => (
          <BridgeHarness
            onRecommendationsChange={(ids) => {
              recommendations.push([...ids])
            }}
          />
        )}
      />
    </OrganizationAuthoringProvider>,
  )

  return { recommendations }
}

describe('OrganizationAuthoringPresetBridge', () => {
  it('sets recommendations on positive preset selection', async () => {
    const user = userEvent.setup()
    const harness = renderHarness()

    await user.click(screen.getByRole('button', { name: 'Pick thieves guild' }))

    await waitFor(() => {
      expect(harness.recommendations.at(-1)).toEqual([
        'fencing',
        'extortion',
        'smuggling',
        'investigation',
      ])
    })
  })

  it('does not clear recommendations when value sync clears authoringPresetId', async () => {
    const user = userEvent.setup()
    const harness = renderHarness()

    await user.click(screen.getByRole('button', { name: 'Pick thieves guild' }))

    await waitFor(() => {
      expect(harness.recommendations.at(-1)).toEqual([
        'fencing',
        'extortion',
        'smuggling',
        'investigation',
      ])
    })

    await waitFor(() => {
      expect(harness.recommendations.at(-1)).toEqual([
        'fencing',
        'extortion',
        'smuggling',
        'investigation',
      ])
    })
  })

  it('keeps recommendations when projected practices are removed', async () => {
    const user = userEvent.setup()
    const harness = renderHarness()

    await user.click(screen.getByRole('button', { name: 'Pick thieves guild' }))
    await waitFor(() => {
      expect(harness.recommendations.at(-1)?.length).toBeGreaterThan(0)
    })

    await user.click(screen.getByRole('button', { name: 'Clear practices' }))

    await waitFor(() => {
      expect(harness.recommendations.at(-1)).toEqual([
        'fencing',
        'extortion',
        'smuggling',
        'investigation',
      ])
    })
  })

  it('replaces recommendations when a different preset is selected positively', async () => {
    const user = userEvent.setup()
    const harness = renderHarness()

    await user.click(screen.getByRole('button', { name: 'Pick thieves guild' }))
    await waitFor(() => {
      expect(harness.recommendations.at(-1)).toEqual([
        'fencing',
        'extortion',
        'smuggling',
        'investigation',
      ])
    })

    await user.click(screen.getByRole('button', { name: 'Pick protection racket' }))

    await waitFor(() => {
      expect(harness.recommendations.at(-1)).toEqual(['theft', 'fencing', 'gambling'])
    })
  })
})
