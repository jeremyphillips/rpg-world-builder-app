import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expectNoAxeViolations, itAxe } from '@rpg/ui/test-utils'
import { FormProvider, useForm } from 'react-hook-form'
import { describe, expect, it } from 'vitest'

import { GRAPPLER } from '../fixtures'
import {
  ADD_CONDITION_LABEL,
  ADD_CONDITION_SET_LABEL,
  CONDITION_SETS_HEADING,
  CONDITION_TYPE_LABEL,
  CONDITION_TYPE_PLACEHOLDER,
} from '../lib/requirement-editor-constants'
import { formatRequirementEditorPreview } from '../lib/requirement-editor-form'
import {
  requirementEditorDefaultValue,
  type PrerequisiteEditorValue,
} from '../lib/requirement-editor-form-schema'
import { requirementExpressionToEditor } from '../lib/requirement-editor-form-values'
import { FormSectionProvider } from '@rpg/ui/form'
import { RequirementEditor } from './requirement-editor.client'

function EditorShell({
  prerequisiteEditor = requirementEditorDefaultValue(),
}: {
  prerequisiteEditor?: PrerequisiteEditorValue
}) {
  const form = useForm({ defaultValues: { prerequisiteEditor } })
  return (
    <FormProvider {...form}>
      <FormSectionProvider rhythm="compact">
        <RequirementEditor name="prerequisiteEditor" />
      </FormSectionProvider>
    </FormProvider>
  )
}

describe('RequirementEditor', () => {
  it('renders an empty state with add condition set control and preview', () => {
    render(<EditorShell />)

    expect(screen.getByRole('button', { name: ADD_CONDITION_SET_LABEL })).toBeInTheDocument()
    expect(screen.getByText('No prerequisites')).toBeInTheDocument()
    expect(screen.getByRole('group', { name: CONDITION_SETS_HEADING })).toBeInTheDocument()
  })

  it('renders preview before condition sets heading in DOM order', () => {
    const editor = requirementExpressionToEditor(GRAPPLER.prerequisite)
    render(<EditorShell prerequisiteEditor={editor} />)

    const preview = screen.getByText(formatRequirementEditorPreview(editor))
    const heading = screen.getByText(CONDITION_SETS_HEADING)
    expect(preview.compareDocumentPosition(heading) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
  })

  it('adds a condition set with an empty condition row', async () => {
    const user = userEvent.setup()
    render(<EditorShell />)

    await user.click(screen.getByRole('button', { name: ADD_CONDITION_SET_LABEL }))

    await waitFor(() => {
      expect(screen.getByRole('group', { name: 'Condition set 1' })).toBeInTheDocument()
    })
    expect(screen.getByLabelText(CONDITION_TYPE_LABEL)).toHaveTextContent(
      CONDITION_TYPE_PLACEHOLDER,
    )
    expect(screen.queryByLabelText(/Minimum level/i)).not.toBeInTheDocument()
  })

  it('adds another condition within a set', async () => {
    const user = userEvent.setup()
    render(
      <EditorShell prerequisiteEditor={requirementExpressionToEditor(GRAPPLER.prerequisite)} />,
    )

    const addConditionButtons = screen.getAllByRole('button', { name: ADD_CONDITION_LABEL })
    await user.click(addConditionButtons[0]!)

    await waitFor(() => {
      expect(screen.getAllByLabelText(CONDITION_TYPE_LABEL)).toHaveLength(4)
    })
  })

  it('shows the live preview for Grappler', () => {
    const editor = requirementExpressionToEditor(GRAPPLER.prerequisite)
    render(<EditorShell prerequisiteEditor={editor} />)

    expect(screen.getByText(formatRequirementEditorPreview(editor))).toBeInTheDocument()
  })

  it('populates condition type selects when editing Grappler', () => {
    render(
      <EditorShell prerequisiteEditor={requirementExpressionToEditor(GRAPPLER.prerequisite)} />,
    )

    const typeSelects = screen.getAllByLabelText(CONDITION_TYPE_LABEL)
    expect(typeSelects[0]).toHaveTextContent('Character level')
    expect(typeSelects[1]).toHaveTextContent('Ability score')
    expect(typeSelects[2]).toHaveTextContent('Ability score')
  })

  it('renders ability score conditions as an inline sentence with of and is at least', () => {
    render(
      <EditorShell prerequisiteEditor={requirementExpressionToEditor(GRAPPLER.prerequisite)} />,
    )

    expect(screen.getAllByText('of')).toHaveLength(2)
    expect(screen.getAllByText('is at least')).toHaveLength(3)
  })

  it('shows AND between condition sets and OR between rows in an any set', () => {
    render(
      <EditorShell prerequisiteEditor={requirementExpressionToEditor(GRAPPLER.prerequisite)} />,
    )

    expect(screen.getAllByText('AND')).toHaveLength(1)
    expect(screen.getAllByText('OR')).toHaveLength(1)
  })

  it('does not show within-set connectors for a single condition', () => {
    render(
      <EditorShell
        prerequisiteEditor={requirementExpressionToEditor({
          kind: 'minLevel',
          level: 4,
        })}
      />,
    )

    expect(screen.queryByText('AND')).not.toBeInTheDocument()
    expect(screen.queryByText('OR')).not.toBeInTheDocument()
  })

  it('updates preview when match rule radio changes', async () => {
    const user = userEvent.setup()
    render(
      <EditorShell prerequisiteEditor={requirementExpressionToEditor(GRAPPLER.prerequisite)} />,
    )

    const allRadios = screen.getAllByRole('radio', { name: /All of these must be true/i })
    await user.click(allRadios[1]!)

    await waitFor(() => {
      expect(screen.getByText('Requires Level 4+, Strength 13+, Dexterity 13+')).toBeInTheDocument()
    })
  })

  it('removes a condition set', async () => {
    const user = userEvent.setup()
    render(
      <EditorShell prerequisiteEditor={requirementExpressionToEditor(GRAPPLER.prerequisite)} />,
    )

    await user.click(screen.getByRole('button', { name: /Remove condition set 2/i }))

    await waitFor(() => {
      expect(screen.queryByRole('group', { name: 'Condition set 2' })).not.toBeInTheDocument()
    })
  })

  it('removes a condition row when the set has multiple conditions', async () => {
    const user = userEvent.setup()
    render(
      <EditorShell prerequisiteEditor={requirementExpressionToEditor(GRAPPLER.prerequisite)} />,
    )

    await user.click(
      screen.getByRole('button', { name: /Remove condition 2 from condition set 2/i }),
    )

    await waitFor(() => {
      expect(screen.getAllByLabelText(CONDITION_TYPE_LABEL)).toHaveLength(2)
    })
  })

  itAxe('has no axe accessibility violations', async () => {
    const { container } = render(
      <EditorShell prerequisiteEditor={requirementExpressionToEditor(GRAPPLER.prerequisite)} />,
    )
    await expectNoAxeViolations(container)
  })
})
