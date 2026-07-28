import mongoose from 'mongoose'

import { loadEnv } from '../env'
import {
  resolveMongoTransactionCapability,
  setMongoTransactionsEnabled,
  type MongoTransactionMode,
} from './mongo-transaction'

let transactionCapabilityInitialized = false

/** Connect to MongoDB. Idempotent: returns immediately if already connected. */
export async function connectDb(
  uri: string,
  options?: { transactionMode?: MongoTransactionMode },
): Promise<typeof mongoose> {
  if (mongoose.connection.readyState === 1) {
    if (!transactionCapabilityInitialized) {
      await initializeMongoTransactionCapability(options?.transactionMode)
    }
    return mongoose
  }

  mongoose.set('strictQuery', true)
  await mongoose.connect(uri)
  await initializeMongoTransactionCapability(options?.transactionMode)
  return mongoose
}

export async function initializeMongoTransactionCapability(
  modeOverride?: MongoTransactionMode,
): Promise<void> {
  const mode = modeOverride ?? loadEnv().mongoTransactionMode
  const enabled = await resolveMongoTransactionCapability(mode)
  setMongoTransactionsEnabled(enabled)
  transactionCapabilityInitialized = true
}

export async function disconnectDb(): Promise<void> {
  await mongoose.disconnect()
  transactionCapabilityInitialized = false
}

/** Reset connection bookkeeping (used by tests). */
export function resetDbConnectionState(): void {
  transactionCapabilityInitialized = false
}
