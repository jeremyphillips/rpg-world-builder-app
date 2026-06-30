import type { Meta, StoryObj } from '@storybook/react-vite'

import { RichTextContent } from '../components/ui/rich-text-content'

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
  title: 'Typography/Prose',
  component: RichTextContent,
  parameters: {
    layout: 'padded',
  },
  args: {
    html: SAMPLE_HTML,
  },
} satisfies Meta<typeof RichTextContent>

export default meta
type Story = StoryObj<typeof meta>

/** Default prose sizing for catalog rich-text (e.g. species trait descriptions). */
export const Default: Story = {
  args: {
    size: 'base',
    tone: 'default',
  },
}

/** Secondary-body prose for catalog rich-text (15px). */
export const Md: Story = {
  args: {
    size: 'md',
    tone: 'default',
  },
}

/** Compact prose (14px) for nested or secondary rich-text blocks. */
export const Small: Story = {
  args: {
    size: 'sm',
    tone: 'default',
  },
}

/** Muted tone for supplementary rich-text under section headings. */
export const Muted: Story = {
  args: {
    size: 'md',
    tone: 'muted',
  },
}

/** Larger prose for marketing or hero copy on the public app. */
export const Large: Story = {
  args: {
    size: 'base',
    tone: 'default',
    className: 'lg:prose-xl',
  },
}
