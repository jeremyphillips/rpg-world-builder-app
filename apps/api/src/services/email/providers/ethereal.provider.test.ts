import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('nodemailer', () => ({
  default: {
    createTestAccount: vi.fn(),
    createTransport: vi.fn(),
    getTestMessageUrl: vi.fn(),
  },
}))

import nodemailer from 'nodemailer'
import type { TestAccount } from 'nodemailer'

import { createEtherealEmailProvider } from './ethereal.provider'

const createTestAccount = vi.mocked(nodemailer.createTestAccount)
const createTransport = vi.mocked(nodemailer.createTransport)
const getTestMessageUrl = vi.mocked(nodemailer.getTestMessageUrl)

const testMessage = {
  to: { email: 'player@example.com', name: 'Player' },
  subject: 'Test invite',
  text: 'plain text',
  html: '<p>html</p>',
}

describe('ethereal email provider', () => {
  const sendMail = vi.fn()

  beforeEach(() => {
    createTestAccount.mockResolvedValue({
      user: 'test-user',
      pass: 'test-pass',
      smtp: { host: 'smtp.ethereal.email', port: 587, secure: false },
      imap: { host: 'imap.ethereal.email', port: 993, secure: true },
      pop3: { host: 'pop3.ethereal.email', port: 995, secure: true },
      web: 'https://ethereal.email',
    } satisfies TestAccount)
    sendMail.mockResolvedValue({ messageId: 'test-id' })
    createTransport.mockReturnValue({ sendMail } as unknown as ReturnType<
      typeof nodemailer.createTransport
    >)
  })

  afterEach(() => {
    vi.clearAllMocks()
    vi.restoreAllMocks()
  })

  it('logs the Ethereal preview URL after a successful send', async () => {
    const consoleInfo = vi.spyOn(console, 'info').mockImplementation(() => undefined)
    getTestMessageUrl.mockReturnValue('https://ethereal.email/message/abc')

    const provider = createEtherealEmailProvider({ fromAddress: 'no-reply@localhost' })
    const result = await provider.send(testMessage)

    expect(result).toEqual({ ok: true })
    expect(sendMail).toHaveBeenCalledWith({
      from: 'no-reply@localhost',
      to: 'Player <player@example.com>',
      subject: testMessage.subject,
      text: testMessage.text,
      html: testMessage.html,
    })
    expect(getTestMessageUrl).toHaveBeenCalledWith({ messageId: 'test-id' })
    expect(consoleInfo).toHaveBeenCalledWith(
      '[email] Ethereal preview: https://ethereal.email/message/abc',
    )
  })

  it('does not log when getTestMessageUrl returns a falsy value', async () => {
    const consoleInfo = vi.spyOn(console, 'info').mockImplementation(() => undefined)
    getTestMessageUrl.mockReturnValue(false)

    const provider = createEtherealEmailProvider({ fromAddress: 'no-reply@localhost' })
    const result = await provider.send(testMessage)

    expect(result).toEqual({ ok: true })
    expect(consoleInfo).not.toHaveBeenCalled()
  })

  it('returns ethereal_send_failed without logging when sendMail throws', async () => {
    const consoleInfo = vi.spyOn(console, 'info').mockImplementation(() => undefined)
    sendMail.mockRejectedValue(new Error('send failed'))

    const provider = createEtherealEmailProvider({ fromAddress: 'no-reply@localhost' })
    const result = await provider.send(testMessage)

    expect(result).toEqual({ ok: false, errorCode: 'ethereal_send_failed' })
    expect(getTestMessageUrl).not.toHaveBeenCalled()
    expect(consoleInfo).not.toHaveBeenCalled()
  })
})
