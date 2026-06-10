import { ReactNode } from "react";

interface Props {
  children: ReactNode;
}

export default function GradientBackground({ children }: Props) {
  return (
    <div className="min-h-screen w-full relative overflow-x-hidden" style={{
      background: "linear-gradient(135deg, #ff6eb4 0%, #c44dff 40%, #7b2fff 70%, #4a1aff 100%)"
    }}>
      {/* Animated blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="blob blob-1" />
        <div className="blob blob-2" />
        <div className="blob blob-3" />
      </div>
      <div className="relative z-10 min-h-screen">
        {children}
      </div>
    </div>
  );
}
