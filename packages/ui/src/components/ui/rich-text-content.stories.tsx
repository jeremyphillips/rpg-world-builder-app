import type { Meta, StoryObj } from '@storybook/react-vite'

import { RichTextContent } from './rich-text-content'

const SAMPLE_HTML = `
<p>Your <strong>Darkvision</strong> lets you see in dim light within 60 feet as if it were bright light, and in darkness as if it were dim light.</p>
<p>You discern colors in that darkness only as shades of gray. This trait is common among subterranean ancestries.</p>
<h3>Keen Senses</h3>
<p>You have proficiency in the <em>Perception</em> skill. See the <a href="#">Player's Handbook</a> for skill rules.</p>
<ul>
  <li>Advantage on Wisdom (Perception) checks</li>
  <li>Applies in dim light within 10 feet</li>
</ul>
<blockquote cite="srd">Elves have a supernatural grace and an affinity for magic.</blockquote>
<p>Inline <code>code</code> stays readable against the parchment background.</p>
`

const meta = {
  title: 'Typography/RichTextContent',
  component: RichTextContent,
  args: {
    html: SAMPLE_HTML,
  },
} satisfies Meta<typeof RichTextContent>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    size: 'base',
    tone: 'default',
  },
}

/** Default for catalog rich-text (species traits, choice group descriptions). */
export const SmallMuted: Story = {
  args: {
    size: 'sm',
    tone: 'muted',
  },
}

export const Empty: Story = {
  args: {
    html: '',
  },
}
