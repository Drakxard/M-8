import type { NextApiRequest, NextApiResponse } from 'next'
import clientPromise from '../../lib/mongodb'

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
        fecha: data.fecha instanceof Date ? data.fecha.getTime() : data.fecha,
        respuesta: {
          ...data.respuesta,
          created: data.respuesta.created.$numberInt || data.respuesta.created,
          choices: data.respuesta.choices.map((choice: any) => ({
            ...choice,
            index: choice.index.$numberInt || choice.index
          })),
          usage: Object.entries(data.respuesta.usage).reduce((acc: any, [key, value]: [string, any]) => {
            acc[key] = value.$numberDouble || value.$numberInt || value
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