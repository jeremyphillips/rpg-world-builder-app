import { Icon } from '../ui/icon/icon'
import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { PreviewRail } from './preview-rail.client'

describe('PreviewRail', () => {
  it('renders the mock composition stack', async () => {
    const user = userEvent.setup()

    render(
      <PreviewRail layout="fill">
        <PreviewRail.Header title="Class Preview" badge={<PreviewRail.DraftBadge />} />
        <PreviewRail.Identity
          media={<PreviewRail.Media fallbackIcon={<Icon name="book-open" size="2xl" />} />}
          name="Fighter"
          status={
            <PreviewRail.AvailabilityLine available statusLabel="Available" detail="All players" />
          }
        />
        <PreviewRail.ScrollRegion data-testid="preview-rail-scroll">
          <PreviewRail.Sections defaultValue="basics">
            <PreviewRail.Section
              id="basics"
              label="Basics"
              marker="ready"
              status="Ready"
              statusTone="success"
            >
              <PreviewRail.SectionBody
                description="A brief description will appear here once provided."
                facts={[
                  { label: 'Primary abilities', value: 'Strength' },
                  { label: 'Hit die', value: 'd8' },
                ]}
              />
            </PreviewRail.Section>
            <PreviewRail.Section
              id="spellcasting"
              label="Spellcasting"
              marker="off"
              status="Off"
              expandable={false}
            />
          </PreviewRail.Sections>
        </PreviewRail.ScrollRegion>
        <PreviewRail.Footer>
          <PreviewRail.StatusPanel
            variant="success"
            title="Ready to publish"
            description="Required configuration is complete."
          />
          <PreviewRail.Action
            label="Preview as player"
            helperText="See how this class will appear to players in your campaign."
            icon={<Icon name="eye" size="2xl" />}
          />
        </PreviewRail.Footer>
      </PreviewRail>,
    )

    expect(screen.getByRole('complementary')).toHaveClass(
      'flex-1',
      'min-h-0',
      'min-w-0',
      'w-full',
      'ui-panel',
      'ui-panel--quiet',
      'ui-panel--bleed',
      'ui-border--default',
    )
    expect(screen.getByRole('complementary')).not.toHaveClass(
      'border-border-subtle',
      'rounded-card',
    )
    expect(screen.getByRole('complementary').className).not.toContain('max-w-')
    expect(screen.getByTestId('preview-rail-scroll')).toHaveClass('overflow-y-auto')
    expect(screen.getByTestId('preview-rail-scroll').className).toContain('pe-2.5')
    expect(screen.getByRole('heading', { name: 'Class Preview' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Sections' })).toHaveClass(
      'eyebrow-style-sm',
      'text-foreground',
    )
    expect(screen.getByText('Draft')).toBeInTheDocument()
    expect(screen.getByText('Available')).toBeInTheDocument()
    expect(screen.getByText('All players')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Preview as player' })).toBeInTheDocument()

    const basicsTrigger = screen.getByRole('button', { name: /Basics/ })
    expect(basicsTrigger).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getByText('Ready')).toHaveClass('ui-preview-rail__section-status')
    expect(basicsTrigger.querySelector('.ui-status-icon--ready')).toBeInTheDocument()
    expect(
      screen
        .getByText('Spellcasting')
        .closest('.ui-preview-rail__accordion-item')
        ?.querySelector('.ui-status-icon--off'),
    ).toBeInTheDocument()
    expect(
      screen
        .getByText('Ready to publish')
        .closest('[role="alert"]')
        ?.querySelector('.ui-status-icon--ready.ui-status-icon--lg'),
    ).toBeInTheDocument()
    await user.click(basicsTrigger)
    expect(basicsTrigger).toHaveAttribute('aria-expanded', 'false')
  })

  it('leaves the perimeter to the host when chrome is plain', () => {
    render(
      <PreviewRail chrome="plain">
        <PreviewRail.Header title="Class Preview" />
      </PreviewRail>,
    )

    const rail = screen.getByRole('complementary')
    expect(rail).not.toHaveClass('ui-panel', 'ui-panel--quiet')
    expect(rail).toHaveClass('ui-preview-rail')
  })

  it('sizes preview identity media with the anatomy leading shell', () => {
    const { container } = render(
      <PreviewRail>
        <PreviewRail.Identity
          media={<PreviewRail.Media fallbackIcon={<Icon name="book-open" size="2xl" />} />}
          name="Fighter"
          status="Level 1"
        />
      </PreviewRail>,
    )

    expect(container.querySelector('[data-slot="preview-rail-leading-media"]')).toHaveClass(
      'ui-anatomy-leading-media',
    )
    expect(
      container.querySelector(
        '.ui-identity-row--comfortable [data-slot="preview-rail-leading-media"]',
      ),
    ).toBeTruthy()
  })

  it('omits the identity metadata divider when facts are absent', () => {
    const { container } = render(
      <PreviewRail>
        <PreviewRail.Identity
          media={<PreviewRail.Media fallbackIcon={<Icon name="book-open" size="2xl" />} />}
          name="Fighter"
          status={
            <PreviewRail.AvailabilityLine available statusLabel="Available" detail="All players" />
          }
        />
      </PreviewRail>,
    )

    expect(container.querySelector('[data-slot="preview-rail-identity"] .border-t')).toBeNull()
  })

  it('renders identity subheadline copy with shared typography', () => {
    const { container } = render(
      <PreviewRail>
        <PreviewRail.Identity name="Fighter" status="Level 1 Fighter" />
      </PreviewRail>,
    )

    const subheadline = container.querySelector(
      '[data-slot="preview-rail-identity"] .text-style-supporting',
    )

    expect(subheadline).toHaveTextContent('Level 1 Fighter')
  })

  it('renders identity metadata with a divider when facts are provided', () => {
    const { container } = render(
      <PreviewRail>
        <PreviewRail.Identity
          name="Fighter"
          status={<PreviewRail.AvailabilityLine available statusLabel="Available" />}
          facts={[{ label: 'Hit die', value: 'd8' }]}
        />
      </PreviewRail>,
    )

    expect(
      container.querySelector('[data-slot="preview-rail-identity"] .border-t'),
    ).toBeInTheDocument()
    expect(screen.getByText('Hit die')).toBeInTheDocument()
  })

  it('applies layout fill inside a bounded flex column aside slot', () => {
    render(
      <div className="flex h-64 flex-col overflow-hidden">
        <div className="flex min-h-0 flex-col">
          <PreviewRail layout="fill">
            <PreviewRail.Header title="Class Preview" />
            <PreviewRail.ScrollRegion data-testid="preview-rail-scroll">
              <PreviewRail.Sections>
                <PreviewRail.Section id="basics" label="Basics" />
              </PreviewRail.Sections>
            </PreviewRail.ScrollRegion>
          </PreviewRail>
        </div>
      </div>,
    )

    const rail = screen.getByRole('complementary')
    expect(rail).toHaveClass(
      'flex-1',
      'min-h-0',
      'min-w-0',
      'w-full',
      'flex',
      'flex-col',
      'overflow-hidden',
    )
    expect(screen.getByTestId('preview-rail-scroll')).toHaveClass('min-h-0', 'flex-1')
  })

  it('renders a statusless section without a marker icon', () => {
    render(
      <PreviewRail>
        <PreviewRail.Sections>
          <PreviewRail.Section id="basics" label="Basics" />
        </PreviewRail.Sections>
      </PreviewRail>,
    )

    expect(screen.getByRole('button', { name: 'Basics' })).toBeInTheDocument()
    expect(screen.queryByLabelText(/complete/i)).not.toBeInTheDocument()
  })

  it('renders non-expandable sections as static rows without a chevron', () => {
    render(
      <PreviewRail>
        <PreviewRail.Sections defaultValue="">
          <PreviewRail.Section
            id="spellcasting"
            label="Spellcasting"
            marker="off"
            status="Off"
            expandable={false}
          />
        </PreviewRail.Sections>
      </PreviewRail>,
    )

    expect(screen.queryByRole('button', { name: /Spellcasting/i })).not.toBeInTheDocument()
    expect(screen.getByText('Off')).toBeInTheDocument()
    expect(
      document.querySelector('[aria-hidden].size-\\[length\\:var\\(--icon-glyph-md\\)\\].shrink-0'),
    ).toBeInTheDocument()
  })
})
