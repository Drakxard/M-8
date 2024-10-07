import type { NextApiRequest, NextApiResponse } from 'next'
import clientPromise from '../../lib/mongodb'
import { ObjectId } from 'mongodb'

interface Choice {
  index: number;
  message: { role: string; content: string };
  logprobs: null;
  finish_reason: string;
}

interface Usage {
  queue_time: number;
  prompt_tokens: number;
  prompt_time: number;
  completion_tokens: number;
  completion_time: number;
  total_tokens: number;
  total_time: number;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const client = await clientPromise
      const db = client.db("compost")
      
      const data = await db.collection("datos").findOne({}, { sort: { fecha: -1 } })
      
      if (!data) {
        return res.status(404).json({ error: 'No data found' })
      }
      
      // Transform the data to remove $ from field names
      const transformedData = {
        ...data,
        _id: (data._id as ObjectId).toString(),
        fecha: data.fecha instanceof Date ? data.fecha.getTime() : data.fecha,
        respuesta: {
          ...data.respuesta,
          created: typeof data.respuesta.created === 'object' && '$numberInt' in data.respuesta.created
            ? parseInt(data.respuesta.created.$numberInt)
            : data.respuesta.created,
          choices: (data.respuesta.choices as Choice[]).map((choice: Choice) => ({
            ...choice,
            index: typeof choice.index === 'object' && '$numberInt' in choice.index
              ? parseInt(choice.index.$numberInt)
              : choice.index
          })),
          usage: Object.entries(data.respuesta.usage as Usage).reduce((acc, [key, value]) => {
            acc[key] = typeof value === 'object' && ('$numberDouble' in value || '$numberInt' in value)
              ? parseFloat(value.$numberDouble || value.$numberInt)
              : value
            return acc
          }, {} as Usage)
        }
      }
      
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