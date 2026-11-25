import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'

import { pickClass, pickSkillProficiency } from '../../lib/fixtures/pick'
import { classFormDef } from './class-form-def'
import type { ClassFormValues } from './class-form-fields'
import { ClassPreviewPlayerHost } from './class-preview-player-host'
import { classCreateDefaultValues } from './class-form-values'

vi.mock('@/features/campaign', () => ({
  useCampaignRules: () => ({ subclassing: { enabled: false } }),
  useCanManageCampaign: () => false,
}))

vi.mock('../hooks/use-subclasses', async (importOriginal) => ({
  ...(await importOriginal()),
  useSubclasses: () => ({ data: [], isPending: false, isLoadingError: false }),
}))

describe('ClassPreviewPlayerHost', () => {
  it.each([
    ['ready', 'Athletics for This Campaign'],
    ['pending', 'Loading…'],
    ['error', 'Could not load skill proficiencies.'],
  ] as const)('uses the authoring skill catalog when it is %s', (skillCatalogStatus, label) => {
    const skill = { ...pickSkillProficiency('athletics'), name: 'Athletics for This Campaign' }
    const values = {
      ...classCreateDefaultValues,
      ...classFormDef.toFormValues(pickClass('fighter')),
    } as ClassFormValues

    render(
      <MemoryRouter>
        <ClassPreviewPlayerHost
          values={values}
          ctx={{ skillCatalogStatus, skillCatalogBySlug: new Map([[skill.slug, skill]]) }}
          open
          onOpenChange={vi.fn()}
        />
      </MemoryRouter>,
    )

    expect(screen.getByText(label)).toBeInTheDocument()
    if (skillCatalogStatus !== 'ready') expect(screen.queryByText(skill.name)).toBeNull()
  })
})
