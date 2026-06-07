import mongoose from 'mongoose'

/** Connect to MongoDB. Idempotent: returns immediately if already connected. */
export async function connectDb(uri: string): Promise<typeof mongoose> {
  if (mongoose.connection.readyState === 1) return mongoose
  mongoose.set('strictQuery', true)
  await mongoose.connect(uri)
  return mongoose
}

export async function disconnectDb(): Promise<void> {
  await mongoose.disconnect()
}
