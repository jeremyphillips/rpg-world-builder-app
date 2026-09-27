import { Heading, Text } from '@rpg/ui'
import type { Meta, StoryObj } from '@storybook/react-vite'

import { viewportWorkspacePaneClasses } from './viewport-workspace.variants'
import { ViewportWorkspace } from './viewport-workspace'
import { PageShell } from './page-shell'

const meta = {
  title: 'Layout/PageShell',
  component: PageShell,
} satisfies Meta<typeof PageShell>

export default meta

type Story = StoryObj

export const FullWidth: Story = {
  render: () => (
    <PageShell width="full" rhythm="list">
      <Heading variant="page" as="h1">
        Full width
      </Heading>
      <Text variant="muted">Uses the main column — no max-width cap.</Text>
    </PageShell>
  ),
}

export const WideColumn: Story = {
  render: () => (
    <PageShell width="wide" rhythm="relaxed">
      <Heading variant="page" as="h1">
        Wide (~1280px)
      </Heading>
      <Text variant="muted">Catalog detail and preview forms.</Text>
    </PageShell>
  ),
}

export const NarrowColumn: Story = {
  render: () => (
    <PageShell width="narrow" rhythm="relaxed">
      <Heading variant="page" as="h1">
        Narrow (~900px)
      </Heading>
      <Text variant="muted">Settings and simple forms.</Text>
    </PageShell>
  ),
}

export const ViewportPane: Story = {
  render: () => (
    <ViewportWorkspace>
      <PageShell width="full" spacing="none" className={viewportWorkspacePaneClasses}>
        <Heading variant="page" as="h1">
          Viewport workspace
        </Heading>
        <Text variant="muted">Spacing none inside ViewportWorkspace.</Text>
      </PageShell>
    </ViewportWorkspace>
  ),
}
