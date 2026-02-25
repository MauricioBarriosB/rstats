import { Users } from "lucide-react";

export default function UserData() {
  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-3">
          <Users size={40} className="text-primary" />
          <h1 className="text-5xl font-bold text-foreground" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            User Data
          </h1>
        </div>
        <p className="text-lg text-default-600 font-normal">
          View and manage all user data. Access detailed information about registered users.
        </p>
      </div>
    </div>
  );
}
