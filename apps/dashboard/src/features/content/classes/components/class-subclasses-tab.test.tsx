import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { FormProvider, useForm } from 'react-hook-form'
import { MemoryRouter } from 'react-router-dom'
import { beforeAll, describe, expect, it, vi } from 'vitest'

const subclassesListResult = vi.hoisted(() =>
  vi.fn((_campaignId?: string, _classId?: string) => ({
    data: undefined as unknown,
    isPending: false,
    isError: false,
  })),
)

import { defaultCampaignRules } from '../../lib/form-options/content-campaign-rules'
import { makeQueryWrapper } from '@/test/make-wrapper'
import { SUBCLASSES_FOR_FIGHTER } from '../fixtures'
import { ClassSubclassesTab } from './class-subclasses-tab'

beforeAll(() => {
  if (!HTMLElement.prototype.hasPointerCapture) {
    HTMLElement.prototype.hasPointerCapture = () => false
    HTMLElement.prototype.setPointerCapture = () => undefined
    HTMLElement.prototype.releasePointerCapture = () => undefined
  }
  if (!Element.prototype.scrollIntoView) {
    Element.prototype.scrollIntoView = vi.fn()
  }
})

vi.mock('../hooks/use-subclasses', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../hooks/use-subclasses')>()
  return {
    ...actual,
    useSubclassesListResult: (campaignId?: string, classId?: string) =>
      subclassesListResult(campaignId, classId),
  }
})

vi.mock('../hooks/use-subclass-mutations', () => ({
  useCreateSubclass: () => ({
    mutateAsync: vi.fn().mockResolvedValue({ id: 'sub_new', name: 'Untitled subclass' }),
    isPending: false,
  }),
  useUpdateSubclass: () => ({
    mutateAsync: vi.fn().mockResolvedValue({ id: 'sub_existing', name: 'Updated' }),
    isPending: false,
  }),
  useDeleteSubclass: () => ({
    mutateAsync: vi.fn().mockResolvedValue({ status: 'deleted' }),
    isPending: false,
  }),
}))

const QueryWrapper = makeQueryWrapper()

function ClassFormShell({
  features = [
    {
      kind: 'subclass-choice',
      id: 'fighter-subclass',
      name: 'Fighter Subclass',
      level: 3,
      grants: [],
    },
  ],
  mode = 'edit' as const,
  formCtx = {},
  loadFromQuery = false,
}: {
  features?: Array<{ kind?: string; id: string; name: string; level: number; grants: never[] }>
  mode?: 'create' | 'edit'
  formCtx?: Record<string, unknown>
  loadFromQuery?: boolean
}) {
  const form = useForm({ defaultValues: { features } })
  return (
    <MemoryRouter>
      <QueryWrapper>
        <FormProvider {...form}>
          <ClassSubclassesTab
            campaignId="camp_1"
            classId="srd-cc-5.2.1:fighter"
            mode={mode}
            formCtx={formCtx}
            subclassesOverride={
              loadFromQuery || mode !== 'edit' ? undefined : SUBCLASSES_FOR_FIGHTER
            }
          />
        </FormProvider>
      </QueryWrapper>
    </MemoryRouter>
  )
}

describe('ClassSubclassesTab', () => {
  it('shows create-mode message when class is not saved', () => {
    render(<ClassFormShell mode="create" />)
    expect(screen.getByText(/Save this class first/i)).toBeInTheDocument()
  })

  it('gates authoring when the subclass choice feature is missing', () => {
    render(<ClassFormShell features={[]} />)
    expect(screen.getByText(/Features/i)).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /Add subclass/i })).not.toBeInTheDocument()
  })

  it('adds a draft subclass and selects it in the editor', async () => {
    const user = userEvent.setup()
    render(<ClassFormShell />)

    await user.click(screen.getByRole('button', { name: /Add subclass/i }))

    expect(screen.getAllByText('Untitled subclass').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Unsaved').length).toBeGreaterThan(0)
    expect(
      screen.getByRole('button', { name: /Actions for Untitled subclass/i }),
    ).toBeInTheDocument()
  })

  it('opens ConfirmDialog and removes a draft on confirm', async () => {
    const user = userEvent.setup()
    render(<ClassFormShell />)

    await user.click(screen.getByRole('button', { name: /Add subclass/i }))
    await user.click(screen.getByRole('button', { name: /Actions for Untitled subclass/i }))
    await user.click(screen.getByRole('menuitem', { name: /Delete subclass/i }))

    const confirmDialog = screen.getByRole('alertdialog')
    expect(confirmDialog).toBeInTheDocument()

    await user.click(within(confirmDialog).getByRole('button', { name: /^Delete$/ }))

    await waitFor(() => {
      expect(screen.queryByText('Untitled subclass')).not.toBeInTheDocument()
    })
  }, 15_000)

  it('shows a subclasses-disabled availability alert when subclassing is off', () => {
    render(
      <ClassFormShell
        formCtx={{
          campaignRules: {
            ...defaultCampaignRules(),
            subclassing: { enabled: false },
          },
        }}
      />,
    )

    expect(screen.getByText(/Subclass choices are disabled/i)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Enable subclasses' })).toHaveAttribute(
      'href',
      '/campaigns/camp_1/homebrew/rules-config/character-configuration#subclasses',
    )
    expect(screen.getByRole('button', { name: /Add subclass/i })).toBeInTheDocument()
  })

  it('lists an overlay failure, shows a blocking alert, and does not mount the editor', async () => {
    const user = userEvent.setup()
    const healthy = SUBCLASSES_FOR_FIGHTER[0]
    expect(healthy).toBeDefined()
    subclassesListResult.mockReturnValue({
      isPending: false,
      isError: false,
      data: {
        subclasses: healthy ? [healthy] : [],
        overlayFailures: [
          {
            targetId: 'srd:broken-champion',
            slug: 'broken-champion',
            name: 'Broken Champion',
            code: 'unsupported_overlay_version' as const,
            message: 'System overlay patch is missing a supported version.',
          },
        ],
      },
    })

    render(<ClassFormShell loadFromQuery />)

    expect(screen.getByRole('button', { name: /^Champion/ })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /Broken Champion/ }))

    expect(screen.getByRole('alert')).toHaveTextContent(
      'System overlay patch is missing a supported version.',
    )
    expect(screen.getByText('Overlay unresolved')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /^Save/i })).not.toBeInTheDocument()
  })
})
