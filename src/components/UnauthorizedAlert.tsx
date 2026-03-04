import { useState, useEffect } from "react";
import { Card, CardBody } from "@heroui/react";

export default function UnauthorizedAlert({ delay = 500 }: Readonly<{ delay?: number }>) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  if (!visible) return null;

  return (
    <div className="max-w-7xl mx-auto">
      <Card className="bg-warning-50 border border-warning-300">
        <CardBody className="flex flex-row items-center gap-3">
          <div className="shrink-0 w-10 h-10 bg-warning-200 rounded-full flex items-center justify-center">
            <span className="text-warning-700 text-xl">⚠</span>
          </div>
          <div>
            <p className="font-semibold text-warning-800">Unauthorized Application</p>
            <p className="text-sm text-warning-700">This application deployment is not authorized.</p>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
