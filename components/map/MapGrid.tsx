import { useState, useEffect } from "react";
import { collection, getDocs, doc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import { useAuth } from "@/context/auth-context";
import { Zone } from "./types";
import { ZoneTile } from "./ZoneTile";
import { ZoneModal } from "./ZoneModal";

const GRID_SIZE = 8; // 8x8 Map = 64 Zones

export function MapGrid() {
  const { user, profile } = useAuth();
  const [zones, setZones] = useState<Zone[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedZone, setSelectedZone] = useState<Zone | null>(null);
  const [isConquestActive, setIsConquestActive] = useState(false);

  useEffect(() => {
    // Check if today is Tue(2), Wed(3), or Thu(4)
    const today = new Date().getDay();
    const active = today >= 2 && today <= 4;
    setIsConquestActive(active);
    
    fetchZones();
  }, []);

  const fetchZones = async () => {
    try {
      const snap = await getDocs(collection(db, "zones"));
      if (snap.empty) {
        // Initialize blank map logic for first time setup
        const initialZones: Zone[] = [];
        for (let r = 0; r < GRID_SIZE; r++) {
          for (let c = 0; c < GRID_SIZE; c++) {
            // Distance from center dictates difficulty (Center is harder)
            const distFromCenter = Math.abs(r - 3.5) + Math.abs(c - 3.5);
            const difficulty = Math.max(1, 10 - Math.floor(distFromCenter));
            const baseLeague = difficulty > 7 ? "Grandmaster" : difficulty > 4 ? "Master" : "Challenger";
            
            initialZones.push({
              id: `${r}-${c}`,
              row: r,
              col: c,
              ownerId: null,
              ownerName: null,
              league: baseLeague,
              difficulty,
              status: "available",
              lastCapturedAt: null
            });
          }
        }
        setZones(initialZones);
      } else {
        const fetched: Zone[] = [];
        snap.forEach(document => {
          fetched.push(document.data() as Zone);
        });
        
        // Ensure accurate rendering order
        fetched.sort((a, b) => (a.row * GRID_SIZE + a.col) - (b.row * GRID_SIZE + b.col));
        setZones(fetched);
      }
    } catch (e) {
      console.error("Map query error:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleAttack = async (zone: Zone) => {
    if (!user || !profile) return alert("You must be logged in to capture zones.");
    if (!isConquestActive) return alert("Conquest is currently offline.");
    
    // Abstracting game mechanics: Simulate successful capture for demo purposes
    // Real implementation would route to `/game?zoneId=${zone.id}` or `/puzzle?zoneId=${zone.id}`
    const confirmAssault = window.confirm(`Simulate beating a Level ${zone.difficulty} challenge to conquer Sector ${zone.row}-${zone.col}?`);
    if (!confirmAssault) return;

    try {
      const zoneRef = doc(db, "zones", zone.id);
      const captureData = {
        ownerId: user.uid,
        ownerName: profile.username,
        status: "captured" as const,
        lastCapturedAt: Date.now()
      };
      
      // Optimistic state update
      setZones(prev => prev.map(z => z.id === zone.id ? { ...z, ...captureData } : z));
      setSelectedZone(null);

      // Persist in Firebase
      await setDoc(zoneRef, { ...zone, ...captureData }, { merge: true });
      
    } catch (error) {
      console.error("Failed to capture zone. Database sync error.", error);
    }
  };

  return (
    <div className="map-system-container">
      {!isConquestActive && (
        <div className="conquest-overlay">
          <div className="conquest-overlay-content">
             <h2 style={{ color: "var(--danger)", margin: "0 0 0.5rem" }}>Map Locked</h2>
             <p style={{ color: "var(--text)", margin: 0 }}>The Conquest phase opens Tuesday – Thursday.</p>
          </div>
        </div>
      )}
      
      <div className={`map-grid-board ${!isConquestActive ? 'inactive-board' : ''}`}>
        {loading ? (
           <div className="muted-copy" style={{ textAlign: "center", padding: "4rem", gridColumn: "1 / -1" }}>
              Initializing Map Matrix...
           </div>
        ) : (
           zones.map(zone => (
             <ZoneTile 
                key={zone.id} 
                zone={zone} 
                onClick={setSelectedZone} 
                isConquestActive={isConquestActive} 
             />
           ))
        )}
      </div>

      {selectedZone && (
        <ZoneModal 
           zone={selectedZone} 
           onClose={() => setSelectedZone(null)} 
           onAttack={handleAttack} 
           isConquestActive={isConquestActive}
        />
      )}
    </div>
  );
}
