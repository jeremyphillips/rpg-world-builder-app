import { InsetPanel, Spinner } from '@rpg/ui'

export function SubclassCreateGate() {
  return (
    <InsetPanel borderStyle="dashed" surface="sunken" size="lg" align="center">
      <InsetPanel.Text>Save this class first to add subclasses.</InsetPanel.Text>
    </InsetPanel>
  )
}

export function SubclassChoiceLevelGate() {
  return (
    <InsetPanel borderStyle="dashed" surface="sunken" size="lg" align="center">
      <InsetPanel.Text>
        Add a subclass choice feature on the <strong>Features</strong> tab before authoring
        subclasses.
      </InsetPanel.Text>
    </InsetPanel>
  )
}

export function SubclassLoadingGate() {
  return (
    <div className="flex justify-center py-12">
      <Spinner aria-label="Loading subclasses" />
    </div>
  )
}

export function SubclassEmptySelectionGate() {
  return (
    <InsetPanel borderStyle="dashed" surface="none" size="lg" align="center">
      <InsetPanel.Text>Select a subclass or add a new one.</InsetPanel.Text>
    </InsetPanel>
  )
}
