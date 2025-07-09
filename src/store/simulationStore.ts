import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

export interface Vector3 {
  x: number
  y: number
  z: number
}









export interface Food {
  id: string
  position: Vector3
  type: 'tulip'
  isAvailable: boolean
  nutritionValue: number
  respawnTime: number
  lastEaten: number
}

export interface Creature {
  id: string
  type: 'goose'
  position: Vector3
  rotation: Vector3
  scale: Vector3
  health: number
  energy: number
  isMoving: boolean
  isIdle: boolean
  idleAnimation: number // 0 to 1 for animation cycle
  
  // Stats
  vision: number // 0-100, how far they can see
  hunger: number // 0-100, decreases over time
  speed: number // 0-100, movement speed
  intelligence: number // 0-100, affects decision making
  
  // State machine
  state: 'hungry' | 'full' | 'searching' | 'eating' | 'dead'
  targetPosition?: Vector3 // Where they're moving to
  targetFoodId?: string // ID of food they're targeting
  lastStateChange: number // Game time when state last changed
  
  // Death tracking
  isDead: boolean // Whether the creature is dead
}

export interface Environment {
  temperature: number
  humidity: number
  lightLevel: number
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night'
  weather: 'sunny' | 'cloudy' | 'rainy' | 'foggy'
  season: 'spring' | 'summer' | 'autumn' | 'winter'
}

export interface SimulationState {
  // Core state
  creatures: Creature[]
  food: Food[]
  environment: Environment
  gameTime: number
  isPaused: boolean
  speed: number
  
  // UI state
  selectedEntity: string | null
  
  // Actions
  addCreature: (creature: Omit<Creature, 'id'>) => void
  removeCreature: (id: string) => void
  updateCreature: (id: string, updates: Partial<Creature>) => void
  
  addFood: (food: Omit<Food, 'id'>) => void
  removeFood: (id: string) => void
  updateFood: (id: string, updates: Partial<Food>) => void
  
  updateEnvironment: (updates: Partial<Environment>) => void
  advanceTime: (deltaTime: number) => void
  togglePause: () => void
  setSpeed: (speed: number) => void
  
  setSelectedEntity: (id: string | null) => void
  
  // Simulation
  simulate: () => void
  
  // Debug/Testing
  spawnCreature: () => void
  initializeFood: () => void
}

const generateId = () => Math.random().toString(36).substr(2, 9)

const getRandomPosition = (): Vector3 => ({
  x: (Math.random() - 0.5) * 20,
  y: 0,
  z: (Math.random() - 0.5) * 20
})

const initialState = {
  creatures: [],
  food: [],
  environment: {
    temperature: 22,
    humidity: 60,
    lightLevel: 80,
    timeOfDay: 'morning' as const,
    weather: 'sunny' as const,
    season: 'spring' as const,
  },
  gameTime: 0,
  isPaused: false,
  speed: 1,
  selectedEntity: null,
}

