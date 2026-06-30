import type { Meta, StoryObj } from '@storybook/react-vite'
import { FormProvider, useForm } from 'react-hook-form'
import { FormSectionProvider } from '@rpg/ui/form'

import { GRAPPLER } from '../feats/fixtures'
import {
  requirementEditorDefaultValue,
  requirementExpressionToEditor,
  type PrerequisiteEditorValue,
} from '../lib/requirement-editor-form'
import { RequirementEditor } from './requirement-editor.client'

const meta = {
  title: 'Content/RequirementEditor',
  parameters: { layout: 'padded' },
} satisfies Meta

export default meta
type Story = StoryObj

function EditorStory({
  prerequisiteEditor = requirementEditorDefaultValue(),
  size,
}: {
  prerequisiteEditor?: PrerequisiteEditorValue
  size?: 'md'
}) {
  const form = useForm({ defaultValues: { prerequisiteEditor } })
  return (
    <FormProvider {...form}>
      <FormSectionProvider rhythm="compact" size={size}>
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
      size="md"
      prerequisiteEditor={requirementExpressionToEditor(GRAPPLER.prerequisite)}
    />
  ),
}
