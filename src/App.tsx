import React, { useEffect } from 'react'
import { SimulationProvider, useSimulationStore } from './store/SimulationProvider'
import Simulation3D from './components/Simulation3D'

// Simulation component that runs the game loop
const Simulation: React.FC = () => {
  const { simulate, isPaused, speed } = useSimulationStore()

  useEffect(() => {
    const interval = setInterval(() => {
      if (!isPaused) {
        simulate()
      }
    }, 100) // Run simulation every 100ms

    return () => clearInterval(interval)
  }, [simulate, isPaused, speed])

  return null
}



function App() {
  return (
    <SimulationProvider>
      <div className="simulation-container">
        <Simulation3D />
        <Simulation />
      </div>
    </SimulationProvider>
  )
}

export default App 