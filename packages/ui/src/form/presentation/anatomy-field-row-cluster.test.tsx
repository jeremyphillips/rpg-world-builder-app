import { render, screen } from '@testing-library/react'
import { FormProvider, useForm } from 'react-hook-form'
import { describe, expect, it } from 'vitest'

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

function Harness() {
  const form = useForm({ defaultValues: { 'range.normal': 60 } })
  return (
    <FormProvider {...form}>
      <FormSectionProvider density="comfortable" depth={0}>
        <div
          data-field-row=""
          data-field-row-anatomy=""
          className="field-row-anatomy-grid grid min-w-0 [grid-template-rows:auto_auto_auto] grid-cols-[minmax(0,4fr)_minmax(0,8fr)]"
        >
          <AnatomyFieldRowCluster idPrefix="cluster" fields={[normal]} />
        </div>
      </FormSectionProvider>
    </FormProvider>
  )
}

describe('AnatomyFieldRowCluster', () => {
  it('spans parent anatomy row tracks for subgrid alignment', () => {
    const { container } = render(<Harness />)
    const cluster = container.querySelector('.row-span-3.grid-rows-subgrid')
    expect(cluster).toBeTruthy()
    expect(cluster).toHaveClass('grid-cols-[minmax(0,1fr)_minmax(0,1fr)]')
    expect(screen.getByRole('combobox', { name: 'Normal range value' })).toBeInTheDocument()
  })
})
