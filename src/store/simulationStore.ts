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
  state: 'hungry' | 'full' | 'searching' | 'eating' | 'breeding' | 'dead'
  targetPosition?: Vector3 // Where they're moving to
  targetFoodId?: string // ID of food they're targeting
  lastStateChange: number // Game time when state last changed
  
  // Breeding tracking
  lastBreedingTime: number // Game time when last bred
  breedingCooldown: number // Cooldown period in milliseconds
  
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
          
          // Decrease hunger over time (much slower rate so they don't die immediately)
          const hungerDecrease = deltaTime * 0.01 // Hunger decreases by 0.01 per time unit (5x slower than before)
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
            // Only look for food if hunger is below 50
            if (creature.hunger < 50) {
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
                
                // Make creature full with reduced nutrition (so they need to eat more often)
                newState = 'full'
                get().updateCreature(creature.id, {
                  hunger: 100,
                  state: 'full',
                  lastStateChange: state.gameTime,
                  targetFoodId: undefined
                })
                
                console.log(`Goose ${creature.id} ate food ${nearestFood.id} and became full`)
              } else {
                // No food nearby, random movement (increased movement frequency)
                if (Math.random() < 0.08) { // 8% chance to change direction (4x more frequent)
                  const wallBoundary = 49
                  const randomX = creature.position.x + (Math.random() - 0.5) * 15 // Larger movement range
                  const randomZ = creature.position.z + (Math.random() - 0.5) * 15
                  
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
            } else {
              // Hunger is 50 or above, don't eat, just do random movement (increased)
              if (Math.random() < 0.06) { // 6% chance to change direction (3x more frequent)
                const wallBoundary = 49
                const randomX = creature.position.x + (Math.random() - 0.5) * 12 // Larger movement range
                const randomZ = creature.position.z + (Math.random() - 0.5) * 12
                
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
            // Check for breeding opportunities
            const canBreed = state.gameTime - creature.lastBreedingTime > creature.breedingCooldown
            
            if (canBreed) {
              // Look for other full creatures nearby for breeding using vision-based area
              const visionRange = 5 * (creature.vision / 100) // 5x5 area scaled by vision (0-5 units)
              const nearbyCreatures = state.creatures.filter(other => {
                if (other.id === creature.id || other.isDead || other.state !== 'full') return false
                
                const dx = Math.abs(other.position.x - creature.position.x)
                const dz = Math.abs(other.position.z - creature.position.z)
                
                return dx <= visionRange && dz <= visionRange // Check if creature is within vision-based area
              })
              
              if (nearbyCreatures.length > 0) {
                // Found a breeding partner
                const partner = nearbyCreatures[0]
                
                // Check if partner can also breed
                if (state.gameTime - partner.lastBreedingTime > partner.breedingCooldown) {
                  // Start breeding
                  newState = 'breeding'
                  isMoving = false
                  newTargetPosition = undefined
                  
                  // Update both creatures to breeding state
                  get().updateCreature(creature.id, {
                    state: 'breeding',
                    lastStateChange: state.gameTime,
                    isMoving: false,
                    targetPosition: undefined
                  })
                  
                  get().updateCreature(partner.id, {
                    state: 'breeding',
                    lastStateChange: state.gameTime,
                    isMoving: false,
                    targetPosition: undefined
                  })
                  
                  console.log(`Creatures ${creature.id} and ${partner.id} started breeding`)
                }
              } else {
                // No breeding partner found, do random idle behavior (increased movement)
                if (Math.random() < 0.04) { // 4% chance to move (4x more frequent)
                  const wallBoundary = 49
                  const randomX = creature.position.x + (Math.random() - 0.5) * 8 // Larger movement range
                  const randomZ = creature.position.z + (Math.random() - 0.5) * 8
                  
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
            } else {
              // On breeding cooldown, do random idle behavior (increased movement)
              if (Math.random() < 0.04) { // 4% chance to move (4x more frequent)
                const wallBoundary = 49
                const randomX = creature.position.x + (Math.random() - 0.5) * 8 // Larger movement range
                const randomZ = creature.position.z + (Math.random() - 0.5) * 8
                
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
          } else if (newState === 'breeding') {
            // Handle breeding state
            const breedingDuration = 3000 // 3 seconds of breeding
            const timeBreeding = state.gameTime - creature.lastStateChange
            
            if (timeBreeding >= breedingDuration) {
              // Breeding complete, create a new creature
              const babyCreature: Omit<Creature, 'id'> = {
                type: 'goose',
                position: {
                  x: creature.position.x + (Math.random() - 0.5) * 2, // Spawn near parent
                  y: 0,
                  z: creature.position.z + (Math.random() - 0.5) * 2
                },
                rotation: { x: 0, y: 0, z: 0 },
                scale: { x: 0.7, y: 0.7, z: 0.7 }, // Smaller baby
                health: 100,
                energy: 100,
                isMoving: false,
                isIdle: true,
                idleAnimation: 0,
                vision: Math.max(30, Math.min(90, creature.vision + (Math.random() - 0.5) * 20)), // Inherit with variation
                hunger: 50 + Math.random() * 20, // Start moderately hungry
                speed: Math.max(20, Math.min(80, creature.speed + (Math.random() - 0.5) * 20)), // Inherit with variation
                intelligence: Math.max(10, Math.min(90, creature.intelligence + (Math.random() - 0.5) * 20)), // Inherit with variation
                state: 'hungry',
                lastStateChange: state.gameTime,
                lastBreedingTime: 0,
                breedingCooldown: 10000,
                isDead: false
              }
              
              get().addCreature(babyCreature)
              
              // Reset both parents to full state
              get().updateCreature(creature.id, {
                state: 'full',
                lastStateChange: state.gameTime,
                lastBreedingTime: state.gameTime, // Set breeding cooldown
                isMoving: false,
                targetPosition: undefined
              })
              
              // Find and update the partner
              const partner = state.creatures.find(c => 
                c.id !== creature.id && 
                !c.isDead && 
                c.state === 'breeding' &&
                Math.abs(c.position.x - creature.position.x) < 5 &&
                Math.abs(c.position.z - creature.position.z) < 5
              )
              
              if (partner) {
                get().updateCreature(partner.id, {
                  state: 'full',
                  lastStateChange: state.gameTime,
                  lastBreedingTime: state.gameTime, // Set breeding cooldown
                  isMoving: false,
                  targetPosition: undefined
                })
              }
              
              console.log(`Breeding complete! New baby goose created from ${creature.id}`)
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
        
        // Constant food generation (new food spawns randomly)
        if (Math.random() < 0.02) { // 2% chance per frame to spawn new food
          const wallBoundary = 45 // Keep food away from walls
          const randomX = (Math.random() - 0.5) * wallBoundary * 2
          const randomZ = (Math.random() - 0.5) * wallBoundary * 2
          
          get().addFood({
            position: { x: randomX, y: -2.8, z: randomZ },
            type: 'tulip',
            isAvailable: true,
            nutritionValue: 40, // Increased nutrition value for new food
            respawnTime: 1500,
            lastEaten: 0
          })
          
          console.log(`New food spawned at (${randomX.toFixed(1)}, ${randomZ.toFixed(1)})`)
        }
        
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
          hunger: 60 + Math.random() * 30, // Start with more hunger (60-90)
          speed: 30 + Math.random() * 40, // 30-70
          intelligence: 20 + Math.random() * 60, // 20-80
          state: 'hungry', // Start hungry to seek food
          lastStateChange: state.gameTime,
          lastBreedingTime: 0, // Never bred before
          breedingCooldown: 10000, // 10 second cooldown
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
            nutritionValue: 40, // Increased nutrition value so they can survive longer
            respawnTime: 1500, // 1.5 seconds
            lastEaten: 0
          })
        })
        
        console.log(`Initialized ${tulipPositions.length} food items`)
      }
    })
  )
) 