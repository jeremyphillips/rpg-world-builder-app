/**
 * Shared `vi.mock('@rpg/ui/form')` factory that stubs `FormItems` with a
 * lightweight marker div, so tab/panel tests can assert which field group is
 * mounted without rendering the full schema-driven form.
 *
 * `vi.mock` factories are hoisted, so consume this via a dynamic import:
 *
 * @example
 * vi.mock('@rpg/ui/form', async (importOriginal) => {
 *   const { stubUiFormItems } = await import('@/test/mocks/ui-form')
 *   return stubUiFormItems(importOriginal)
 * })
 *
 * // then in tests (namePrefix dots become dashes):
 * expect(screen.getByTestId('detail-characterCreation-multiclassing')).toBeInTheDocument()
 */
export async function stubUiFormItems(
  importOriginal: () => Promise<unknown>,
  testId: string | ((namePrefix?: string) => string) = defaultTestId,
) {
  const actual = (await importOriginal()) as Record<string, unknown>
  return {
    ...actual,
    FormItems: ({ namePrefix }: { namePrefix?: string }) => (
      <div data-testid={typeof testId === 'string' ? testId : testId(namePrefix)}>{namePrefix}</div>
    ),
  }
}

function defaultTestId(namePrefix?: string): string {
  return `detail-${namePrefix?.replace(/\./g, '-')}`
}
