import type { Meta, StoryObj } from '@storybook/react-vite'
import { BookOpen, Eye } from 'lucide-react'

import { PreviewRail } from './preview-rail.client'

const meta = {
  title: 'Components/PreviewRail',
  component: PreviewRail,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof PreviewRail>

export default meta
type Story = StoryObj<typeof meta>

const identityFacts = [
  { label: 'Hit die', value: 'd8' },
  { label: 'Primary abilities', value: 'Strength' },
]

export const MockComposition: Story = {
  name: 'Mock composition (valid class)',
  render: () => (
    <PreviewRail sticky>
      <PreviewRail.Header title="Class Preview" badge={<PreviewRail.DraftBadge />} />
      <PreviewRail.Identity
        media={<PreviewRail.Media fallbackIcon={<BookOpen />} />}
        name="Fighter"
        availability={{ available: true, statusLabel: 'Available', detail: 'All players' }}
      />
      <PreviewRail.ScrollRegion>
        <PreviewRail.Sections
          description="Overview of this class and its current configuration."
          defaultValue="basics"
        >
          <PreviewRail.Section
            id="basics"
            label="Basics"
            marker="complete"
            status="Ready"
            statusTone="success"
          >
            <PreviewRail.SectionBody
              description="A brief description will appear here once provided."
              facts={identityFacts}
            />
          </PreviewRail.Section>
          <PreviewRail.Section
            id="proficiencies"
            label="Proficiencies"
            marker="complete"
            status="Ready"
            statusTone="success"
          />
          <PreviewRail.Section
            id="spellcasting"
            label="Spellcasting"
            marker="off"
            status="Off"
            expandable={false}
          />
          <PreviewRail.Section
            id="features"
            label="Features"
            marker="complete"
            status="5 default features"
          />
          <PreviewRail.Section
            id="subclasses"
            label="Subclasses"
            marker="none"
            status="None"
            expandable={false}
          />
          <PreviewRail.Section
            id="characterCreation"
            label="Character creation"
            marker="notConfigured"
            status="Not configured"
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
          icon={<Eye />}
        />
      </PreviewRail.Footer>
    </PreviewRail>
  ),
}

export const FreshCreate: Story = {
  render: () => (
    <PreviewRail sticky>
      <PreviewRail.Header title="Class Preview" badge={<PreviewRail.DraftBadge />} />
      <PreviewRail.Identity
        media={<PreviewRail.Media fallbackIcon={<BookOpen />} />}
        name="Unnamed Class"
        availability={{ available: true, statusLabel: 'Available', detail: 'All players' }}
      />
      <PreviewRail.ScrollRegion>
        <PreviewRail.Sections
          description="Overview of this class and its current configuration."
          defaultValue="basics"
        >
          <PreviewRail.Section id="basics" label="Basics" marker="incomplete">
            <PreviewRail.SectionBody
              description="A brief description will appear here once provided."
              facts={identityFacts}
            />
          </PreviewRail.Section>
          <PreviewRail.Section
            id="spellcasting"
            label="Spellcasting"
            marker="off"
            status="Off"
            expandable={false}
          />
          <PreviewRail.Section
            id="features"
            label="Features"
            marker="complete"
            status="5 default features"
          />
        </PreviewRail.Sections>
      </PreviewRail.ScrollRegion>
      <PreviewRail.Footer>
        <PreviewRail.StatusPanel
          variant="default"
          title="Not ready to publish"
          description="Required configuration is incomplete."
        />
        <PreviewRail.Action
          label="Preview as player"
          helperText="See how this class will appear to players in your campaign."
          icon={<Eye />}
        />
      </PreviewRail.Footer>
    </PreviewRail>
  ),
}

export const PostSubmitAttention: Story = {
  render: () => (
    <PreviewRail sticky>
      <PreviewRail.Header title="Class Preview" badge={<PreviewRail.DraftBadge />} />
      <PreviewRail.Identity
        media={<PreviewRail.Media fallbackIcon={<BookOpen />} />}
        name="Unnamed Class"
        availability={{ available: true, statusLabel: 'Available', detail: 'All players' }}
      />
      <PreviewRail.ScrollRegion>
        <PreviewRail.Sections defaultValue="basics">
          <PreviewRail.Section
            id="basics"
            label="Basics"
            marker="attention"
            status="Needs attention"
            statusTone="warning"
          />
          <PreviewRail.Section
            id="proficiencies"
            label="Proficiencies"
            marker="attention"
            status="Needs attention"
            statusTone="warning"
          />
        </PreviewRail.Sections>
      </PreviewRail.ScrollRegion>
      <PreviewRail.Footer>
        <PreviewRail.StatusPanel variant="warning" title="2 sections need attention." />
        <PreviewRail.Action label="Preview as player" icon={<Eye />} />
      </PreviewRail.Footer>
    </PreviewRail>
  ),
}

export const LongNameTruncation: Story = {
  render: () => (
    <PreviewRail sticky>
      <PreviewRail.Header title="Class Preview" badge={<PreviewRail.DraftBadge />} />
      <PreviewRail.Identity
        media={<PreviewRail.Media fallbackIcon={<BookOpen />} />}
        name="The Order of the Radiant Banner and Eternal Vigil"
        availability={{ available: true, statusLabel: 'Available', detail: 'All players' }}
      />
    </PreviewRail>
  ),
}

export const SheetHost: Story = {
  name: 'Sheet host (plain chrome)',
  render: () => (
    <div className="w-[21rem] rounded-md border border-card-border bg-card p-4">
      <PreviewRail chrome="plain">
        <PreviewRail.Identity
          media={<PreviewRail.Media fallbackIcon={<BookOpen />} />}
          name="Fighter"
          availability={{ available: true, statusLabel: 'Available', detail: 'All players' }}
        />
        <PreviewRail.StatusPanel
          variant="success"
          title="Ready to publish"
          description="Required configuration is complete."
        />
      </PreviewRail>
    </div>
  ),
}

export const UnavailableIdentity: Story = {
  render: () => (
    <PreviewRail>
      <PreviewRail.Header title="Class Preview" />
      <PreviewRail.Identity
        media={<PreviewRail.Media fallbackIcon={<BookOpen />} />}
        name="Fighter"
        availability={{ available: false, statusLabel: 'Unavailable', detail: 'All players' }}
      />
    </PreviewRail>
  ),
}

export const PlainChrome: Story = {
  render: () => (
    <PreviewRail chrome="plain">
      <PreviewRail.Identity
        media={<PreviewRail.Media fallbackIcon={<BookOpen />} />}
        name="Fighter"
        availability={{ available: true, statusLabel: 'Available', detail: 'All players' }}
      />
    </PreviewRail>
  ),
}

export const WithIdentityMetadata: Story = {
  name: 'With identity metadata',
  render: () => (
    <PreviewRail>
      <PreviewRail.Header title="Class Preview" />
      <PreviewRail.Identity
        media={<PreviewRail.Media fallbackIcon={<BookOpen />} />}
        name="Fighter"
        availability={{ available: true, statusLabel: 'Available', detail: 'All players' }}
        facts={identityFacts}
      />
    </PreviewRail>
  ),
}
