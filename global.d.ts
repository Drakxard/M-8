// global.d.ts
import { MongoClient } from 'mongodb'

declare global {
  var _mongoClientPromise: Promise<MongoClient> | undefined
}

// Esto asegura que el archivo se trate como un módulo.
export {}
