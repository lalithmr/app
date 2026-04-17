import { AppShell } from "@/components/layout/app-shell";
import { MapGrid } from "@/components/map/MapGrid";

export default function MapPage() {
  return (
    <AppShell 
       title="Territory Conquest" 
       subtitle="Conquer nodes to claim map territory. Only available Tuesday to Thursday."
    >
      <div className="content-grid" style={{ gridTemplateColumns: "1fr" }}>
        <section className="panel" style={{ padding: "3rem 1.5rem" }}>
          <MapGrid />
        </section>
      </div>
    </AppShell>
  );
}
