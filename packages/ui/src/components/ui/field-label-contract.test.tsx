import { createRequire } from 'node:module'
import { readFileSync, realpathSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

import { render, screen } from '@testing-library/react'
import type { Browser } from 'playwright'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { z } from 'zod'

import { Form } from '../../form/shells/form.client'
import { launchHeadlessChromium } from '../../test-utils/launch-headless-chromium.lib'
import { ChipsField } from './chips-field.client'
import { ChooseCountFieldShell } from './choose-count-field-shell.client'
import { fieldLabelVariants } from './field.variants'
import { FieldRow } from './field-row'
import { FieldRowAnatomyProvider } from './field-row-anatomy.context'
import { InlineSentenceField } from './inline-sentence-field.client'
import { RadioGroupField } from './radio-group-field'

const options = [
  { value: 'medium', label: 'Medium' },
  { value: 'large', label: 'Large' },
]

const here = dirname(fileURLToPath(import.meta.url))

function expectGroupName(
  role: 'group' | 'radiogroup',
  name: string,
  size: 'sm' | 'md',
  visibility: 'visible' | 'srOnly' = 'visible',
) {
  const group = screen.getByRole(role, { name })
  const labelId = group.getAttribute('aria-labelledby')
  expect(labelId).toBeTruthy()
  const label = document.getElementById(labelId!)
  expect(label?.tagName).toBe('SPAN')
  expect(label?.closest('legend')).toBeNull()
  expect(label).toHaveClass(...fieldLabelVariants({ size }).split(/\s+/))
  if (visibility === 'srOnly') expect(label).toHaveClass('sr-only')
  else expect(label).not.toHaveClass('sr-only')
  return label
}

describe('field label contract', () => {
  it('names a standalone chips field with the radio label span', () => {
    render(
      <>
        <RadioGroupField
          id="availability"
          label="Form availability"
          size="md"
          options={[{ value: 'all', label: 'All forms' }]}
        />
        <ChipsField id="forms" label="Forms" size="md" options={options} value={[]} />
      </>,
    )

    const radio = expectGroupName('radiogroup', 'Form availability', 'md')
    const chips = expectGroupName('group', 'Forms', 'md')
    expect(chips?.className).toBe(radio?.className)
  })

  it('names schema chips, row chips, and choose-count with that span', () => {
    render(
      <>
        <Form
          schema={z.object({ sizes: z.array(z.string()).optional() })}
          fields={[
            {
              type: 'chips',
              name: 'sizes',
              label: 'Sizes',
              options,
            },
          ]}
          onSubmit={() => undefined}
        />
        <FieldRowAnatomyProvider>
          <ChipsField id="row-sizes" label="Row sizes" size="sm" options={options} value={[]} />
        </FieldRowAnatomyProvider>
        <ChooseCountFieldShell id="choose" label="Choose count" size="md">
          {() => <span>Choose</span>}
        </ChooseCountFieldShell>
        <FieldRow>
          <InlineSentenceField
            id="range"
            label="Range"
            size="sm"
            width="full"
            segments={[{ kind: 'text', value: 'ft.' }]}
            controls={[]}
          />
        </FieldRow>
      </>,
    )

    expectGroupName('group', 'Sizes', 'md')
    expectGroupName('group', 'Row sizes', 'sm')
    expectGroupName('group', 'Choose count', 'md')
    expectGroupName('group', 'Range', 'sm')
  })

  it('keeps an sr-only chips name on the same span', () => {
    render(
      <ChipsField
        id="hidden-forms"
        label="Forms"
        labelVisibility="srOnly"
        size="md"
        options={options}
        value={[]}
      />,
    )

    expectGroupName('group', 'Forms', 'md', 'srOnly')
  })

  it('does not let leaf chip or choose-count chrome paint a contents legend', () => {
    const chips = readFileSync(join(here, 'chips-field.client.tsx'), 'utf8')
    const chooseCount = readFileSync(join(here, 'choose-count-field-shell.client.tsx'), 'utf8')
    expect(chips).not.toContain('fieldSetInFlowLegendClasses')
    expect(chooseCount).not.toContain('fieldSetInFlowLegendClasses')
  })
})

type TailwindNode = {
  compile: (
    css: string,
    options: { base: string; from: string; onDependency: () => void },
  ) => Promise<{ build: (candidates: string[]) => string }>
}

function loadTailwindNode(): TailwindNode {
  const fromUi = createRequire(import.meta.url)
  const viteEntry = realpathSync(fromUi.resolve('@tailwindcss/vite'))
  const vitePackage = join(dirname(viteEntry), '..', 'package.json')
  return createRequire(vitePackage)('@tailwindcss/node') as TailwindNode
}

const labelMd = fieldLabelVariants({ size: 'md' })
const labelSm = fieldLabelVariants({ size: 'sm' })

describe('field label computed type', () => {
  let browser: Browser
  let css: string

  beforeAll(async () => {
    const tailwind = loadTailwindNode()
    const globalsPath = join(here, '../../styles/globals.css')
    const compiler = await tailwind.compile(readFileSync(globalsPath, 'utf8'), {
      base: dirname(globalsPath),
      from: globalsPath,
      onDependency() {},
    })
    css = compiler.build([
      ...labelMd.split(/\s+/),
      ...labelSm.split(/\s+/),
      'text-style-field-label-md',
      'text-style-field-label-sm',
    ])
    browser = await launchHeadlessChromium()
  }, 180_000)

  afterAll(async () => {
    await browser?.close()
  })

  it('resolves the radio and chips names to the same type', async () => {
    const page = await browser.newPage()
    await page.setContent(`<!doctype html>
      <body>
        <span id="radio-md" class="${labelMd}">Form availability</span>
        <span id="chips-md" class="${labelMd}">Forms</span>
        <span id="radio-sm" class="${labelSm}">Form availability</span>
        <span id="chips-sm" class="${labelSm}">Forms</span>
        <legend id="ua-legend">Forms</legend>
      </body>`)
    await page.addStyleTag({ content: css })

    const type = await page.evaluate(() => {
      const read = (id: string) => {
        const style = getComputedStyle(document.getElementById(id)!)
        return {
          fontFamily: style.fontFamily,
          fontSize: style.fontSize,
          fontWeight: style.fontWeight,
          lineHeight: style.lineHeight,
          color: style.color,
        }
      }
      return {
        radioMd: read('radio-md'),
        chipsMd: read('chips-md'),
        radioSm: read('radio-sm'),
        chipsSm: read('chips-sm'),
        legend: read('ua-legend'),
      }
    })
    await page.close()

    expect(type.chipsMd).toEqual(type.radioMd)
    expect(type.chipsSm).toEqual(type.radioSm)
    expect(type.chipsMd.fontSize).not.toBe(type.chipsSm.fontSize)
    expect(type.chipsMd.fontWeight).not.toBe(type.legend.fontWeight)
  })
})
