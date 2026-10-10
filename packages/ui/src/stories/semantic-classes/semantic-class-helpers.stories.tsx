import type { Meta, StoryObj } from '@storybook/react-vite'
import * as React from 'react'

import { Button } from '../../components/ui/button'
import { ClassReferenceTable, type ClassReferenceSpec } from './class-reference-table'
import { SemanticClassCaption } from './semantic-class-caption.client'
import { CatalogTable } from './catalog-table'

const meta = {
  title: 'Semantic classes/Helpers',
  parameters: {
    layout: 'padded',
  },
} satisfies Meta

export default meta

type Story = StoryObj<typeof meta>

export const CatalogTableDemo: Story = {
  render: () => (
    <CatalogTable
      columns={[
        { header: 'Token', cell: (row) => row.token },
        { header: 'Meaning', cell: (row) => row.meaning },
      ]}
      rows={[
        { key: '1', token: 'ui-button', meaning: 'Button block' },
        { key: '2', token: 'ui-button--sm', meaning: '32px labeled geometry' },
      ]}
    />
  ),
}

export const ClassReferenceTableDemo: Story = {
  render: () => {
    const rows: ClassReferenceSpec[] = [
      {
        key: 'demo',
        sample: (
          <Button data-semantic-class-target size="sm">
            Sample
          </Button>
        ),
        propsLabel: 'size="sm"',
        className: 'ui-button ui-button--primary ui-button--sm',
        keyValues: 'height: 32px',
        useCase: 'Dense toolbar action',
      },
    ]
    return <ClassReferenceTable rows={rows} />
  },
}

export const SemanticClassCaptionDemo: Story = {
  parameters: { semanticClasses: true },
  render: () => {
    const ref = React.useRef<HTMLButtonElement>(null)
    return (
      <div className="space-y-2">
        <Button ref={ref} data-semantic-class-target>
          Inspected control
        </Button>
        <SemanticClassCaption targetRef={ref} />
      </div>
    )
  },
}
