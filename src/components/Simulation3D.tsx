import React, { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Sky, Grid } from '@react-three/drei'
import { useSimulationStore } from '../store/simulationStore'
import Creature from './entities/Creature3D'
import Food3D from './entities/Food3D'
import Environment from './Environment'

const Simulation3D: React.FC = () => {
  console.log('Simulation3D component rendering...')
  
  const { creatures, food, environment, selectedEntity, setSelectedEntity, spawnCreature, addFood, initializeFood } = useSimulationStore()
  
  // Initialize food when component mounts
  React.useEffect(() => {
    initializeFood()
  }, [initializeFood])

  console.log('Store state:', { creatures: creatures.length, food: food.length })
  
  // Function to initialize food from tulip positions
  const initializeFoodFromTulips = () => {
    // Import tulip positions from Environment component
    const tulipPositions: [number, number, number][] = [
      [3, 2.8, 4], [4, 2.8, 3], [2, 2.8, 5], [-3, 2.8, 6], [-4, 2.8, 5], [-2, 2.8, 4],
      [7, 2.8, -3], [8, 2.8, -2], [6, 2.8, -4], [-7, 2.8, -5], [-8, 2.8, -4], [-6, 2.8, -6],
      [0, 2.8, 8], [1, 2.8, 7], [-1, 2.8, 9],
      [5, 2.8, 6], [6, 2.8, 5], [4, 2.8, 7], [-5, 2.8, 8], [-6, 2.8, 7], [-4, 2.8, 6],
      [9, 2.8, -1], [10, 2.8, 0], [8, 2.8, -2], [-9, 2.8, -3], [-10, 2.8, -2], [-8, 2.8, -4],
      [2, 2.8, 10], [3, 2.8, 9], [1, 2.8, 11]
    ]
    
    tulipPositions.forEach(([x, y, z]) => {
      addFood({
        position: { x, y: -2.8, z }, // Position food at ground level
        type: 'tulip',
        isAvailable: true,
        nutritionValue: 25,
        respawnTime: 5000, // 5 seconds
        lastEaten: 0
      })
    })
  }

  return (
    <div className="w-full h-full relative">
      <Canvas
        shadows
        camera={{ position: [15, 15, 15], fov: 50 }}
        gl={{ antialias: true, alpha: true }}
        onCreated={(state) => {
          console.log('Canvas created:', state)
        }}
        onError={(error) => {
          console.error('Canvas error:', error)
        }}
      >
        {/* Lighting */}
        <ambientLight intensity={0.6} />
        <directionalLight
          position={[15, 15, 10]}
          intensity={1.2}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
          shadow-camera-far={100}
          shadow-camera-left={-20}
          shadow-camera-right={20}
          shadow-camera-top={20}
          shadow-camera-bottom={-20}
        />
        
        {/* Environment */}
        <Sky 
          distance={450000} 
          sunPosition={[0, 1, 0]} 
          inclination={0} 
          azimuth={0.25} 
        />
        
        {/* Ground */}
        <Grid
          args={[20, 20]}
          cellSize={1}
          cellThickness={0.5}
          cellColor="#6f6f6f"
          sectionSize={5}
          sectionThickness={1}
          sectionColor="#9d4b4b"
          fadeDistance={30}
          fadeStrength={1}
          followCamera={false}
          infiniteGrid={true}
          receiveShadow
        />
        
        {/* Environment with Trees, Tulips, and Grass */}
        <Environment />
        
        {/* Ground plane for shadows */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]} receiveShadow>
          <planeGeometry args={[100, 100]} />
          <meshStandardMaterial color="#4a7c59" />
        </mesh>
        
        {/* Walls around the ground */}
        {/* North wall */}
        <mesh position={[0, 25, -50]} receiveShadow castShadow>
          <boxGeometry args={[100, 50, 2]} />
          <meshStandardMaterial color="#87CEEB" />
        </mesh>
        
        {/* South wall */}
        <mesh position={[0, 25, 50]} receiveShadow castShadow>
          <boxGeometry args={[100, 50, 2]} />
          <meshStandardMaterial color="#87CEEB" />
        </mesh>
        
        {/* East wall */}
        <mesh position={[50, 25, 0]} receiveShadow castShadow>
          <boxGeometry args={[2, 50, 100]} />
          <meshStandardMaterial color="#87CEEB" />
        </mesh>
        
        {/* West wall */}
        <mesh position={[-50, 25, 0]} receiveShadow castShadow>
          <boxGeometry args={[2, 50, 100]} />
          <meshStandardMaterial color="#87CEEB" />
        </mesh>
        

        
        {/* Creatures */}
        <Suspense fallback={null}>
          {creatures.filter(c => !c.isDead).map((creature) => (
            <Creature
              key={creature.id}
              creature={creature}
              isSelected={selectedEntity === creature.id}
              onClick={() => setSelectedEntity(creature.id)}
            />
          ))}
        </Suspense>
        
        {/* Food */}
        <Suspense fallback={null}>
          {food.map((foodItem) => (
            <Food3D
              key={foodItem.id}
              food={foodItem}
              isSelected={selectedEntity === foodItem.id}
              onClick={() => setSelectedEntity(foodItem.id)}
            />
          ))}
        </Suspense>
        

        
        {/* Camera Controls */}
        <OrbitControls
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          minDistance={8}
          maxDistance={80}
          maxPolarAngle={Math.PI / 2}
        />
      </Canvas>
      
      {/* UI Overlay */}
      <div className="absolute top-4 left-4 bg-black/50 text-white p-3 rounded-lg text-sm">
        <div className="font-bold mb-2">WebGeese</div>
        <div>Creatures: {creatures.filter(c => !c.isDead).length}</div>
        <div>Food: {food.filter(f => f.isAvailable).length}/{food.length}</div>
        <div className="mt-2">
          <div>Time: {environment.timeOfDay}</div>
          <div>Weather: {environment.weather}</div>
        </div>
        
        {/* Selected Creature Info */}
        {selectedEntity && creatures.find(c => c.id === selectedEntity) && (
          <div className="mt-4 p-2 bg-blue-900/50 rounded">
            <div className="font-bold">Selected Creature:</div>
            {(() => {
              const creature = creatures.find(c => c.id === selectedEntity)!
              return (
                <>
                  <div>Type: {creature.type}</div>
                  <div>State: {creature.state}</div>
                  <div>Hunger: {Math.round(creature.hunger)}%</div>
                  <div>Vision: {Math.round(creature.vision)}</div>
                  <div>Speed: {Math.round(creature.speed)}</div>
                  <div>Intelligence: {Math.round(creature.intelligence)}</div>
                </>
              )
            })()}
          </div>
        )}
      </div>
      
      {/* Controls Info */}
      <div className="absolute bottom-4 left-4 bg-black/50 text-white p-3 rounded-lg text-sm">
        <div className="font-bold mb-2">Controls</div>
        <div>Mouse: Rotate camera</div>
        <div>Scroll: Zoom</div>
        <div>Right click: Pan</div>
        <div>Click: Select entities</div>
        <button 
          onClick={spawnCreature}
          className="mt-2 px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-xs mr-2"
        >
          Spawn Creature
        </button>
        <button 
          onClick={initializeFoodFromTulips}
          className="mt-2 px-3 py-1 bg-green-600 hover:bg-green-700 rounded text-xs"
        >
          Add Food
        </button>
      </div>
    </div>
  )
}

export default Simulation3D 