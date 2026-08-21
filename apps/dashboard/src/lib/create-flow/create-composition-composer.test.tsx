/**
 * @vitest-environment jsdom
 */
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { CreateCompositionComposer } from './create-composition-composer'
import {
  createCompositionComposerStackClasses,
  createCompositionReviewClasses,
} from './create-composition.variants'

describe('CreateCompositionComposer', () => {
  it('renders composer heading and nested review stack', () => {
    render(
      <CreateCompositionComposer heading="Add organization relationship">
        <p>Review content</p>
      </CreateCompositionComposer>,
    )

    expect(
      screen.getByRole('heading', { level: 3, name: 'Add organization relationship' }),
    ).toBeInTheDocument()
    expect(screen.getByText('Review content')).toBeInTheDocument()
    expect(
      document.querySelector(`.${createCompositionComposerStackClasses.split(' ')[0]}`),
    ).toBeTruthy()
    expect(document.querySelector(`.${createCompositionReviewClasses.split(' ')[0]}`)).toBeTruthy()
  })
})