export const useSimulationStore = create<SimulationState>()(
  devtools(
    (set, get) => ({
      ...initialState,
      

      
      addCreature: (creature) => set((state) => ({
        creatures: [...state.creatures, { ...creature, id: generateId() }]
      })),
      
      removeCreature: (id) => set((state) => ({
        creatures: state.creatures.filter(c => c.id !== id)
      })),
      
      updateCreature: (id, updates) => set((state) => ({
        creatures: state.creatures.map(c => c.id === id ? { ...c, ...updates } : c)
      })),
      
      addFood: (food) => set((state) => ({
        food: [...state.food, { ...food, id: generateId() }]
      })),
      
      removeFood: (id) => set((state) => ({
        food: state.food.filter(f => f.id !== id)
      })),
      
      updateFood: (id, updates) => set((state) => ({
        food: state.food.map(f => f.id === id ? { ...f, ...updates } : f)
      })),
      
      updateEnvironment: (updates) => set((state) => ({
        environment: { ...state.environment, ...updates }
      })),
      
      advanceTime: (deltaTime) => set((state) => ({
        gameTime: state.gameTime + deltaTime
      })),
      
      togglePause: () => set((state) => ({
        isPaused: !state.isPaused
      })),
      
      setSpeed: (speed) => set({ speed }),
      
      setSelectedEntity: (id) => set({ selectedEntity: id }),
      
      simulate: () => {
        const state = get()
        if (state.isPaused) return
        
        const deltaTime = 1 * state.speed
        
        // Update game time
        get().advanceTime(deltaTime)
        

        
        // Simulate creatures
        state.creatures.forEach(creature => {
          // Skip dead creatures
          if (creature.isDead) return
          
          // Update idle animation
          const newIdleAnimation = (creature.idleAnimation + deltaTime * 0.1) % 1
          
          // Decrease hunger over time (8x slower rate)
          const hungerDecrease = deltaTime * 0.0125 // Hunger decreases by 0.0125 per time unit (8x slower than 0.1)
          const newHunger = Math.max(0, creature.hunger - hungerDecrease)
          
          // Check for immediate death when hunger reaches 0
          if (newHunger === 0 && creature.hunger > 0) {
            // Hunger just reached 0, kill the creature immediately
            get().updateCreature(creature.id, {
              isDead: true,
              state: 'dead',
              lastStateChange: state.gameTime
            })
            console.log(`Goose ${creature.id} died immediately from starvation (hunger = 0)`)
            return // Skip further processing for this creature
          }
          
          // State machine logic
          let newState = creature.state
          let newTargetPosition = creature.targetPosition
          let isMoving = creature.isMoving
          let newPosition = { ...creature.position }
          
          // State transitions based on hunger
          if (creature.hunger > 50 && creature.state === 'hungry') {
            newState = 'full'
            get().updateCreature(creature.id, { lastStateChange: state.gameTime })
          } else if (creature.hunger <= 50 && creature.state === 'full') {
            newState = 'hungry'
            get().updateCreature(creature.id, { lastStateChange: state.gameTime })
          }
          
          // Behavior based on state
          if (newState === 'hungry') {
            // Look for available food within 5x5 area multiplied by vision stat
            const availableFood = state.food.filter(f => f.isAvailable)
            const visionRange = 5 * (creature.vision / 100) // 5x5 area scaled by vision (0-5 units)
            
            const nearbyFood = availableFood.filter(food => {
              const dx = Math.abs(food.position.x - creature.position.x)
              const dz = Math.abs(food.position.z - creature.position.z)
              return dx <= visionRange && dz <= visionRange // Check if food is within 5x5 area
            })
            
            if (nearbyFood.length > 0) {
              // Found food nearby, eat it immediately
              const nearestFood = nearbyFood[0]
              
              // Mark food as eaten
              get().updateFood(nearestFood.id, {
                isAvailable: false,
                lastEaten: state.gameTime
              })
              
              // Make creature full
              newState = 'full'
              get().updateCreature(creature.id, {
                hunger: 100,
                state: 'full',
                lastStateChange: state.gameTime,
                targetFoodId: undefined
              })
              
              console.log(`Goose ${creature.id} ate food ${nearestFood.id} and became full`)
            } else {
              // No food nearby, random movement
              if (Math.random() < 0.02) { // 2% chance to change direction
                const wallBoundary = 49
                const randomX = creature.position.x + (Math.random() - 0.5) * 10
                const randomZ = creature.position.z + (Math.random() - 0.5) * 10
                
                // Clamp to wall boundaries
                const clampedX = Math.max(-wallBoundary, Math.min(wallBoundary, randomX))
                const clampedZ = Math.max(-wallBoundary, Math.min(wallBoundary, randomZ))
                
                newTargetPosition = {
                  x: clampedX,
                  y: 0.5,
                  z: clampedZ
                }
                isMoving = true
              }
            }
          } else if (newState === 'eating') {
            // Eat and automatically transition to full after 2 seconds
            if (creature.targetFoodId) {
              const targetFood = state.food.find(f => f.id === creature.targetFoodId)
              if (targetFood && targetFood.isAvailable) {
                const timeEating = state.gameTime - creature.lastStateChange
                
                if (timeEating >= 2000) { // 2 seconds = 2000ms
                  // Finished eating, transition to full state
                  newState = 'full'
                  get().updateCreature(creature.id, { 
                    lastStateChange: state.gameTime,
                    targetFoodId: undefined,
                    state: 'full',
                    hunger: 100 // Set to full hunger
                  })
                  
                  // Mark food as eaten
                  get().updateFood(targetFood.id, {
                    isAvailable: false,
                    lastEaten: state.gameTime
                  })
                  
                  console.log(`Goose ${creature.id} finished eating after 2 seconds, hunger: 100`)
                } else {
                  // Still eating, keep in eating state
                  newState = 'eating'
                }
              } else {
                // Food is no longer available, go back to hungry state
                newState = 'hungry'
                get().updateCreature(creature.id, { 
                  targetFoodId: undefined,
                  state: 'hungry'
                })
              }
            }
          } else if (newState === 'full') {
            // Random idle behavior
            if (Math.random() < 0.01) { // 1% chance to move
              const wallBoundary = 49
              const randomX = creature.position.x + (Math.random() - 0.5) * 5
              const randomZ = creature.position.z + (Math.random() - 0.5) * 5
              
              // Clamp to wall boundaries
              const clampedX = Math.max(-wallBoundary, Math.min(wallBoundary, randomX))
              const clampedZ = Math.max(-wallBoundary, Math.min(wallBoundary, randomZ))
              
              newTargetPosition = {
                x: clampedX,
                y: 0.5,
                z: clampedZ
              }
              isMoving = true
            }
          }
          
          // Move towards target if we have one
          if (newTargetPosition) {
            const dx = newTargetPosition.x - creature.position.x
            const dz = newTargetPosition.z - creature.position.z
            const distance = Math.sqrt(dx * dx + dz * dz)
            
            if (distance < 0.5) {
              // Reached target
              if (creature.targetFoodId) {
                // Reached food, start eating
                newState = 'eating'
                newTargetPosition = undefined
                isMoving = false
                get().updateCreature(creature.id, { 
                  lastStateChange: state.gameTime,
                  state: 'eating'
                })
                console.log(`Creature ${creature.id} reached food ${creature.targetFoodId}, starting to eat`)
              } else {
                // Reached random target
                newTargetPosition = undefined
                isMoving = false
              }
            } else {
              // Move towards target
              const moveSpeed = creature.speed / 100 * deltaTime
              const moveX = (dx / distance) * moveSpeed
              const moveZ = (dz / distance) * moveSpeed
              
              // Calculate new position
              const proposedX = newPosition.x + moveX
              const proposedZ = newPosition.z + moveZ
              
              // Check wall boundaries (keeping creatures within -49 to 49 range)
              const wallBoundary = 49
              if (proposedX >= -wallBoundary && proposedX <= wallBoundary) {
                newPosition.x = proposedX
              } else {
                // Hit a wall, stop moving in X direction and clear target
                newTargetPosition = undefined
                isMoving = false
              }
              
              if (proposedZ >= -wallBoundary && proposedZ <= wallBoundary) {
                newPosition.z = proposedZ
              } else {
                // Hit a wall, stop moving in Z direction and clear target
                newTargetPosition = undefined
                isMoving = false
              }
            }
          }
          

          
          // Update creature
          get().updateCreature(creature.id, {
            idleAnimation: newIdleAnimation,
            hunger: newHunger,
            state: newState,
            targetPosition: newTargetPosition,
            isMoving,
            position: newPosition,
            rotation: {
              x: creature.rotation.x,
              y: creature.rotation.y,
              z: creature.rotation.z
            }
          })
        })
        

        
        // Simulate food respawning (quick respawn)
        state.food.forEach(food => {
          if (!food.isAvailable && state.gameTime - food.lastEaten > 1500) { // 1.5 seconds respawn time
            get().updateFood(food.id, {
              isAvailable: true
            })
            console.log(`Food ${food.id} has respawned`)
          }
        })
        
        // Update environment
        const timeOfDay = Math.floor((state.gameTime / 1000) % 4)
        const timeOfDayMap = ['morning', 'afternoon', 'evening', 'night'] as const
        get().updateEnvironment({
          timeOfDay: timeOfDayMap[timeOfDay],
          lightLevel: timeOfDay === 0 ? 80 : timeOfDay === 1 ? 100 : timeOfDay === 2 ? 60 : 20
        })
      },
      
      spawnCreature: () => {
        const state = get()
        const creature: Omit<Creature, 'id'> = {
          type: 'goose',
          position: getRandomPosition(),
          rotation: { x: 0, y: 0, z: 0 },
          scale: { x: 1, y: 1, z: 1 },
          health: 100,
          energy: 100,
          isMoving: false,
          isIdle: true,
          idleAnimation: 0,
          vision: 50 + Math.random() * 30, // 50-80
          hunger: 30 + Math.random() * 20, // Start hungry (30-50)
          speed: 30 + Math.random() * 40, // 30-70
          intelligence: 20 + Math.random() * 60, // 20-80
          state: 'hungry', // Start hungry to seek food
          lastStateChange: state.gameTime,
          isDead: false
        }
        get().addCreature(creature)
        console.log(`Spawned goose with hunger: ${creature.hunger}, state: ${creature.state}`)
      },
      
      // Initialize food automatically
      initializeFood: () => {
        const state = get()
        if (state.food.length > 0) return // Don't initialize if food already exists
        
        // Create food at tulip positions
        const tulipPositions: [number, number, number][] = [
          [3, -2.8, 4], [4, -2.8, 3], [2, -2.8, 5], [-3, -2.8, 6], [-4, -2.8, 5], [-2, -2.8, 4],
          [7, -2.8, -3], [8, -2.8, -2], [6, -2.8, -4], [-7, -2.8, -5], [-8, -2.8, -4], [-6, -2.8, -6],
          [0, -2.8, 8], [1, -2.8, 7], [-1, -2.8, 9],
          [5, -2.8, 6], [6, -2.8, 5], [4, -2.8, 7], [-5, -2.8, 8], [-6, -2.8, 7], [-4, -2.8, 6],
          [9, -2.8, -1], [10, -2.8, 0], [8, -2.8, -2], [-9, -2.8, -3], [-10, -2.8, -2], [-8, -2.8, -4],
          [2, -2.8, 10], [3, -2.8, 9], [1, -2.8, 11]
        ]
        
        tulipPositions.forEach(([x, y, z]) => {
          get().addFood({
            position: { x, y, z },
            type: 'tulip',
            isAvailable: true,
            nutritionValue: 25,
            respawnTime: 1500, // 1.5 seconds
            lastEaten: 0
          })
        })
        
        console.log(`Initialized ${tulipPositions.length} food items`)
      }
    })
  )
) 