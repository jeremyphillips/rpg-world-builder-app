import { render, screen } from '@testing-library/react'
import { FormProvider, useForm } from 'react-hook-form'
import { describe, expect, it } from 'vitest'

import { resolveFieldRowColumnTracks } from '../../components/ui/field-row-column-tracks.lib'
import { resolveRowFieldWidths } from '../config/resolve-row-field-widths.lib'
import { FormSectionProvider } from '../context/form-section.context'
import type { JoinedPairFieldConfig } from '../field-config'
import { AnatomyFieldRowCluster } from './anatomy-field-row-cluster.client'

const normal: JoinedPairFieldConfig = {
  type: 'joinedPair',
  label: 'Normal range',
  width: '1/2',
  start: {
    kind: 'select',
    name: 'range.normal',
    options: [{ value: 60, label: '60' }],
    ariaLabel: 'Normal range value',
  },
  end: { kind: 'label', text: 'ft.', ariaLabel: 'Normal range unit' },
}

const longRange: JoinedPairFieldConfig = {
  type: 'joinedPair',
  label: 'Long range',
  width: '1/2',
  start: {
    kind: 'select',
    name: 'range.long',
    options: [{ value: 80, label: '80' }],
    ariaLabel: 'Long range value',
  },
  end: { kind: 'label', text: 'ft.', ariaLabel: 'Long range unit' },
}

function ClusterHarness({ fields }: { fields: readonly JoinedPairFieldConfig[] }) {
  const form = useForm({ defaultValues: { 'range.normal': 60, 'range.long': 80 } })
  return (
    <FormProvider {...form}>
      <FormSectionProvider density="comfortable" depth={0}>
        <div
          data-field-row=""
          data-field-row-anatomy=""
          className="field-row-anatomy-grid grid min-w-0 [grid-template-rows:auto_auto_auto] grid-cols-[minmax(0,4fr)_minmax(0,8fr)]"
        >
          <AnatomyFieldRowCluster idPrefix="cluster" fields={fields} />
        </div>
      </FormSectionProvider>
    </FormProvider>
  )
}

describe('AnatomyFieldRowCluster', () => {
  it('spans parent anatomy row tracks for subgrid alignment', () => {
    const { container } = render(<ClusterHarness fields={[normal]} />)
    const cluster = container.querySelector('.row-span-3.grid-rows-subgrid')
    expect(cluster).toBeTruthy()
    expect(cluster).toHaveClass('[grid-template-columns:var(--row-cols)]')
    expect(screen.getByRole('combobox', { name: 'Normal range value' })).toBeInTheDocument()
  })

  it('resolves column tracks from field width tokens', () => {
    const halfTracks = resolveFieldRowColumnTracks(resolveRowFieldWidths([normal, longRange]))
    const { container } = render(<ClusterHarness fields={[normal, longRange]} />)
    const cluster = container.querySelector('.row-span-3.grid-rows-subgrid') as HTMLElement
    expect(cluster.style.getPropertyValue('--row-cols')).toBe(halfTracks.gridTemplateColumns)

    const autoField = { ...normal, width: 'auto' as const }
    const longAuto = { ...longRange, width: 'auto' as const }
    const autoTracks = resolveFieldRowColumnTracks(resolveRowFieldWidths([autoField, longAuto]))
    const { container: autoContainer } = render(<ClusterHarness fields={[autoField, longAuto]} />)
    const autoCluster = autoContainer.querySelector('.row-span-3.grid-rows-subgrid') as HTMLElement
    expect(autoCluster.style.getPropertyValue('--row-cols')).toBe(autoTracks.gridTemplateColumns)
    expect(autoTracks.gridTemplateColumns).toBe('max-content max-content')
  })
})
