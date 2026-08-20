/**
 * @vitest-environment jsdom
 */
import { render, screen } from '@testing-library/react'
import { Button } from '@rpg/ui'
import { describe, expect, it } from 'vitest'

import { CreateCompositionStage } from './create-composition-stage.client'
import {
  createCompositionStageHeadingRowClasses,
  createCompositionStageStackClasses,
  createCompositionStageSubheadingClasses,
} from './create-composition.variants'

describe('CreateCompositionStage', () => {
  it('renders heading-only stage without helper', () => {
    const { container } = render(<CreateCompositionStage heading="Choose item" />)

    expect(screen.getByRole('heading', { level: 4, name: 'Choose item' })).toBeInTheDocument()
    expect(
      container.querySelector(`.${createCompositionStageStackClasses.split(' ')[0]}`),
    ).toBeTruthy()
  })

  it('renders heading with helper copy', () => {
    render(
      <CreateCompositionStage
        heading="Choose organization"
        helper="Select an existing organization or create a new one."
      />,
    )

    expect(
      screen.getByText('Select an existing organization or create a new one.'),
    ).toBeInTheDocument()
  })

  it('renders heading with trailing action', () => {
    render(
      <CreateCompositionStage
        heading="New organization"
        action={
          <Button type="button" variant="ghost">
            Choose existing
          </Button>
        }
      />,
    )

    expect(screen.getByRole('button', { name: 'Choose existing' })).toBeInTheDocument()
  })

  it('renders heading, helper, action, and children with structural wrappers', () => {
    render(
      <CreateCompositionStage
        heading="New organization"
        helper="This organization will be created when you create the building."
        action={
          <Button type="button" variant="ghost">
            Choose existing
          </Button>
        }
      >
        <p>Stage body</p>
      </CreateCompositionStage>,
    )

    expect(screen.getByText('Stage body')).toBeInTheDocument()
    expect(
      document.querySelector(`.${createCompositionStageSubheadingClasses.split(' ')[0]}`),
    ).toBeTruthy()
    expect(
      document.querySelector(`.${createCompositionStageHeadingRowClasses.split(' ')[0]}`),
    ).toBeTruthy()
  })
})
