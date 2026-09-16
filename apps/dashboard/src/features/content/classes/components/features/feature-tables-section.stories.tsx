'use client'

import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'

import { DetailOverflowMenu } from '../../../lib/detail/detail-overflow-menu'
import { FeatureTableModal, type FeatureTableModalMode } from './feature-table-modal'
import { FeatureTableRow } from './feature-table-row'
import { FeatureTablesSection } from './feature-tables-section'

const meta = {
  title: 'Content/Classes/FeatureTablesSection',
  component: FeatureTablesSection,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof FeatureTablesSection>

export default meta
type Story = StoryObj<typeof meta>

function FeatureTablesSectionDemo({
  tables,
}: {
  tables: readonly {
    title: string
    metadata: string
    typeLabel?: string
  }[]
}) {
  const [modalOpen, setModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<FeatureTableModalMode>('create')

  const openModal = (mode: FeatureTableModalMode) => {
    setModalMode(mode)
    setModalOpen(true)
  }

  return (
    <>
      <FeatureTablesSection
        onAddTable={() => openModal('create')}
        tables={tables.map((table) => (
          <FeatureTableRow
            key={table.title}
            title={table.title}
            metadata={table.metadata}
            typeLabel={table.typeLabel}
            onEdit={() => openModal('edit')}
            overflowActions={
              <DetailOverflowMenu
                triggerLabel={`Actions for ${table.title}`}
                actions={[
                  {
                    id: 'delete',
                    label: 'Delete table',
                    destructive: true,
                    onSelect: () => undefined,
                  },
                ]}
              />
            }
          />
        ))}
      />
      <FeatureTableModal open={modalOpen} mode={modalMode} onOpenChange={setModalOpen} />
    </>
  )
}

export const Empty: Story = {
  render: () => <FeatureTablesSectionDemo tables={[]} />,
}

export const Populated: Story = {
  render: () => (
    <FeatureTablesSectionDemo
      tables={[
        {
          title: 'Rage',
          metadata: '2 columns · 5 level breakpoints',
          typeLabel: 'Level progression',
        },
      ]}
    />
  ),
}
