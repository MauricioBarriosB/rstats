import { Mail } from "lucide-react";

export default function Contact() {
  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-3">
          <Mail size={40} className="text-primary" />
          <h1 className="text-5xl font-bold text-foreground" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            Contact
          </h1>
        </div>
        <p className="text-lg text-default-600 font-normal">
          Get in touch with our team. We're here to help you with any questions or concerns.
        </p>
      </div>
    </div>
  );
}
