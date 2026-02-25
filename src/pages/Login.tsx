import { LogIn } from "lucide-react";

export default function Login() {
  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-3">
          <LogIn size={40} className="text-primary" />
          <h1 className="text-5xl font-bold text-foreground" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            Login
          </h1>
        </div>
        <p className="text-lg text-default-600 font-normal">
          Sign in to your account to access all features and manage your data.
        </p>
      </div>
    </div>
  );
}
