import { Zone } from "./types";

interface ZoneTileProps {
  zone: Zone;
  onClick: (zone: Zone) => void;
  isConquestActive: boolean;
}

export function ZoneTile({ zone, onClick, isConquestActive }: ZoneTileProps) {
  const isCaptured = zone.status === "captured" && zone.ownerId;
  const isAvailable = zone.status === "available" && isConquestActive;
  // If conquest is inactive, everything behaves as locked unless we want them to view captured zones.
  // Viewing is fine, but interaction might be restricted.
  const isLocked = zone.status === "locked" || !isConquestActive;

  let stateClass = "available";
  if (isLocked && !isCaptured) stateClass = "locked";
  if (isCaptured) stateClass = "captured";

  return (
    <div 
      className={`zone-tile ${stateClass}`}
      onClick={() => onClick(zone)}
    >
      <div className="zone-glow"></div>
      <div className="zone-content">
        {isCaptured && <span className="zone-avatar">{zone.ownerName?.charAt(0).toUpperCase() || "?"}</span>}
      </div>
    </div>
  );
}
