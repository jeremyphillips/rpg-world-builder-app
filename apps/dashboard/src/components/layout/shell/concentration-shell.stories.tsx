import { Text } from '@rpg/ui'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { Route, Routes } from 'react-router-dom'

import { ConcentrationShell } from './concentration-shell'

const meta = {
  title: 'Layout/ConcentrationShell',
  component: ConcentrationShell,
} satisfies Meta<typeof ConcentrationShell>

export default meta
type Story = StoryObj

export const Default: Story = {
  render: () => (
    <Routes>
      <Route element={<ConcentrationShell />}>
        <Route index element={<Text>Concentration content</Text>} />
      </Route>
    </Routes>
  ),
}
