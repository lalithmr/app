import { Shield, Swords, Brain, Zap } from "lucide-react";

export interface BotDetails {
  id: string;
  name: string;
  skillLevel: number;
  depth: number;
  description: string;
  icon: any;
  color: string;
}

export const ENGINEERING_BOTS: BotDetails[] = [
  { id: "bot-1", name: "Novice Bot", skillLevel: 0, depth: 2, description: "Makes random and obvious errors. Good for learning.", icon: Shield, color: "#98a8c5" },
  { id: "bot-2", name: "Apprentice Bot", skillLevel: 5, depth: 5, description: "Understands basic tactics but falls for traps.", icon: Swords, color: "#74e29d" },
  { id: "bot-3", name: "Expert Bot", skillLevel: 10, depth: 10, description: "Calculates deeply. Seldom makes blunders.", icon: Brain, color: "#56d2d2" },
  { id: "bot-4", name: "Grandmaster Bot", skillLevel: 20, depth: 15, description: "Flawless exact optimal play. Prepare to lose.", icon: Zap, color: "#f6c85f" }
];

interface BotSelectionProps {
  onSelectBot: (bot: BotDetails) => void;
}

export function BotSelection({ onSelectBot }: BotSelectionProps) {
  return (
    <div className="bot-selection-container" style={{ width: "100%", maxWidth: "800px", margin: "0 auto", padding: "2rem" }}>
       <div style={{ textAlign: "center", marginBottom: "2rem" }}>
         <h2 style={{ fontSize: "2rem" }}>Select Your Opponent</h2>
         <p className="muted-copy">Choose an AI bot to challenge in the live arena.</p>
       </div>

       <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "1.5rem" }}>
          {ENGINEERING_BOTS.map(bot => {
             const IconComponent = bot.icon;
             return (
               <div key={bot.id} className="panel zone-tile" style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", padding: "2rem", border: `1px solid ${bot.color}40` }} onClick={() => onSelectBot(bot)}>
                  <div style={{ width: "4rem", height: "4rem", borderRadius: "50%", background: `${bot.color}20`, color: bot.color, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "1rem" }}>
                     <IconComponent size={32} />
                  </div>
                  <h3 style={{ margin: "0 0 0.5rem" }}>{bot.name}</h3>
                  <p className="muted-copy" style={{ fontSize: "0.9rem", flexGrow: 1 }}>{bot.description}</p>
                  <button className="ghost-button" style={{ marginTop: "1rem", borderColor: `${bot.color}40`, color: bot.color, width: "100%" }}>
                     Challenge
                  </button>
               </div>
             )
          })}
       </div>
    </div>
  );
}
