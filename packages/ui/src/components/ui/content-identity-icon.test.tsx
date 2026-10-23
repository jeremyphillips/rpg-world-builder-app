import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { ACTION_ICONS } from './action-icons.map'
import { ActionIcon } from './action-icon.client'
import { CONTENT_DISPLAY_FALLBACK_ICONS } from './content-display-fallback-icon.map'
import { contentIdentityIcon } from './content-identity-icon.lib'

describe('contentIdentityIcon', () => {
  it('returns the same glyph name as the identity map entry', () => {
    expect(contentIdentityIcon('character')).toBe(CONTENT_DISPLAY_FALLBACK_ICONS.character)
    expect(contentIdentityIcon('spell')).toBe(CONTENT_DISPLAY_FALLBACK_ICONS.spell)
    expect(contentIdentityIcon('campaign')).toBe(CONTENT_DISPLAY_FALLBACK_ICONS.campaign)
    expect(contentIdentityIcon('generic')).toBe(CONTENT_DISPLAY_FALLBACK_ICONS.generic)
    expect(CONTENT_DISPLAY_FALLBACK_ICONS.generic).toBe(CONTENT_DISPLAY_FALLBACK_ICONS.campaign)
  })
})

describe('ActionIcon', () => {
  it('renders the registry glyph for the action verb', () => {
    const { container } = render(<ActionIcon action="edit" size="lg" />)
    expect(container.querySelector('svg')).toHaveAttribute('data-icon', 'pencil')
    expect(ACTION_ICONS.edit).toBe('pencil')
  })
})
