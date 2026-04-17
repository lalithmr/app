import { Zone } from "./types";
import { X, Swords, Shield } from "lucide-react";

interface ZoneModalProps {
  zone: Zone;
  onClose: () => void;
  onAttack: (zone: Zone) => void;
  isConquestActive: boolean;
}

export function ZoneModal({ zone, onClose, onAttack, isConquestActive }: ZoneModalProps) {
  return (
    <div className="zone-modal-backdrop" onClick={onClose}>
      <div className="zone-modal-content" onClick={e => e.stopPropagation()}>
        <button className="zone-modal-close" onClick={onClose}>
          <X size={20} />
        </button>
        
        <div className="zone-modal-header text-center">
           <Shield className="zone-modal-icon" size={36} />
           <h3 style={{ margin: "0.5rem 0 0.2rem", fontSize: "1.5rem" }}>Sector {zone.row}-{zone.col}</h3>
           <span className="eyebrow" style={{ display: "inline-block", marginBottom: "1rem" }}>{zone.league} Difficulty</span>
        </div>
        
        <div className="zone-modal-body" style={{ display: "grid", gap: "0.8rem", marginBottom: "1.5rem" }}>
           <div className="stat-row" style={{ display: "flex", justifyContent: "space-between", padding: "0.8rem", background: "rgba(255,255,255,0.03)", borderRadius: "12px", border: "1px solid var(--border)"}}>
             <span style={{ color: "var(--muted)" }}>Owner</span>
             <strong style={{ color: zone.ownerName ? "var(--teal)" : "var(--text)" }}>{zone.ownerName || "Unclaimed Territory"}</strong>
           </div>
           <div className="stat-row" style={{ display: "flex", justifyContent: "space-between", padding: "0.8rem", background: "rgba(255,255,255,0.03)", borderRadius: "12px", border: "1px solid var(--border)"}}>
             <span style={{ color: "var(--muted)" }}>Threat Level</span>
             <strong style={{ color: "var(--danger)" }}>Level {zone.difficulty}</strong>
           </div>
           <div className="stat-row" style={{ display: "flex", justifyContent: "space-between", padding: "0.8rem", background: "rgba(255,255,255,0.03)", borderRadius: "12px", border: "1px solid var(--border)"}}>
             <span style={{ color: "var(--muted)" }}>Status</span>
             <strong style={{ textTransform: "capitalize", color: zone.status === "captured" ? "var(--gold)" : "var(--success)" }}>{zone.status}</strong>
           </div>
        </div>
        
        <div className="zone-modal-footer">
          {isConquestActive ? (
            <button className="primary-button" style={{ width: "100%", padding: "1rem", fontSize: "1.1rem" }} onClick={() => onAttack(zone)}>
              <Swords size={20} style={{ marginRight: "0.5rem" }}/> Initiate Assault
            </button>
          ) : (
            <div style={{ textAlign: "center", color: "var(--danger)", padding: "1rem", background: "rgba(255,135,135,0.1)", borderRadius: "12px", border: "1px solid rgba(255,135,135,0.2)" }}>
               Assaults locked. Return Tue-Thu.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
