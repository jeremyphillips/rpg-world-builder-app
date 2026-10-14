import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'

import { Text } from '@rpg/ui'

import { ContentFormShellResolver } from './content-form-shell-resolver'

const meta = {
  title: 'Dashboard/Content/Forms/ContentFormShellResolver',
  component: ContentFormShellResolver,
} satisfies Meta<typeof ContentFormShellResolver>

export default meta

type Story = StoryObj<typeof meta>

export const Pending: Story = {
  args: {
    isPending: true,
    isError: false,
    children: <Text>Form body</Text>,
  },
}

export const Error: Story = {
  args: {
    isPending: false,
    isError: true,
    children: <Text>Form body</Text>,
  },
}

export const ErrorWithRetry: Story = {
  render: function ErrorWithRetryStory() {
    const [isError, setIsError] = useState(true)
    const [isRetrying, setIsRetrying] = useState(false)
    return (
      <ContentFormShellResolver
        isPending={false}
        isError={isError}
        isRetrying={isRetrying}
        onRetry={() => {
          setIsRetrying(true)
          window.setTimeout(() => {
            setIsRetrying(false)
            setIsError(false)
          }, 600)
        }}
      >
        <Text>Form body loaded after retry.</Text>
      </ContentFormShellResolver>
    )
  },
}

export const RetryInProgress: Story = {
  args: {
    isPending: false,
    isError: true,
    isRetrying: true,
    onRetry: () => undefined,
    children: <Text>Form body</Text>,
  },
}
