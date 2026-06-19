import type { Meta, StoryObj } from '@storybook/react-vite'

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
  parameters: {
    layout: 'padded',
  },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

/** Default prose sizing for catalog rich-text (e.g. species trait descriptions). */
export const Default: Story = {
  render: () => (
    <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: SAMPLE_HTML }} />
  ),
}

/** Smaller prose for nested or secondary rich-text blocks. */
export const Small: Story = {
  render: () => (
    <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: SAMPLE_HTML }} />
  ),
}

/** Muted tone for supplementary rich-text under section headings. */
export const Muted: Story = {
  render: () => (
    <div
      className="prose prose-sm max-w-none text-muted-foreground [--tw-prose-body:var(--color-muted-foreground)] [--tw-prose-headings:var(--color-muted-foreground)] [--tw-prose-bold:var(--color-muted-foreground)]"
      dangerouslySetInnerHTML={{ __html: SAMPLE_HTML }}
    />
  ),
}

/** Larger prose for marketing or hero copy on the public app. */
export const Large: Story = {
  render: () => (
    <div
      className="prose lg:prose-xl max-w-none"
      dangerouslySetInnerHTML={{ __html: SAMPLE_HTML }}
    />
  ),
}
