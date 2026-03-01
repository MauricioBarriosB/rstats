# RStats - GPS Route Tracking App

A modern GPS route tracking application built with React and TypeScript. Track your journeys with high-precision GPS, save routes locally, and view detailed statistics.

## Features

### GPS Route Tracking
- **Real-time GPS tracking** using the browser's Geolocation API
- **Hybrid distance calculation** combining GPS speed (Doppler-based) and position data for improved accuracy
- **3D distance support** - considers altitude changes for accurate distance in hilly terrain
- **GPS stabilization** - averages multiple readings at start/end points for reliable coordinates
- **Noise filtering** - filters out erratic heading changes and low-accuracy readings
- **Configurable thresholds** for accuracy, distance, and time intervals

### Smart Distance Calculation
- Uses GPS speed when available (more accurate when moving)
- Falls back to position-based calculation when stationary
- Weighted averaging for discrepancies between speed and position data
- Altitude-aware calculations using Pythagorean theorem

### Screen Wake Lock
- Keeps screen awake during active tracking
- Auto-reacquires wake lock when app returns to foreground
- Prevents accidental screen timeout during route recording

### Route Management
- **Save routes** to local storage automatically
- **View saved routes** with distance, duration, and GPS points
- **Delete routes** with one-click removal
- Persistent storage across sessions

### User Interface
- Modern, responsive design with HeroUI components
- Mobile-first approach with hamburger menu
- Real-time tracking status display
- GPS accuracy indicator
- Live coordinate display

## Tech Stack

- **React 19** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **TailwindCSS 4** - Styling
- **HeroUI** - UI component library
- **Framer Motion** - Animations
- **Geolib** - Geospatial calculations
- **React Router DOM** - Navigation

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone <repository-url>

# Install dependencies
npm install

# Start development server
npm run dev
```

### Available Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Run ESLint
```

## GPS Tracker Configuration

The GPS tracker hook accepts the following options:

| Option | Default | Description |
|--------|---------|-------------|
| `maxAccuracyThreshold` | 20m | Maximum acceptable GPS accuracy |
| `stabilizationReadings` | 5 | Readings needed for point stabilization |
| `minIntervalMs` | 2000ms | Minimum interval between recorded points |
| `minDistanceBetweenPoints` | 3m | Minimum distance to record new point |
| `enableHighAccuracy` | true | Request high accuracy GPS |
| `minSpeedThreshold` | 0.5 m/s | Minimum speed to use speed-based calculation |
| `maxHeadingChange` | 120° | Maximum heading change before filtering |

## Project Structure

```
src/
├── components/       # Reusable UI components
│   ├── Layout.tsx    # Main layout with navigation
│   └── SavedRoutes.tsx
├── helpers/          # Utility functions
│   ├── RoutesCalculations.ts
│   └── RoutesStorage.ts
├── hooks/            # Custom React hooks
│   ├── useGpsTracker.ts   # GPS tracking logic
│   ├── useRouteStorage.ts # Local storage management
│   └── useWakeLock.ts     # Screen wake lock
├── pages/            # Page components
│   └── Routes.tsx    # Main tracking page
└── main.tsx          # App entry point
```

## Browser Support

- Chrome/Edge 84+ (Wake Lock API)
- Firefox 79+ (Geolocation)
- Safari 16.4+ (Wake Lock API)

Note: GPS tracking requires HTTPS in production.

## License

MIT License
