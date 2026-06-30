import type { Meta, StoryObj } from '@storybook/react-vite'

import { MarkdownContent } from './markdown-content'

const SAMPLE_MARKDOWN = `
## Darkvision

Your **Darkvision** lets you see in dim light within 60 feet as if it were bright light.

- Advantage on Wisdom (Perception) checks
- Applies in dim light within 10 feet

Use \`pnpm bench\` for ticket workflows.

| Field | Value |
| ----- | ----- |
| Type | feature |
| Size | m |
`

const meta = {
  title: 'Typography/MarkdownContent',
  component: MarkdownContent,
  args: {
    markdown: SAMPLE_MARKDOWN,
  },
} satisfies Meta<typeof MarkdownContent>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    size: 'base',
    tone: 'default',
  },
}

export const MdMuted: Story = {
  args: {
    size: 'md',
    tone: 'muted',
  },
}

export const Empty: Story = {
  args: {
    markdown: '',
  },
}

export const ExternalLink: Story = {
  args: {
    markdown: 'See [Dev Bench docs](https://example.com/docs) for details.',
    size: 'md',
  },
}
