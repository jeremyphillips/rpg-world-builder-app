import { describe, expect, it } from 'vitest'

import { Icon } from './icon'

describe('Icon prop types', () => {
  it('requires size and rejects naming or test attributes', () => {
    const _decorative = <Icon name="check" size="sm" />
    expect(_decorative).toBeTruthy()

    // @ts-expect-error size is required
    const _missingSize = <Icon name="check" />

    // @ts-expect-error aria-label cannot name a decorative icon
    const _ariaLabel = <Icon name="check" size="sm" aria-label="Check" />

    // @ts-expect-error aria-labelledby is forbidden
    const _ariaLabelledBy = <Icon name="check" size="sm" aria-labelledby="title" />

    // @ts-expect-error aria-hidden is owned by Icon
    const _ariaHidden = <Icon name="check" size="sm" aria-hidden="true" />

    // @ts-expect-error data-testid is forbidden
    const _dataTestId = <Icon name="check" size="sm" data-testid="icon" />

    // @ts-expect-error role is forbidden
    const _role = <Icon name="check" size="sm" role="img" />

    // @ts-expect-error style is forbidden
    const _style = <Icon name="check" size="sm" style={{ color: 'red' }} />

    void _missingSize
    void _ariaLabel
    void _ariaLabelledBy
    void _ariaHidden
    void _dataTestId
    void _role
    void _style
  })
})
