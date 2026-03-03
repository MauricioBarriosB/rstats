import { BarChart3 } from "lucide-react";

export default function Statistics() {
  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-3">
          <BarChart3 size={40} className="text-primary" />
          <h1 className="text-5xl font-bold text-foreground" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            Statistics
          </h1>
        </div>
        <p className="text-lg text-default-600 font-normal">
          Analyze comprehensive statistics and insights. Make data-driven decisions with detailed reports.
        </p>
      </div>
    </div>
  );
}
