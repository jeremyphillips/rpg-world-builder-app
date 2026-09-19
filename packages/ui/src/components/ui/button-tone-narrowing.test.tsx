import { describe, it } from 'vitest'
import { render } from '@testing-library/react'

import { Button } from './button.client'

describe('Button tone narrowing', () => {
  it('accepts tone on text variant', () => {
    render(
      <Button variant="text" tone="accent">
        Choose class
      </Button>,
    )
  })

  it('rejects tone on chrome variants at compile time', () => {
    render(
      // @ts-expect-error tone only applies when variant is text
      <Button variant="ghost" tone="accent">
        Bad
      </Button>,
    )
  })

  it('rejects tone when variant is omitted at compile time', () => {
    render(
      // @ts-expect-error tone only applies when variant is text
      <Button tone="accent">Bad</Button>,
    )
  })
})
