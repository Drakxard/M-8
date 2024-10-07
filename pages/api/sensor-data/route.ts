import { NextResponse } from 'next/server'
import clientPromise from '../../../lib/mongodb'

export async function GET() {
  try {
    const client = await clientPromise
    const db = client.db("compost")
    
    const data = await db.collection("datos").findOne({}, { sort: { 'fecha.$date': -1 } })
    
    if (!data) {
      return NextResponse.json({ error: 'No data found' }, { status: 404 })
    }
    
    return NextResponse.json(data)
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 })
  }
}