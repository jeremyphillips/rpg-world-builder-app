import { BookOpen, Eye } from 'lucide-react'
import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { PreviewRail } from './preview-rail.client'

describe('PreviewRail', () => {
  it('renders the mock composition stack', async () => {
    const user = userEvent.setup()

    render(
      <PreviewRail sticky>
        <PreviewRail.Header title="Class Preview" badge={<PreviewRail.DraftBadge />} />
        <PreviewRail.Identity
          media={<PreviewRail.Media fallbackIcon={<BookOpen />} />}
          name="Fighter"
          availability={{ available: true, statusLabel: 'Available', detail: 'All players' }}
          facts={[
            { label: 'Hit die', value: 'd8' },
            { label: 'Primary abilities', value: 'Strength' },
          ]}
        />
        <PreviewRail.ScrollRegion data-testid="preview-rail-scroll">
          <PreviewRail.Sections defaultValue="basics">
            <PreviewRail.Section
              id="basics"
              label="Basics"
              marker="complete"
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
              marker="idle"
              status="Off"
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
            icon={<Eye />}
          />
        </PreviewRail.Footer>
      </PreviewRail>,
    )

    expect(screen.getByRole('complementary').className).toContain('h-full')
    expect(screen.getByRole('complementary').className).toContain('max-h-full')
    expect(screen.getByRole('complementary').className).toContain('min-h-0')
    expect(screen.getByTestId('preview-rail-scroll')).toHaveClass('overflow-y-auto')
    expect(screen.getByTestId('preview-rail-scroll').className).toContain('pe-2.5')
    expect(screen.getByRole('heading', { name: 'Class Preview' })).toBeInTheDocument()
    expect(screen.getByText('Draft')).toBeInTheDocument()
    expect(screen.getByText('Available')).toBeInTheDocument()
    expect(screen.getByText('All players')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Preview as player' })).toBeInTheDocument()

    const basicsTrigger = screen.getByRole('button', { name: /Basics/ })
    expect(basicsTrigger).toHaveAttribute('aria-expanded', 'true')
    await user.click(basicsTrigger)
    expect(basicsTrigger).toHaveAttribute('aria-expanded', 'false')
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
})
