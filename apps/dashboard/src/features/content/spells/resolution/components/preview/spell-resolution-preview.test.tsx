import { render, screen, waitFor } from '@testing-library/react'
import { Form } from '@rpg/ui/form'
import { z } from 'zod'
import { expectNoAxeViolations } from '@rpg/ui/test-utils'
import { describe, expect, it } from 'vitest'

import { RESOLUTION_FORM_FIXTURES } from '../../fixtures'
import { optionalResolutionFormSchema } from '../../lib/form/resolution-form-schema'
import { SpellResolutionPreview } from './spell-resolution-preview.client'

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
      expect(
        screen.getByText('Failed save: Target takes 2d10 necrotic damage.'),
      ).toBeInTheDocument()
    })

    expect(screen.getByRole('status')).toHaveAttribute('aria-live', 'polite')
  })

  it('renders additional behavior from chill touch note in preview', async () => {
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
        defaultValues={{ resolution: RESOLUTION_FORM_FIXTURES.chillTouch }}
        onSubmit={() => undefined}
      />,
    )

    await waitFor(() => {
      expect(screen.getByText(/can't regain Hit Points/i)).toBeInTheDocument()
    })
  })

  it('renders empty preview guidance when resolution is absent', () => {
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
        defaultValues={{ resolution: undefined }}
        onSubmit={() => undefined}
      />,
    )

    expect(screen.getByRole('status')).toHaveTextContent(/configure resolution/i)
  })

  it('has no axe accessibility violations with eldritch blast fixture', async () => {
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
      expect(screen.getByText('Hit: Target takes 1d10 force damage.')).toBeInTheDocument()
    })

    await expectNoAxeViolations(container)
  })

  it('has no axe accessibility violations with chill touch fixture', async () => {
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
        defaultValues={{ resolution: RESOLUTION_FORM_FIXTURES.chillTouch }}
        onSubmit={() => undefined}
      />,
    )

    await waitFor(() => {
      expect(screen.getByText(/can't regain Hit Points/i)).toBeInTheDocument()
    })

    await expectNoAxeViolations(container)
  })
})
