import type { Meta, StoryObj } from '@storybook/react-vite'

import { Button } from './button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './card'
import { Input } from './input'

const meta = {
  title: 'Primitives/Card',
  component: Card,
} satisfies Meta<typeof Card>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <Card className="w-80">
      <CardHeader>
        <CardTitle>Create campaign</CardTitle>
        <CardDescription>Start a new world for your party.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        <label htmlFor="campaign-name" className="text-sm font-medium">
          Name
        </label>
        <Input id="campaign-name" placeholder="The Sunless Citadel" />
      </CardContent>
      <CardFooter className="justify-end gap-2">
        <Button variant="ghost">Cancel</Button>
        <Button>Create</Button>
      </CardFooter>
    </Card>
  ),
}
