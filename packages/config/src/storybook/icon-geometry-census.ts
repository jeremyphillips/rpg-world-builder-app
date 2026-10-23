export type IconGeometryCensusEntry = {
  identity: string | null
  width: string
  height: string
  strokeWidth: string
  ownerSizeResolved?: boolean
}

type CensusPage = {
  evaluate: <T>(pageFunction: () => T) => Promise<T>
}

/** Geometry of every svg in the open story. Identity is data-icon, else the lucide name. */
export async function collectIconGeometryCensus(
  page: CensusPage,
): Promise<IconGeometryCensusEntry[]> {
  return page.evaluate(() => {
    function px(value: string): string {
      const parsed = Number.parseFloat(value)
      if (!Number.isFinite(parsed)) return value
      const rounded = Math.round(parsed * 100) / 100
      return `${rounded}px`
    }

    return [...document.querySelectorAll('svg')].map((svg) => {
      const style = getComputedStyle(svg)
      const dataIcon = svg.getAttribute('data-icon')
      const lucideName = [...svg.classList]
        .filter((className) => className.startsWith('lucide-'))
        .map((className) => className.slice('lucide-'.length))
        .find((name) => name.length > 0)
      const entry: {
        identity: string | null
        width: string
        height: string
        strokeWidth: string
        ownerSizeResolved?: boolean
      } = {
        identity: dataIcon ?? lucideName ?? null,
        width: px(style.width),
        height: px(style.height),
        strokeWidth: px(style.strokeWidth),
      }
      if (svg.classList.contains('ui-icon--owner')) {
        const raw = style.getPropertyValue('--icon-size').trim()
        entry.ownerSizeResolved =
          raw !== '' &&
          raw !== 'unset' &&
          raw !== 'initial' &&
          raw !== 'inherit' &&
          !raw.includes('var(')
      }
      return entry
    })
  })
}

export function assertResolvedOwnerIconSizes(census: readonly IconGeometryCensusEntry[]): void {
  const unresolved = census.filter((entry) => entry.ownerSizeResolved === false)
  if (unresolved.length === 0) return
  throw new Error(
    `Icon size="owner" has no resolved --icon-size (${unresolved.length}): ${JSON.stringify(unresolved)}`,
  )
}

export function snapshotIconGeometryCensus(census: readonly IconGeometryCensusEntry[]): void {
  const jestExpect = (
    globalThis as {
      expect?: (actual: unknown) => { toMatchSnapshot: () => void }
    }
  ).expect
  if (!jestExpect) {
    throw new Error('Icon geometry census requires Jest expect from the Storybook test runner.')
  }
  jestExpect(census).toMatchSnapshot()
}
