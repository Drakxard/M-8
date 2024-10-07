'use client'

import { useState, useEffect } from 'react'
import { Line } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
)

interface SensorData {
  _id: string;
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
    choices: Array<{
      index: number;
      message: { role: string; content: string };
      logprobs: null;
      finish_reason: string;
    }>;
    usage: {
      queue_time: number;
      prompt_tokens: number;
      prompt_time: number;
      completion_tokens: number;
      completion_time: number;
      total_tokens: number;
      total_time: number;
    };
    system_fingerprint: string;
    x_groq: { id: string };
  };
  fecha: number;
}

export default function Home() {
  const [data, setData] = useState<SensorData | null>(null)
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
    const fetchData = async () => {
      try {
        const response = await fetch('/api/sensor-data')
        if (!response.ok) {
          throw new Error('Failed to fetch data')
        }
        const result: SensorData = await response.json()
        setData(result)
      } catch (error) {
        console.error('Error fetching data:', error)
      }
    }

    fetchData()
    const interval = setInterval(fetchData, 30000) // Update every 30 seconds

    return () => clearInterval(interval)
  }, [])

  const chartData = {
    labels: data ? [new Date(data.fecha).toLocaleString()] : [],
    datasets: [
      {
        label: 'Tokens Used',
        data: data ? [data.respuesta.usage.total_tokens] : [],
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
      },
    ],
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        type: 'category' as const,
        title: {
          display: true,
          text: 'Time',
        },
      },
      y: {
        title: {
          display: true,
          text: 'Tokens',
        },
      },
    },
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">
        {isClient ? "Sensor Data" : "Datos del sensor"}
      </h1>
      {data && (
        <div className="mb-4">
          <h2 className="text-xl font-semibold">Latest Data:</h2>
          <p>Model: {data.model}</p>
          <p>Created: {new Date(data.respuesta.created * 1000).toLocaleString()}</p>
          <p>Total Tokens: {data.respuesta.usage.total_tokens}</p>
          <p>AI Response: {data.respuesta.choices[0].message.content}</p>
        </div>
      )}
    </div>
  )
}