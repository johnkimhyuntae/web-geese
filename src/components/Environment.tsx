import React, { Suspense, useMemo } from 'react'
import Tree from './entities/Tree'
import Tulip from './entities/Tulip'

const Environment: React.FC = () => {
  // Generate random positions and rotations
  const { treePositions, treeRotations, treeScales, tulipPositions, tulipRotations, tulipScales } = useMemo(() => {
    // Trees - random positions across the smaller ground area (64 trees = 32 * 2)
    const treePositions: [number, number, number][] = Array.from({ length: 64 }, () => {
      const angle = Math.random() * Math.PI * 2
      const radius = 15 + Math.random() * 35 // Between 15-50 units from center
      return [
        Math.cos(angle) * radius,
        3.5, // Fixed Y position
        Math.sin(angle) * radius
      ] as [number, number, number]
    })

    // Tulips - random positions across the smaller ground area (120 tulips = 60 * 2)
    const tulipPositions: [number, number, number][] = Array.from({ length: 120 }, () => [
      (Math.random() - 0.5) * 100, // -50 to 50
      2.8, // Fixed Y position
      (Math.random() - 0.5) * 100  // -50 to 50
    ] as [number, number, number])

    // Random rotations for trees
    const treeRotations: [number, number, number][] = Array.from({ length: 64 }, () => [
      0,
      Math.random() * Math.PI * 2, // Random Y rotation
      0
    ] as [number, number, number])

    // Random rotations for tulips
    const tulipRotations: [number, number, number][] = Array.from({ length: 120 }, () => [
      0,
      Math.random() * Math.PI * 2, // Random Y rotation
      0
    ] as [number, number, number])

    // Random scales for trees (varying X and Z, fixed Y)
    const treeScales: [number, number, number][] = Array.from({ length: 64 }, () => {
      const scale = 0.6 + Math.random() * 0.6 // Between 0.6 and 1.2
      return [scale, scale, scale] as [number, number, number]
    })

    // Fixed scales for tulips (all uniform)
    const tulipScales: [number, number, number][] = Array.from({ length: 120 }, () => [
      1.0, 1, 1.0
    ] as [number, number, number])

    return {
      treePositions,
      treeRotations,
      treeScales,
      tulipPositions,
      tulipRotations,
      tulipScales
    }
  }, []) // Empty dependency array means this runs once on mount

  return (
    <Suspense fallback={null}>
      {/* Trees - fixed positions around the edges */}
      {treePositions.map((position, i) => (
        <Tree
          key={`tree-${i}`}
          position={position}
          rotation={treeRotations[i]}
          scale={treeScales[i]}
        />
      ))}
      
      {/* Tulips - fixed positions in clusters */}
      {tulipPositions.map((position, i) => (
        <Tulip
          key={`tulip-${i}`}
          position={position}
          rotation={tulipRotations[i]}
          scale={tulipScales[i]}
        />
      ))}
      

    </Suspense>
  )
}

export default Environment 