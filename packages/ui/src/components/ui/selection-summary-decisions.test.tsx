/**
 * @vitest-environment jsdom
 */
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import {
  DecisionSummaryPanel,
  mapSummaryDecisionRowsToSelectionProps,
  SELECTION_SUMMARY_DEFAULT_CHANGE_LABEL,
  SELECTION_SUMMARY_DEFAULT_EYEBROW,
  SelectionSummaryCards,
  type SummaryDecisionRow,
} from './selection-summary-decisions'

const sampleRows: SummaryDecisionRow[] = [
  {
    id: 'role',
    label: 'Role',
    value: 'Scout',
    decisionId: 'role',
    onNavigate: vi.fn(),
  },
  {
    id: 'species',
    label: 'Species',
    value: 'Gnome',
    decisionId: 'species',
    onNavigate: vi.fn(),
  },
  {
    id: 'build',
    label: 'Build',
    value: 'Level 1 Ranger',
    decisionId: 'build',
    onNavigate: vi.fn(),
  },
]

describe('mapSummaryDecisionRowsToSelectionProps', () => {
  it('keeps the active row visible without Change and leaves Change on the others', async () => {
    const user = userEvent.setup()
    const onNavigateBuild = vi.fn()

    const rows: SummaryDecisionRow[] = [
      { id: 'role', label: 'Role', value: 'Scout', decisionId: 'role', onNavigate: vi.fn() },
      {
        id: 'species',
        label: 'Species',
        value: 'Gnome',
        decisionId: 'species',
        onNavigate: vi.fn(),
      },
      {
        id: 'build',
        label: 'Build',
        value: 'Level 1 Ranger',
        decisionId: 'build',
        onNavigate: onNavigateBuild,
      },
    ]

    render(
      <dl>
        {mapSummaryDecisionRowsToSelectionProps({
          rows,
          activeDecisionId: 'species',
        }).map((row) => (
          <div key={row.label}>
            <span>{row.label}</span>
            <span>{row.value}</span>
            {row.action}
          </div>
        ))}
      </dl>,
    )

    expect(screen.getByRole('button', { name: 'Change role' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Change species' })).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Change build' })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Change build' }))
    expect(onNavigateBuild).toHaveBeenCalledOnce()
  })

  it('gives every row Change when no editor is active', () => {
    render(
      <dl>
        {mapSummaryDecisionRowsToSelectionProps({ rows: sampleRows }).map((row) => (
          <div key={row.label}>{row.action}</div>
        ))}
      </dl>,
    )

    expect(screen.getByRole('button', { name: 'Change role' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Change species' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Change build' })).toBeInTheDocument()
  })

  it('renders read-only rows when onNavigate is omitted', () => {
    render(
      <dl>
        {mapSummaryDecisionRowsToSelectionProps({
          rows: [{ id: 'role', label: 'Role', value: 'Scout' }],
        }).map((row) => (
          <div key={row.label}>{row.action}</div>
        ))}
      </dl>,
    )

    expect(screen.queryByRole('button', { name: 'Change role' })).not.toBeInTheDocument()
  })

  it('uses default and custom change labels', () => {
    expect(SELECTION_SUMMARY_DEFAULT_CHANGE_LABEL).toBe('Change')

    render(
      <dl>
        {mapSummaryDecisionRowsToSelectionProps({
          rows: [
            {
              id: 'kind',
              label: 'Relationship',
              value: 'Owner',
              onNavigate: vi.fn(),
              changeLabel: 'Edit',
            },
          ],
          defaultChangeLabel: 'Modify',
        }).map((row) => (
          <div key={row.label}>{row.action}</div>
        ))}
      </dl>,
    )

    expect(screen.getByText('Edit')).toBeInTheDocument()
  })
})

describe('DecisionSummaryPanel', () => {
  it('renders card chrome with default Selections eyebrow', () => {
    const { container } = render(
      <DecisionSummaryPanel
        rows={[{ id: 'kind', label: 'Kind', value: 'Owner', onNavigate: vi.fn() }]}
      />,
    )

    expect(screen.getByText(SELECTION_SUMMARY_DEFAULT_EYEBROW)).toBeInTheDocument()
    const card = container.querySelector('article')
    expect(card).toHaveClass('bg-surface-muted')
  })

  it('renders embedded rows without card shell', () => {
    const { container } = render(
      <DecisionSummaryPanel
        chrome="embedded"
        rows={[{ id: 'kind', label: 'Kind', value: 'Owner' }]}
      />,
    )

    expect(screen.queryByText(SELECTION_SUMMARY_DEFAULT_EYEBROW)).not.toBeInTheDocument()
    expect(container.querySelector('article')).toBeNull()
    expect(container.querySelector('dl')).toHaveClass('grid')
  })
})

describe('SelectionSummaryCards', () => {
  it('defaults card eyebrow to Selections when omitted', () => {
    render(
      <SelectionSummaryCards
        cards={[
          {
            id: 'selections',
            rows: [{ id: 'role', label: 'Role', value: 'Scout' }],
          },
        ]}
      />,
    )

    expect(screen.getByText(SELECTION_SUMMARY_DEFAULT_EYEBROW)).toBeInTheDocument()
  })

  it('renders multiple cards and respects active decision suppression', () => {
    render(
      <SelectionSummaryCards
        cards={[
          {
            id: 'selections',
            eyebrow: 'Selections',
            rows: sampleRows,
          },
          {
            id: 'other',
            eyebrow: 'Other',
            rows: [{ id: 'note', label: 'Note', value: 'Done' }],
          },
        ]}
        activeDecisionId="species"
      />,
    )

    expect(screen.getByText('Selections')).toBeInTheDocument()
    expect(screen.getByText('Other')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Change species' })).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Change role' })).toBeInTheDocument()
  })

  it('returns null when all cards have no mappable rows', () => {
    const { container } = render(<SelectionSummaryCards cards={[]} />)
    expect(container).toBeEmptyDOMElement()
  })
})
