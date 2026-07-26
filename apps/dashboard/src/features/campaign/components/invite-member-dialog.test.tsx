import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { expectNoAxeViolations } from '@rpg/ui/test-utils'

import { InviteMemberDialog } from './invite-member-dialog.client'

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
})

function renderDialog() {
  return render(
    <QueryClientProvider client={queryClient}>
      <InviteMemberDialog campaignId="camp_1" />
    </QueryClientProvider>,
  )
}

describe('InviteMemberDialog', () => {
  it('has no axe accessibility violations when open', async () => {
    const user = userEvent.setup()
    const { container } = renderDialog()

    await user.click(screen.getByRole('button', { name: 'Invite member' }))

    expect(screen.getByRole('heading', { name: 'Invite member' })).toBeInTheDocument()
    await expectNoAxeViolations(container)
  })
})
