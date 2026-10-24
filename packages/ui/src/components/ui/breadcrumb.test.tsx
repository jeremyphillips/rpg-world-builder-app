import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbSeparator,
} from './breadcrumb.client'

describe('Breadcrumb', () => {
  it('renders the separator without a default class', () => {
    render(
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>Home</BreadcrumbItem>
          <BreadcrumbSeparator />
        </BreadcrumbList>
      </Breadcrumb>,
    )

    const separator = document.querySelector('[role="presentation"]')
    expect(separator).not.toBeNull()
    expect(separator).not.toHaveAttribute('class')
  })
})
