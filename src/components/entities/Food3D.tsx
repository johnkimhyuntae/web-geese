import React, { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Food as FoodType } from '../../store/simulationStore'
import * as THREE from 'three'

interface Food3DProps {
  food: FoodType
  isSelected: boolean
  onClick: () => void
}

const Food3D: React.FC<Food3DProps> = ({ food, isSelected, onClick }) => {
  const meshRef = useRef<THREE.Mesh>(null)
  
  const { position, isAvailable } = food
  
  // Gentle floating animation at ground level
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.position.y = position.y + Math.sin(state.clock.getElapsedTime() * 2) * 0.05
    }
  })
  
  // Get food color based on availability
  const getFoodColor = () => {
    if (isAvailable) {
      return '#FF6B6B' // Red when available
    } else {
      return '#666666' // Gray when eaten
    }
  }
  
  return (
    <mesh
      ref={meshRef}
      position={[position.x, position.y, position.z]}
      onClick={onClick}
      castShadow
      receiveShadow
    >
      <sphereGeometry args={[0.3, 8, 8]} />
      <meshStandardMaterial 
        color={getFoodColor()} 
        transparent 
        opacity={0} // Make food invisible
      />
      
      {/* Selection indicator */}
      {isSelected && (
        <mesh position={[0, 0, 0]}>
          <ringGeometry args={[0.4, 0.5, 8]} />
          <meshStandardMaterial color="#FFFF00" />
        </mesh>
      )}
    </mesh>
  )
}

export default Food3D 