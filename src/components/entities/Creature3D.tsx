import React, { useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGLTF, Sphere, Box, Text } from '@react-three/drei'
import { Creature as CreatureType } from '../../store/simulationStore'
import * as THREE from 'three'

interface Creature3DProps {
  creature: CreatureType
  isSelected: boolean
  onClick: () => void
}

const Creature3D: React.FC<Creature3DProps> = ({ creature, isSelected, onClick }) => {
  const meshRef = useRef<THREE.Group>(null)
  const [hovered, setHovered] = useState(false)
  const [clicked, setClicked] = useState(false)
  
  const { position, rotation, scale, type, health, energy, isMoving, isIdle, idleAnimation, hunger, state, vision, speed, intelligence, isDead } = creature
  
  // Don't render dead creatures
  if (isDead) {
    return null
  }
  
  // Load the goose GLB model
  const { scene } = useGLTF('/models/goose_low_poly.glb')

  // Get creature color based on hunger level (gradual transition)
  const getCreatureColor = () => {
    // Use hunger level (0-100) to create gradual color transition
    // Red (0) -> Yellow (50) -> Green (100)
    const hungerRatio = hunger / 100 // 0 to 1
    
    if (hungerRatio <= 0.5) {
      // Red to Yellow: hue 0 to 60
      const hue = hungerRatio * 120 // 0 to 60
      return `hsl(${hue}, 100%, 50%)`
    } else {
      // Yellow to Green: hue 60 to 120
      const hue = 60 + (hungerRatio - 0.5) * 120 // 60 to 120
      return `hsl(${hue}, 100%, 50%)`
    }
  }

  // Clone the scene to avoid issues with multiple instances
  const clonedScene = scene.clone()
  
  // Scale down the entire scene by a huge factor
  clonedScene.scale.set(0.002, 0.002, 0.002) // Scale down by 1000x
  
  // Enable shadows and set material color for all meshes in the scene
  clonedScene.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      child.castShadow = true
      child.receiveShadow = true
      // Apply hunger-based color to the goose
      if (child.material) {
        child.material = child.material.clone()
        const color = new THREE.Color()
        color.setStyle(getCreatureColor()) // This handles HSL colors properly
        child.material.color.copy(color)
      }
    }
  })

  // Animation frame updates
  useFrame((state) => {
    if (!meshRef.current) return
    
    const time = state.clock.getElapsedTime()
    
    // Idle floating animation
    const floatOffset = Math.sin(time * 2 + idleAnimation * Math.PI * 2) * 0.05
    meshRef.current.position.y = position.y + floatOffset
    
    // No rotation animation - keep static
    meshRef.current.rotation.y = rotation.y
    
    // No movement rotation animation
    // if (isMoving) {
    //   meshRef.current.rotation.z = Math.sin(time * 10) * 0.1
    // }
    
    // Click animation
    if (clicked) {
      const scale = 1 + Math.sin(time * 15) * 0.2
      meshRef.current.scale.setScalar(scale)
    } else if (hovered) {
      meshRef.current.scale.setScalar(1.2)
    } else {
      meshRef.current.scale.setScalar(1)
    }
  })

  const handleClick = () => {
    setClicked(true)
    onClick()
    
    // Reset click animation after a short delay
    setTimeout(() => setClicked(false), 500)
  }

  return (
    <group
      ref={meshRef}
      position={[position.x, position.y, position.z]}
      rotation={[rotation.x, rotation.y, rotation.z]}
      scale={[scale.x, scale.y, scale.z]}
      castShadow
      receiveShadow
    >
      {/* Large invisible clickable area */}
      <mesh
        onClick={handleClick}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <sphereGeometry args={[2, 16, 16]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>
      
      <primitive object={clonedScene} />
      
      {/* Selection indicator */}
      {isSelected && (
        <Sphere args={[0.5, 16, 16]}>
          <meshBasicMaterial
            color="#00FFFF"
            transparent
            opacity={0.3}
            wireframe
          />
        </Sphere>
      )}
      
      {/* Health bar */}
      <group position={[0, 0.5, 0]}>
        {/* Background */}
        <Box args={[0.4, 0.05, 0.02]} position={[0, 0, 0]}>
          <meshBasicMaterial color="#000000" transparent opacity={0.5} />
        </Box>
        {/* Health fill */}
        <Box args={[0.4 * (health / 100), 0.05, 0.02]} position={[-(0.4 * (1 - health / 100)) / 2, 0, 0]}>
          <meshBasicMaterial color={health > 50 ? "#00FF00" : health > 25 ? "#FFFF00" : "#FF0000"} />
        </Box>
      </group>
      
      {/* Hunger bar */}
      <group position={[0, 0.6, 0]}>
        <Box args={[0.3, 0.03, 0.02]} position={[0, 0, 0]}>
          <meshBasicMaterial color="#000000" transparent opacity={0.5} />
        </Box>
        <Box args={[0.3 * (hunger / 100), 0.03, 0.02]} position={[-(0.3 * (1 - hunger / 100)) / 2, 0, 0]}>
          <meshBasicMaterial color={hunger > 70 ? "#00FF00" : hunger > 30 ? "#FFFF00" : "#FF0000"} />
        </Box>
      </group>
      
      {/* State indicator */}
      <group position={[0, 0.7, 0]}>
        <Text
          fontSize={0.1}
          color="#FFFFFF"
          anchorX="center"
          anchorY="middle"
        >
          {state}
        </Text>
      </group>
      
      {/* Type label */}
      {hovered && (
        <Text
          position={[0, 0.8, 0]}
          fontSize={0.15}
          color="#FFFFFF"
          anchorX="center"
          anchorY="middle"
        >
          {type}
        </Text>
      )}
      
      {/* Movement indicator */}
      {isMoving && (
        <group>
          {Array.from({ length: 3 }).map((_, i) => (
            <mesh
              key={i}
              position={[
                Math.sin(Date.now() * 0.001 + i) * 0.3,
                0.1,
                Math.cos(Date.now() * 0.001 + i) * 0.3
              ]}
            >
              <sphereGeometry args={[0.02, 8, 8]} />
              <meshBasicMaterial
                color="#00FFFF"
                transparent
                opacity={0.6}
              />
            </mesh>
          ))}
        </group>
      )}
    </group>
  )
}

export default Creature3D

// Preload the goose model
useGLTF.preload('/models/goose_low_poly.glb') 