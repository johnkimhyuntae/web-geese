# WebGeese 🦢

A beautiful 3D ecosystem simulation featuring geese and other creatures in an interactive environment. Built with React, Three.js, and Zustand. For **CursorJam 2025**.

## Features

### 🦢 Creatures
- **3D Goose Models**: Realistic low-poly goose models with animations
- **AI Behavior**: Creatures move around the environment with realistic physics
- **Hunger System**: Creatures need to eat to survive
- **Vision & Intelligence**: Each creature has unique attributes affecting behavior
- **Life Cycle**: Creatures can die and new ones can be spawned

### 🌿 Environment
- **3D World**: Immersive 3D environment with trees, tulips, and grass
- **Dynamic Lighting**: Realistic lighting with shadows and ambient effects
- **Weather System**: Dynamic weather conditions affecting the simulation
- **Day/Night Cycle**: Time of day affects creature behavior and lighting

### 🍃 Food System
- **Tulip Food**: Creatures can eat tulips scattered throughout the environment
- **Respawn System**: Food respawns after being consumed
- **Nutrition Values**: Different food types provide different nutrition

### 🎮 Interactive Features
- **3D Camera Controls**: Orbit, zoom, and pan around the environment
- **Entity Selection**: Click on creatures or food to see detailed information
- **Real-time Statistics**: Monitor creature count, food availability, and environment conditions
- **Spawn Controls**: Add new creatures and food to the simulation

## Tech Stack

- **React 18** - UI framework
- **Three.js** - 3D graphics rendering
- **React Three Fiber** - React integration for Three.js
- **React Three Drei** - Useful helpers for React Three Fiber
- **Zustand** - State management
- **Tailwind CSS** - Styling
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server

## Getting Started

### Prerequisites
- Node.js 16+ 
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd WebGeese
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:5173`

### Build for Production

```bash
npm run build
```

## How to Use

### Camera Controls
- **Mouse**: Rotate camera around the environment
- **Scroll**: Zoom in and out
- **Right click**: Pan the camera
- **Click**: Select creatures or food items

### Simulation Controls
- **Spawn Creature**: Add new creatures to the environment
- **Add Food**: Initialize food items from tulip positions
- **Entity Selection**: Click on any creature or food to see details

### Understanding the Simulation

#### Creatures
- Creatures move around the 3D environment automatically
- They have hunger levels that decrease over time
- Creatures search for and consume food to survive
- Each creature has unique attributes (vision, speed, intelligence)
- Creatures can die from hunger

#### Food System
- Tulips serve as food sources for creatures
- Food respawns after being consumed
- Different food types provide different nutrition values
- Food availability affects creature survival

#### Environment
- The 3D world includes trees, tulips, grass, and walls
- Dynamic lighting creates realistic shadows and atmosphere
- Weather and time of day affect the simulation
- The environment is bounded by walls to keep creatures contained

## Project Structure

```
src/
├── components/
│   ├── entities/
│   │   ├── Creature3D.tsx    # 3D creature rendering and behavior
│   │   ├── Food3D.tsx        # 3D food rendering
│   │   ├── Tree.tsx          # 3D tree models
│   │   └── Tulip.tsx         # 3D tulip models
│   ├── Environment.tsx       # 3D environment setup
│   └── Simulation3D.tsx      # Main 3D simulation component
├── store/
│   ├── simulationStore.ts    # Zustand state management
│   └── SimulationProvider.tsx # React context provider
├── utils/                    # Utility functions
├── App.tsx                   # Main app component
├── main.tsx                  # Entry point
└── index.css                 # Global styles
```

## 3D Models

The project includes several low-poly 3D models:
- `goose_low_poly.glb` - Main creature model
- `blue_tulips_low_poly.glb` - Food source model
- `low_poly_tree_set.glb` - Environment trees
- `low_poly_tree_with_twisting_branches.glb` - Additional tree variety

## Customization

### Adding New Creature Types
1. Add the type to the creature interfaces in `simulationStore.ts`
2. Update the creature rendering logic in `Creature3D.tsx`
3. Add new 3D models to the `public/models/` directory

### Modifying Environment
Edit the `Environment.tsx` component to add new environmental elements or modify existing ones.

### Adjusting Simulation Parameters
Modify the simulation logic in `simulationStore.ts` to change creature behavior, food respawn rates, or other simulation parameters.

## Performance Considerations

- 3D rendering can be resource-intensive
- Limit the number of creatures for optimal performance
- Use the camera controls to focus on specific areas
- Consider reducing shadow quality on lower-end devices

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Acknowledgments

- Three.js for excellent 3D rendering capabilities
- React Three Fiber for seamless React integration
- Zustand for simple and powerful state management
- The 3D model creators for the beautiful low-poly assets

---

Enjoy exploring the WebGeese ecosystem! 🦢✨ 
