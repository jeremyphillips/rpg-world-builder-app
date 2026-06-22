import { Spinner, Text } from '@rpg/ui'

export function SubclassCreateGate() {
  return (
    <div className="rounded-lg border border-dashed border-border p-8 text-center">
      <Text variant="muted">Save this class first to add subclasses.</Text>
    </div>
  )
}

export function SubclassChoiceLevelGate() {
  return (
    <div className="rounded-lg border border-dashed border-border p-8 text-center">
      <Text variant="muted">
        Set a subclass choice level on the <strong>Basics</strong> tab before authoring subclasses.
      </Text>
    </div>
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
    <div className="rounded-lg border border-dashed border-border p-8 text-center">
      <Text variant="muted">Select a subclass or add a new one.</Text>
    </div>
  )
}
