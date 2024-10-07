import type { NextApiRequest, NextApiResponse } from 'next'
import clientPromise from '../../lib/mongodb'
import { ObjectId, MongoClient } from 'mongodb'

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

interface SensorData {
  _id: ObjectId;
  messages: Array<{
    role: string;
    content: Array<{ type: string; text?: string; image_url?: { url: string } }>;
  }>;
  model: string;
  respuesta: {
    id: string;
    object: string;
    created: number;
    model: string;
    choices: Choice[];
    usage: Usage;
    system_fingerprint: string;
    x_groq: { id: string };
  };
  fecha: Date;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'GET') {
    try {
      const client: MongoClient = await clientPromise
      const db = client.db("compost")
      
      const data = await db.collection<SensorData>("datos").findOne({}, { sort: { fecha: -1 } })
      
      if (!data) {
        return res.status(404).json({ error: 'No data found' })
      }
      
      // Transform the data to remove $ from field names
      const transformedData = {
        ...data,
        _id: data._id.toString(),
        fecha: data.fecha.getTime(),
        respuesta: {
          ...data.respuesta,
          choices: data.respuesta.choices.map((choice: Choice) => ({
            ...choice,
            index: choice.index
          })),
          usage: Object.entries(data.respuesta.usage).reduce((acc: Partial<Usage>, [key, value]) => {
            acc[key as keyof Usage] = value
            return acc
          }, {})
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