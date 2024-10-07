import { MongoClient } from 'mongodb'

const uri = process.env.MONGODB_URI

if (!uri) {
  throw new Error('Please add your Mongo URI to .env.local')
}

let client: MongoClient
let clientPromise: Promise<MongoClient>

if (process.env.NODE_ENV === 'development') {
  // En desarrollo, usar variable global para que el cliente no se reconecte en cada cambio
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri)
    global._mongoClientPromise = client.connect()
  }
  clientPromise = global._mongoClientPromise
} else {
  // En producción, crear nuevo cliente cada vez
  client = new MongoClient(uri)
  clientPromise = client.connect()
}

export default clientPromise;