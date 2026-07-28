import type { ClientSession } from 'mongoose'
import mongoose from 'mongoose'

export type MongoTransactionMode = 'auto' | 'required' | 'disabled'

let transactionsEnabled = false

export function setMongoTransactionsEnabled(enabled: boolean): void {
  transactionsEnabled = enabled
}

export function areMongoTransactionsEnabled(): boolean {
  return transactionsEnabled
}

/** Reset transaction capability state (used by tests). */
export function resetMongoTransactionState(): void {
  transactionsEnabled = false
}

export async function detectMongoTransactionSupport(): Promise<boolean> {
  const db = mongoose.connection.db
  if (!db) return false

  try {
    const hello = (await db.admin().command({ hello: 1 })) as {
      setName?: string
      msg?: string
    }

    // Standalone mongod has neither a replica set name nor the mongos marker.
    return Boolean(hello.setName) || hello.msg === 'isdbgrid'
  } catch {
    return false
  }
}

export async function resolveMongoTransactionCapability(
  mode: MongoTransactionMode,
): Promise<boolean> {
  if (mode === 'disabled') return false

  const supported = await detectMongoTransactionSupport()
  if (mode === 'required' && !supported) {
    throw new Error(
      'MONGO_TRANSACTION_MODE=required but the MongoDB deployment does not support transactions.',
    )
  }

  return mode === 'required' || (mode === 'auto' && supported)
}

export async function runInTransaction<T>(
  callback: (session: ClientSession) => Promise<T>,
): Promise<T> {
  if (!transactionsEnabled) {
    throw new Error('MongoDB transactions are not enabled for this process.')
  }

  const session = await mongoose.startSession()
  try {
    return await session.withTransaction(() => callback(session))
  } finally {
    await session.endSession()
  }
}
