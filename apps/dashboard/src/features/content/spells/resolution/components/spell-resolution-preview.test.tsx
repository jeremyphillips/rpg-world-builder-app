import { render, screen, waitFor } from '@testing-library/react'
import { Form } from '@rpg/ui/form'
import { z } from 'zod'
import { expectNoAxeViolations } from '@rpg/ui/test-utils'
import { describe, expect, it } from 'vitest'

import { SpellResolutionPreview } from './spell-resolution-preview.client'
import { RESOLUTION_FORM_FIXTURES } from '../lib/resolution-fixtures'
import { optionalResolutionFormSchema } from '../lib/resolution-form-schema'

const previewSchema = z.object({
  resolution: optionalResolutionFormSchema,
})

describe('SpellResolutionPreview', () => {
  it('renders aria-live preview for populated resolution', async () => {
    render(
      <Form
        schema={previewSchema}
        fields={[
          {
            kind: 'slot',
            name: '_resolutionPreview',
            render: () => <SpellResolutionPreview />,
          },
        ]}
        defaultValues={{ resolution: RESOLUTION_FORM_FIXTURES.inflictWounds }}
        onSubmit={() => undefined}
      />,
    )

    await waitFor(() => {
      expect(screen.getByText('Failed save: Full damage')).toBeInTheDocument()
    })

    expect(screen.getByRole('status')).toHaveAttribute('aria-live', 'polite')
  })

  it('has no axe accessibility violations', async () => {
    const { container } = render(
      <Form
        schema={previewSchema}
        fields={[
          {
            kind: 'slot',
            name: '_resolutionPreview',
            render: () => <SpellResolutionPreview />,
          },
        ]}
        defaultValues={{ resolution: RESOLUTION_FORM_FIXTURES.eldritchBlast }}
        onSubmit={() => undefined}
      />,
    )

    await waitFor(() => {
      expect(screen.getByText('Hit: Full damage')).toBeInTheDocument()
    })

    await expectNoAxeViolations(container)
  })
})
