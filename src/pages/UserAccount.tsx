import { UserCircle } from "lucide-react";

export default function UserAccount() {
  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-3">
          <UserCircle size={40} className="text-primary" />
          <h1 className="text-5xl font-bold text-foreground" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            User Account
          </h1>
        </div>
        <p className="text-lg text-default-600 font-normal">
          Manage your account settings, preferences, and personal information.
        </p>
      </div>
    </div>
  );
}
