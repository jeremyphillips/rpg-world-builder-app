/**
 * @vitest-environment jsdom
 */
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { RulesPreview } from './rules-preview'

describe('RulesPreview', () => {
  it('keeps caller order and emphasizes only rows that have a tail', () => {
    render(
      <RulesPreview
        label="Summary"
        context="Melee or Ranged"
        content={{
          kind: 'metadata',
          rows: [
            { id: 'attack', label: 'Attack', primary: '+5', secondary: 'STR +3' },
            { id: 'reach', label: 'Reach', primary: '5 ft' },
          ],
        }}
      />,
    )

    const list = screen.getByText('Attack').closest('dl')
    expect(list).toHaveClass('ui-metadata-list--emphasis-value')
    expect(list).toHaveTextContent('Attack')
    expect(screen.getByText('Attack').compareDocumentPosition(screen.getByText('Reach'))).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING,
    )

    const attackBonus = screen.getByText('+5')
    expect(attackBonus.tagName).toBe('STRONG')
    expect(attackBonus.closest('dd')).toHaveTextContent('STR +3')

    const reachValue = screen.getByText('5 ft')
    expect(reachValue.tagName).toBe('DD')
    expect(reachValue.querySelector('strong')).toBeNull()

    expect(screen.getByText('Summary')).toHaveClass('eyebrow-style-sm')
    expect(screen.getByText('Melee or Ranged')).toHaveClass('text-style-supporting')
    expect(screen.getByText('Summary').closest('.ui-panel')).toHaveClass('ui-panel--subtle')
    expect(screen.getByText('Summary').closest('.ui-panel')).toHaveClass('ui-panel--compact')
  })

  it('renders an optional title above the body with emphasis typography', () => {
    render(
      <RulesPreview
        label="Attack preview"
        title="Bite (Bear Form Only)"
        content={{
          kind: 'prose',
          text: 'Melee Weapon Attack: +5 to hit.',
        }}
      />,
    )

    const title = screen.getByText('Bite (Bear Form Only)')
    const body = screen.getByText('Melee Weapon Attack: +5 to hit.')
    expect(title).toHaveClass('text-style-emphasis')
    expect(title.compareDocumentPosition(body)).toBe(Node.DOCUMENT_POSITION_FOLLOWING)
    expect(screen.getByText('Attack preview').compareDocumentPosition(title)).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING,
    )
  })

  it('renders prose as body text and omits the label from the body', () => {
    render(
      <RulesPreview
        label="Trait preview"
        content={{
          kind: 'prose',
          text: 'The hell hound can burrow through solid rock.',
        }}
      />,
    )

    const sentence = screen.getByText('The hell hound can burrow through solid rock.')
    expect(sentence).toHaveClass('text-style-body')
    expect(sentence.closest('.ui-panel')).not.toHaveTextContent('Tunneler')
  })

  it('renders nothing for empty metadata or blank prose', () => {
    const { rerender, container } = render(
      <RulesPreview label="Summary" content={{ kind: 'metadata', rows: [] }} />,
    )
    expect(container).toBeEmptyDOMElement()

    rerender(<RulesPreview label="Summary" content={{ kind: 'prose', text: '   ' }} />)
    expect(container).toBeEmptyDOMElement()
  })

  it('renders html with rich text paragraphs', () => {
    render(
      <RulesPreview
        label="Spellcasting preview"
        content={{
          kind: 'html',
          html: '<p>Intro.</p><p><strong>At Will</strong>: <em>Mage Hand</em></p>',
        }}
      />,
    )

    expect(screen.getByText('At Will').tagName).toBe('STRONG')
    expect(screen.getByText('Intro.').closest('p')).not.toBeNull()
    expect(screen.getByText('Mage Hand').tagName).toBe('EM')
  })

  it('defaults the eyebrow label to Preview', () => {
    render(
      <RulesPreview
        content={{
          kind: 'prose',
          text: 'Body copy.',
        }}
      />,
    )
    expect(screen.getByText('Preview')).toHaveClass('eyebrow-style-sm')
  })

  it('renders introAndRules with introduction before rules prose', () => {
    render(
      <RulesPreview
        title="Spellcasting"
        content={{
          kind: 'introAndRules',
          introHtml: '<p>As a student of arcane magic, you have learned to cast spells.</p>',
          rulesDocument: [
            [
              { kind: 'lead', treatment: 'paragraph', label: 'Cantrips' },
              { kind: 'text', value: 'You know three Wizard cantrips of your choice.' },
            ],
          ],
        }}
      />,
    )

    const intro = screen.getByText(/student of arcane magic/)
    const rules = screen.getByText(/Wizard cantrips/)
    expect(intro.compareDocumentPosition(rules)).toBe(Node.DOCUMENT_POSITION_FOLLOWING)
    expect(screen.getByText('Cantrips:')).toBeTruthy()
    expect(screen.getByText(/Cantrips:/).parentElement).toHaveTextContent(
      'Cantrips: You know three Wizard cantrips of your choice.',
    )
  })

  it('renders guidance as neutral 12px copy inside the panel', () => {
    render(
      <RulesPreview
        label="Attack preview"
        content={{
          kind: 'guidance',
          message: 'Configure Attack bonus to calculate this attack.',
        }}
      />,
    )

    expect(screen.getByText('Attack preview')).toHaveClass('eyebrow-style-sm')
    const message = screen.getByText('Configure Attack bonus to calculate this attack.')
    expect(message.closest('.ui-semantic-text')).toHaveClass('ui-semantic-text--neutral')
    expect(message.closest('.text-style-caption')).not.toBeNull()
    expect(message.closest('.ui-panel')).toHaveClass('ui-panel--subtle')
  })
})
