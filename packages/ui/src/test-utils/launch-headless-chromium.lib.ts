import { chromium, type Browser } from 'playwright'

/**
 * Prefer Playwright's bundled Chromium (CI / `playwright:install`) over a system Chrome channel.
 */
export async function launchHeadlessChromium(): Promise<Browser> {
  try {
    return await chromium.launch({ headless: true })
  } catch (bundledError) {
    try {
      return await chromium.launch({ channel: 'chrome', headless: true })
    } catch (chromeError) {
      throw new Error(
        'Browser checks need Playwright Chromium (`pnpm --filter <pkg> playwright:install`) or a local Chrome install.',
        { cause: bundledError instanceof Error ? bundledError : chromeError },
      )
    }
  }
}
