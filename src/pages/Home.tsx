import { Home as HomeIcon } from "lucide-react";

export default function Home() {
  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-3">
          <HomeIcon size={40} className="text-primary" />
          <h1 className="text-5xl font-bold text-foreground" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            Home
          </h1>
        </div>
        <p className="text-lg text-default-600 font-normal">
          Welcome to BC Stats - Your central dashboard for all statistics and data management.
        </p>
      </div>
    </div>
  );
}
