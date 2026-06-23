import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import axe from 'axe-core'
import { FormProvider, useForm } from 'react-hook-form'
import { describe, expect, it } from 'vitest'

import { GRAPPLER } from '../feats/fixtures'
import {
  ADD_REQUIREMENT_GROUP_LABEL,
  ADD_REQUIREMENT_LABEL,
} from '../lib/requirement-editor-constants'
import {
  formatRequirementEditorPreview,
  requirementEditorDefaultValue,
  requirementExpressionToEditor,
  type PrerequisiteEditorValue,
} from '../lib/requirement-editor-form'
import { RequirementEditor } from './requirement-editor.client'

const axeOptions = { rules: { 'color-contrast': { enabled: false } } }

function EditorShell({
  prerequisiteEditor = requirementEditorDefaultValue(),
}: {
  prerequisiteEditor?: PrerequisiteEditorValue
}) {
  const form = useForm({ defaultValues: { prerequisiteEditor } })
  return (
    <FormProvider {...form}>
      <RequirementEditor name="prerequisiteEditor" />
    </FormProvider>
  )
}

describe('RequirementEditor', () => {
  it('renders an empty state with add group control and preview', () => {
    render(<EditorShell />)

    expect(screen.getByRole('button', { name: ADD_REQUIREMENT_GROUP_LABEL })).toBeInTheDocument()
    expect(screen.getByText('No prerequisites')).toBeInTheDocument()
  })

  it('adds a requirement group with a default leaf row', async () => {
    const user = userEvent.setup()
    render(<EditorShell />)

    await user.click(screen.getByRole('button', { name: ADD_REQUIREMENT_GROUP_LABEL }))

    await waitFor(() => {
      expect(screen.getByRole('group', { name: /Requirement group 1/i })).toBeInTheDocument()
    })
    expect(screen.getByLabelText(/Minimum level/i)).toBeInTheDocument()
  })

  it('adds another requirement within a group', async () => {
    const user = userEvent.setup()
    render(
      <EditorShell prerequisiteEditor={requirementExpressionToEditor(GRAPPLER.prerequisite)} />,
    )

    const addRequirementButtons = screen.getAllByRole('button', { name: ADD_REQUIREMENT_LABEL })
    await user.click(addRequirementButtons[0]!)

    await waitFor(() => {
      expect(screen.getAllByLabelText(/Requirement type/i)).toHaveLength(4)
    })
  })

  it('shows the live preview for Grappler', () => {
    const editor = requirementExpressionToEditor(GRAPPLER.prerequisite)
    render(<EditorShell prerequisiteEditor={editor} />)

    expect(screen.getByText(formatRequirementEditorPreview(editor))).toBeInTheDocument()
  })

  it('removes a requirement group', async () => {
    const user = userEvent.setup()
    render(
      <EditorShell prerequisiteEditor={requirementExpressionToEditor(GRAPPLER.prerequisite)} />,
    )

    await user.click(screen.getByRole('button', { name: /Remove requirement group 2/i }))

    await waitFor(() => {
      expect(screen.queryByRole('group', { name: /Requirement group 2/i })).not.toBeInTheDocument()
    })
  })

  it('has no axe accessibility violations', async () => {
    const { container } = render(
      <EditorShell prerequisiteEditor={requirementExpressionToEditor(GRAPPLER.prerequisite)} />,
    )
    const results = await axe.run(container, axeOptions)
    expect(results.violations).toEqual([])
  })
})
