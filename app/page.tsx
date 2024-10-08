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
  ChartOptions,
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
  prompt: string;
  result: string;
  timestamp: number;
}

export default function Home() {
  const [data, setData] = useState<SensorData[]>([])
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
    const fetchData = async () => {
      try {
        const response = await fetch('/api/sensor-data')
        if (!response.ok) {
          throw new Error('Failed to fetch data')
        }
        const result: SensorData[] = await response.json()
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
    labels: data.map(item => new Date(item.timestamp).toLocaleString()),
    datasets: [
      {
        label: 'Result Length',
        data: data.map(item => item.result.length),
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
      },
    ],
  }

  const chartOptions: ChartOptions<'line'> = {
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
          text: 'Result Length',
        },
      },
    },
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">
        {isClient ? "Sensor Data" : "Datos del sensor"}
      </h1>
      {data.length > 0 && (
        <div className="mb-4">
          <h2 className="text-xl font-semibold">Latest Data:</h2>
          <p>Timestamp: {new Date(data[0].timestamp).toLocaleString()}</p>
          <p>Prompt: {data[0].prompt}</p>
          <p>Result: {data[0].result}</p>
        </div>
      )}
      <div className="w-full h-96">
        {isClient && data.length > 0 && <Line data={chartData} options={chartOptions} />}
      </div>
    </div>
  )
}