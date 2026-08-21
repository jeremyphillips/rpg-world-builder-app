import type { Meta, StoryObj } from '@storybook/react-vite'
import { FormProvider, useForm } from 'react-hook-form'
import { FormSectionProvider } from '@rpg/ui/form'

import { GRAPPLER } from '../fixtures'
import {
  requirementEditorDefaultValue,
  type PrerequisiteEditorValue,
} from '../lib/requirement-editor-form-schema'
import { requirementExpressionToEditor } from '../lib/requirement-editor-form-values'
import { RequirementEditor } from './requirement-editor'

const meta = {
  title: 'Content/RequirementEditor',
  parameters: { layout: 'padded' },
} satisfies Meta

export default meta
type Story = StoryObj

function EditorStory({
  prerequisiteEditor = requirementEditorDefaultValue(),
  density,
}: {
  prerequisiteEditor?: PrerequisiteEditorValue
  density?: 'comfortable'
}) {
  const form = useForm({ defaultValues: { prerequisiteEditor } })
  return (
    <FormProvider {...form}>
      <FormSectionProvider density={density ?? 'compact'}>
        <RequirementEditor name="prerequisiteEditor" />
      </FormSectionProvider>
    </FormProvider>
  )
}

export const Empty: Story = {
  render: () => <EditorStory />,
}

export const Grappler: Story = {
  render: () => (
    <EditorStory prerequisiteEditor={requirementExpressionToEditor(GRAPPLER.prerequisite)} />
  ),
}

export const SpellRecall: Story = {
  render: () => (
    <EditorStory
      prerequisiteEditor={requirementExpressionToEditor({
        kind: 'all',
        requirements: [{ kind: 'minLevel', level: 19 }, { kind: 'spellcasting' }],
      })}
    />
  ),
}

export const MediumScale: Story = {
  render: () => (
    <EditorStory
      density="comfortable"
      prerequisiteEditor={requirementExpressionToEditor(GRAPPLER.prerequisite)}
    />
  ),
}
