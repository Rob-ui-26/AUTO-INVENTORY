import { MapPin } from "lucide-react";

interface Props {
  address: string;
}

export default function StoreBadge({ address }: Props) {
  if (!address) return null;
  return (
    <div className="flex items-center justify-center gap-2 mb-6">
      <div className="inline-flex items-center gap-2 px-4 py-2
        bg-white/15 border border-white/30 rounded-2xl backdrop-blur-sm">
        <MapPin className="w-4 h-4 text-white/80 flex-shrink-0" />
        <span className="text-white font-black text-sm">{address}</span>
      </div>
    </div>
  );
}
