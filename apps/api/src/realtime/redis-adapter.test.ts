import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { Server } from 'socket.io'

const connect = vi.hoisted(() => vi.fn(async () => undefined))
const duplicate = vi.hoisted(() => vi.fn())
const on = vi.hoisted(() => vi.fn())
const quit = vi.hoisted(() => vi.fn(async () => undefined))
const createClient = vi.hoisted(() =>
  vi.fn(() => ({
    connect: connect,
    duplicate: duplicate,
    on: on,
    quit: quit,
  })),
)
const createAdapter = vi.hoisted(() => vi.fn(() => ({})))

vi.mock('redis', () => ({
  createClient,
}))

vi.mock('@socket.io/redis-adapter', () => ({
  createAdapter,
}))

import { loadEnv, resetEnv } from '../env'
import {
  closeSocketIoAdapter,
  configureSocketIoAdapter,
  resetSocketIoAdapterForTests,
} from './redis-adapter'

describe('configureSocketIoAdapter', () => {
  beforeEach(() => {
    delete process.env.REDIS_URL
    resetEnv()
    resetSocketIoAdapterForTests()
    createClient.mockClear()
    createAdapter.mockClear()
    connect.mockClear()
    duplicate.mockClear()
    on.mockClear()
    quit.mockClear()
    duplicate.mockReturnValue({ connect, on, quit })
  })

  it('skips Redis when REDIS_URL is unset', async () => {
    const io = { adapter: vi.fn() } as unknown as Server

    await configureSocketIoAdapter(io)

    expect(createClient).not.toHaveBeenCalled()
    expect(io.adapter).not.toHaveBeenCalled()
  })

  it('connects pub/sub clients and installs the adapter when REDIS_URL is set', async () => {
    process.env.REDIS_URL = 'redis://127.0.0.1:6379'
    loadEnv()

    const io = { adapter: vi.fn() } as unknown as Server
    await configureSocketIoAdapter(io)

    expect(createClient).toHaveBeenCalledWith({ url: 'redis://127.0.0.1:6379' })
    expect(duplicate).toHaveBeenCalledTimes(1)
    expect(connect).toHaveBeenCalledTimes(2)
    expect(createAdapter).toHaveBeenCalledTimes(1)
    expect(io.adapter).toHaveBeenCalledTimes(1)

    delete process.env.REDIS_URL
    resetEnv()
  })

  it('closes redis clients on shutdown', async () => {
    process.env.REDIS_URL = 'redis://127.0.0.1:6379'
    loadEnv()

    const io = { adapter: vi.fn() } as unknown as Server
    await configureSocketIoAdapter(io)
    await closeSocketIoAdapter()

    expect(quit).toHaveBeenCalledTimes(2)

    delete process.env.REDIS_URL
    resetEnv()
  })
})
