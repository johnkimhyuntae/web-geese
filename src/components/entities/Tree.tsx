import React, { useRef } from 'react'
import { useGLTF } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

interface TreeProps {
  position?: [number, number, number]
  rotation?: [number, number, number]
  scale?: [number, number, number]
}

const Tree: React.FC<TreeProps> = ({ 
  position = [0, 0, 0], 
  rotation = [0, 0, 0], 
  scale = [1, 1, 1] 
}) => {
  const groupRef = useRef<THREE.Group>(null)
  
  // Load the GLB model
  const { scene } = useGLTF('/models/low_poly_tree_with_twisting_branches.glb')
  
  // Gentle swaying animation
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(state.clock.getElapsedTime() * 0.1) * 0.02
    }
  })
  
  // Clone the scene to avoid issues with multiple instances
  const clonedScene = scene.clone()
  
  // Enable shadows for all meshes in the scene
  clonedScene.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      child.castShadow = true
      child.receiveShadow = true
    }
  })
  
  return (
    <group
      ref={groupRef}
      position={position}
      rotation={rotation}
      scale={scale}
    >
      <primitive object={clonedScene} />
    </group>
  )
}

export default Tree

// Preload the model
useGLTF.preload('/models/low_poly_tree_with_twisting_branches.glb') 