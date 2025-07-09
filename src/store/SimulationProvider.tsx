import React, { createContext, useContext, useEffect, useRef } from 'react'
import { useSimulationStore } from './simulationStore'

// Re-export useSimulationStore for convenience
export { useSimulationStore }

interface SimulationContextType {
  // Add any additional context values here if needed
}

const SimulationContext = createContext<SimulationContextType | undefined>(undefined)

export const useSimulationContext = () => {
  const context = useContext(SimulationContext)
  if (!context) {
    throw new Error('useSimulationContext must be used within a SimulationProvider')
  }
  return context
}

interface SimulationProviderProps {
  children: React.ReactNode
}

export const SimulationProvider: React.FC<SimulationProviderProps> = ({ children }) => {
  const simulate = useSimulationStore(state => state.simulate)
  const isPaused = useSimulationStore(state => state.isPaused)
  const speed = useSimulationStore(state => state.speed)
  const animationRef = useRef<number>()

  useEffect(() => {
    const animate = () => {
      if (!isPaused) {
        simulate()
      }
      animationRef.current = requestAnimationFrame(animate)
    }

    animationRef.current = requestAnimationFrame(animate)

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [simulate, isPaused, speed])



  return (
    <SimulationContext.Provider value={{}}>
      {children}
    </SimulationContext.Provider>
  )
} 