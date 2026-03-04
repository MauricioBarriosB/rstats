import { Link } from "react-router-dom";
import { Card, CardBody, Button } from "@heroui/react";
import {
  Navigation,
  Gauge,
  Mountain,
  Smartphone,
  Database,
  Zap,
  Shield,
  Play,
  ArrowRight,
  Wifi,
  Clock,
  Route,
} from "lucide-react";
import UnauthorizedAlert from "../components/UnauthorizedAlert";
import { useRouteStorage } from "../hooks";

const features = [
  {
    icon: Navigation,
    title: "Real-time GPS Tracking",
    description:
      "Track your journeys with high-precision GPS using the browser's Geolocation API. Watch your route unfold in real-time.",
    color: "text-primary",
    bg: "bg-primary/10",
  },
  {
    icon: Gauge,
    title: "Smart Distance Calculation",
    description:
      "Hybrid calculation combining GPS speed (Doppler-based) and position data for superior accuracy while moving or stationary.",
    color: "text-success",
    bg: "bg-success/10",
  },
  {
    icon: Mountain,
    title: "3D Distance Support",
    description:
      "Altitude-aware calculations that consider elevation changes, perfect for hiking in hilly or mountainous terrain.",
    color: "text-warning",
    bg: "bg-warning/10",
  },
  {
    icon: Smartphone,
    title: "Screen Wake Lock",
    description:
      "Keeps your screen awake during tracking. Auto-reacquires when returning to the app, preventing accidental timeouts.",
    color: "text-secondary",
    bg: "bg-secondary/10",
  },
  {
    icon: Database,
    title: "Local Storage",
    description:
      "All routes saved locally on your device. Your data stays private and persists across sessions automatically.",
    color: "text-danger",
    bg: "bg-danger/10",
  },
  {
    icon: Shield,
    title: "Noise Filtering",
    description:
      "Advanced filtering removes erratic readings and low-accuracy GPS data for clean, reliable route recording.",
    color: "text-default-600",
    bg: "bg-default/20",
  },
];

const howItWorks = [
  {
    step: 1,
    icon: Play,
    title: "Start Tracking",
    description: "Press Start Route, enter a label for your journey, and begin recording.",
  },
  {
    step: 2,
    icon: Wifi,
    title: "GPS Stabilization",
    description: "The app averages multiple readings to ensure accurate starting coordinates.",
  },
  {
    step: 3,
    icon: Route,
    title: "Track Your Journey",
    description: "Move freely while the app records your path with real-time distance updates.",
  },
  {
    step: 4,
    icon: Database,
    title: "Save & Review",
    description: "Finish tracking to save your route with all statistics and GPS points.",
  },
];

export default function Home() {
  const { isAuthorized } = useRouteStorage();

  if (!isAuthorized) return <UnauthorizedAlert />;

  return (
    <div className="max-w-7xl mx-auto">
      {/* Hero Section */}
      <div className="text-center mb-16">
        <div className="flex justify-center mb-6">
          <h1
            className="flex items-center gap-2  text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-4"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            <Route size={40} /> RStats
          </h1>
        </div>

        <p className="text-xl sm:text-2xl text-default-600 mb-2">GPS Route Tracking App</p>
        <p className="text-lg text-default-500 max-w-2xl mx-auto mb-8">
          Track your journeys with high-precision GPS, save routes locally, and view detailed statistics. Built for
          accuracy, designed for simplicity.
        </p>
        <Button
          as={Link}
          to="/routes"
          color="primary"
          size="lg"
          endContent={<ArrowRight size={20} />}
          className="font-semibold"
        >
          Start Tracking
        </Button>
      </div>

      {/* Features Section */}
      <div className="mb-16">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-foreground mb-3" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            Powerful Features
          </h2>
          <p className="text-default-500 max-w-xl mx-auto">
            Everything you need for accurate GPS route tracking, right in your browser.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => (
            <Card key={feature.title} className="border border-default-200">
              <CardBody className="gap-4">
                <div className={`p-3 rounded-xl ${feature.bg} w-fit`}>
                  <feature.icon size={28} className={feature.color} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">{feature.title}</h3>
                  <p className="text-default-500 text-sm">{feature.description}</p>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      </div>

      {/* How It Works Section */}
      <div className="mb-16">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-foreground mb-3" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            How It Works
          </h2>
          <p className="text-default-500 max-w-xl mx-auto">Simple four-step process to track and save your routes.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {howItWorks.map((item) => (
            <div key={item.step} className="text-center">
              <div className="relative inline-flex mb-4">
                <div className="p-4 bg-primary/10 rounded-full">
                  <item.icon size={32} className="text-primary" />
                </div>
                <span className="absolute -top-1 -right-1 w-7 h-7 bg-primary text-white rounded-full flex items-center justify-center text-sm font-bold">
                  {item.step}
                </span>
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">{item.title}</h3>
              <p className="text-default-500 text-sm">{item.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Stats/Highlights Section */}
      <Card className="mb-16 bg-linear-to-r from-primary/5 to-secondary/5 border border-default-200">
        <CardBody className="py-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
            <div>
              <div className="flex justify-center mb-2">
                <Zap size={24} className="text-warning" />
              </div>
              <p className="text-2xl font-bold text-foreground">Real-time</p>
              <p className="text-default-500 text-sm">Live Updates</p>
            </div>
            <div>
              <div className="flex justify-center mb-2">
                <Gauge size={24} className="text-success" />
              </div>
              <p className="text-2xl font-bold text-foreground">20m</p>
              <p className="text-default-500 text-sm">Accuracy Threshold</p>
            </div>
            <div>
              <div className="flex justify-center mb-2">
                <Clock size={24} className="text-primary" />
              </div>
              <p className="text-2xl font-bold text-foreground">2s</p>
              <p className="text-default-500 text-sm">Update Interval</p>
            </div>
            <div>
              <div className="flex justify-center mb-2">
                <Shield size={24} className="text-danger" />
              </div>
              <p className="text-2xl font-bold text-foreground">100%</p>
              <p className="text-default-500 text-sm">Private & Local</p>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* CTA Section */}
      <Card className="bg-primary/5 border border-primary/20">
        <CardBody className="py-10 text-center">
          <h2
            className="text-2xl sm:text-3xl font-bold text-foreground mb-4"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            Ready to Track Your Journey?
          </h2>
          <p className="text-default-500 mb-6 max-w-lg mx-auto">
            Start recording your routes today. No sign-up required, all data stays on your device.
          </p>
          <Button
            as={Link}
            to="/routes"
            color="primary"
            size="lg"
            startContent={<Navigation size={20} />}
            className="font-semibold"
          >
            Go to Routes
          </Button>
        </CardBody>
      </Card>
    </div>
  );
}
