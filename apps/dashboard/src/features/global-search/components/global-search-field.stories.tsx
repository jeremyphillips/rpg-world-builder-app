import type { Meta, StoryObj } from '@storybook/react-vite'
import * as React from 'react'

import { GlobalSearchField } from './global-search-field'

function ControlledGlobalSearchField(
  props: Omit<React.ComponentProps<typeof GlobalSearchField>, 'value' | 'onValueChange'> & {
    value?: string
  },
) {
  const [value, setValue] = React.useState(props.value ?? '')
  return <GlobalSearchField {...props} value={value} onValueChange={setValue} />
}

const meta = {
  title: 'GlobalSearch/GlobalSearchField',
  component: ControlledGlobalSearchField,
} satisfies Meta<typeof ControlledGlobalSearchField>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    id: 'global-search-field-story',
  },
}

export const WithQuery: Story = {
  args: {
    id: 'global-search-field-story-query',
    value: 'firebolt',
  },
}
