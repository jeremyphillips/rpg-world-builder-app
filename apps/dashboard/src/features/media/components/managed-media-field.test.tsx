import { act, render, screen } from '@testing-library/react'
import { FormProvider, useForm } from 'react-hook-form'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { MediaManagerProps } from '../lib/media-manager.types'
import { EXPANDED_MEDIA_FIELD_PRESENTATION } from '../lib/media-field-config'
import { mediaFixture } from '../fixtures'
import { ManagedMediaField } from './managed-media-field'

const mediaManagerMock = vi.hoisted(() => ({
  props: undefined as MediaManagerProps | undefined,
}))

vi.mock('./media-manager', () => ({
  MediaManager: (props: MediaManagerProps) => {
    mediaManagerMock.props = props
    return null
  },
}))

function ManagedMediaFieldHarness() {
  const form = useForm({
    defaultValues: { media: mediaFixture },
    shouldUnregister: true,
  })
  const mediaDirty = Boolean(form.formState.dirtyFields.media)

  return (
    <FormProvider {...form}>
      <ManagedMediaField
        config={{
          domain: 'character',
          presentation: EXPANDED_MEDIA_FIELD_PRESENTATION,
        }}
        scope={{ kind: 'user-pc', userId: 'user-1' }}
      />
      <output data-testid="media-revision">{form.getValues('media.revision')}</output>
      <output data-testid="media-dirty">{String(mediaDirty)}</output>
    </FormProvider>
  )
}

describe('ManagedMediaField', () => {
  beforeEach(() => {
    mediaManagerMock.props = undefined
  })

  it('registers seeded media and keeps its revision when saving', async () => {
    render(<ManagedMediaFieldHarness />)

    expect(screen.getByRole('button', { name: 'Manage' })).toBeInTheDocument()
    expect(screen.getByText('2 of 20 uploads')).toBeInTheDocument()
    expect(mediaManagerMock.props?.value).toEqual(mediaFixture)
    const manager = mediaManagerMock.props
    if (manager === undefined) throw new Error('MediaManager did not render.')

    await act(async () => {
      await manager.onSave({
        media: {
          ...manager.value,
          images: manager.value.images.slice(0, 1),
        },
        expectedMediaRevision: manager.value.revision,
        assets: [],
      })
    })

    expect(screen.getByTestId('media-revision')).toHaveTextContent('4')
    expect(screen.getByTestId('media-dirty')).toHaveTextContent('true')
  })
})
