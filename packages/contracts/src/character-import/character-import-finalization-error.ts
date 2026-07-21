import type { CharacterImportFinalizationIssue } from './assemble-import-create-input'

export class CharacterImportFinalizationError extends Error {
  readonly issues: CharacterImportFinalizationIssue[]

  constructor(issues: CharacterImportFinalizationIssue[]) {
    super(issues.map((issue) => issue.message).join(' '))
    this.name = 'CharacterImportFinalizationError'
    this.issues = issues
  }
}
