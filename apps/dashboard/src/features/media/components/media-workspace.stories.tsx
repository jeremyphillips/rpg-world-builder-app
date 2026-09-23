import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useMediaManager } from '../hooks/use-media-manager'
import { mediaFixture, mediaFixtureAssets, mediaFixtureImageUrl } from '../fixtures'
import { MediaWorkspace } from './media-workspace'
function WorkspaceExample() {
  const controller = useMediaManager({
    open: true,
    onOpenChange: () => {},
    domain: 'character',
    value: mediaFixture,
    scope: { kind: 'user-pc', userId: 'demo' },
    initialAssets: mediaFixtureAssets,
    mode: 'form',
    onSave: () => {},
  })
  return <MediaWorkspace controller={controller} imageUrl={mediaFixtureImageUrl} />
}
function Example() {
  const [client] = useState(() => new QueryClient())
  return (
    <QueryClientProvider client={client}>
      <WorkspaceExample />
    </QueryClientProvider>
  )
}
const meta = { title: 'Features/Media/Workspace', component: Example } satisfies Meta<
  typeof Example
>
export default meta
type Story = StoryObj<typeof meta>
export const Portrait: Story = {}
