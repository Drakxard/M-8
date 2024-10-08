import type { NextApiRequest, NextApiResponse } from 'next'
import clientPromise from '../../lib/mongodb'
import { ObjectId, MongoClient } from 'mongodb'

interface SensorData {
  _id: ObjectId;
  prompt: string;
  result: string;
  timestamp: Date;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'GET') {
    try {
      const client: MongoClient = await clientPromise
      const db = client.db("compost")
      
      const limit = parseInt(req.query.limit as string) || 5
      const data = await db.collection<SensorData>("datos")
        .find({})
        .sort({ timestamp: -1 })
        .limit(limit)
        .toArray()
      
      if (!data.length) {
        return res.status(404).json({ error: 'No data found' })
      }
      
      const transformedData = data.map(item => ({
        ...item,
        _id: item._id.toString(),
        timestamp: item.timestamp.getTime(),
      }))
      
      return res.status(200).json(transformedData)
    } catch (e) {
      console.error(e)
      return res.status(500).json({ error: 'Failed to fetch data' })
    }
  } else {
    res.setHeader('Allow', ['GET'])
    res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}