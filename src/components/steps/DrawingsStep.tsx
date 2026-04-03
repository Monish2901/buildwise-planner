import { ColumnGrid, BHKPlan } from '@/lib/calculations';
import { Button } from '@/components/ui/button';
import { ArrowRight, Layout, Pencil, Sofa, Scaling } from 'lucide-react';
import { motion } from 'framer-motion';

interface Props {
  lengthFt: number;
  breadthFt: number;
  grid: ColumnGrid;
  bhkPlan: BHKPlan;
  floors: number;
  beamWidth: number;
  beamDepth: number;
  slabThickness: number;
  slabBars: string;
  onComplete: () => void;
}

const RoomSVG = ({ floorIdx, bhkPlan, w, h, pad, scale, mode }: { floorIdx: number, bhkPlan: BHKPlan, w: number, h: number, pad: number, scale: number, mode: 'architectural' | 'furniture' | 'dimension' }) => {
  const rooms = bhkPlan.rooms.filter(r => r.floor === floorIdx);
  const rows = Math.ceil(rooms.length / 2);
  const rowH = h / rows;
  const colW = w / 2;

  return (
    <div className="overflow-auto bg-black/40 rounded-lg p-2 border border-border">
      <svg viewBox={`0 0 ${w + pad * 2} ${h + pad * 2}`} className="w-full" style={{ maxHeight: 350 }}>
        {/* Plot boundary */}
        <rect x={pad} y={pad} width={w} height={h} fill="none" stroke="hsl(215,15%,55%)" strokeWidth="0.5" strokeDasharray="2,2" />
        
        {/* Outer Walls (9") */}
        <rect x={pad - 2} y={pad - 2} width={w + 4} height={h + 4} fill="none" stroke="hsl(210,20%,85%)" strokeWidth="2" />
        
        {rooms.map((r, i) => {
          const colX = (i % 2) * colW + pad;
          const rowY = Math.floor(i / 2) * rowH + pad;
          const rw = (r.lengthFt * scale > colW - 5) ? colW - 5 : r.lengthFt * scale;
          const rh = (r.breadthFt * scale > rowH - 5) ? rowH - 5 : r.breadthFt * scale;

          return (
            <g key={i}>
              {/* Room Walls (Inner 4.5") */}
              <rect x={colX} y={rowY} width={rw} height={rh} fill="rgba(0,180,180,0.05)" stroke="hsl(187,80%,48%)" strokeWidth="1" />
              
              {/* Labels & Icons */}
              <text x={colX + 5} y={rowY + 12} fill="hsl(187,80%,48%)" fontSize="9" fontFamily="JetBrains Mono" fontWeight="bold">{r.name}</text>
              
              {mode === 'dimension' && (
                <text x={colX + 5} y={rowY + 25} fill="hsl(215,15%,55%)" fontSize="7" fontFamily="JetBrains Mono">{r.lengthFt}' × {r.breadthFt}'</text>
              )}

              {mode === 'furniture' && (
                <g opacity="0.3">
                  {r.name.includes('Bed') && <rect x={colX + rw/2 - 5} y={rowY + rh/2 - 5} width="10" height="12" rx="1" fill="white" />}
                  {r.name.includes('Living') && <path d={`M${colX + 10} ${rowY + 20} h15 v5 h-15 z`} fill="white" />}
                  {r.name.includes('Bath') && <circle cx={colX + 10} cy={rowY + 10} r="4" fill="white" />}
                </g>
              )}
              
              {/* Doors (Schematic) */}
              <path d={`M${colX + 2} ${rowY} v-4 a4 4 0 0 1 4 4`} fill="none" stroke="hsl(210,20%,85%)" strokeWidth="0.5" />
            </g>
          );
        })}
        
        {/* Footnotes */}
        <text x={pad} y={pad + h + 15} fill="hsl(215,15%,55%)" fontSize="6" fontFamily="JetBrains Mono">Scale: 1:{scale} | Walls: Outer 9", Inner 4.5"</text>
      </svg>
    </div>
  );
};

export default function DrawingsStep({ lengthFt, breadthFt, grid, bhkPlan, floors, beamWidth, beamDepth, slabThickness, slabBars, onComplete }: Props) {
  const scale = 8;
  const w = lengthFt * scale;
  const h = breadthFt * scale;
  const pad = 40;

  return (
    <div className="space-y-12">
      <div>
        <h2 className="text-2xl font-heading font-bold flex items-center gap-2">
          <Layout className="h-6 w-6 text-primary" />
          AutoCAD - Architectural Layouts
        </h2>
        <p className="text-muted-foreground text-sm">Smart generated architectural and structural drawings (Civil Standards)</p>
      </div>

      <div className="grid gap-8 grid-cols-1 md:grid-cols-2">
        {/* Ground Floor Plan */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="bg-card border border-border rounded-xl p-5 shadow-lg">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-heading text-sm font-semibold text-accent flex items-center gap-2">
              <Pencil className="h-4 w-4" /> Ground Floor Plan
            </h3>
            <span className="text-[10px] text-muted-foreground font-mono">Drawing #A-01</span>
          </div>
          <RoomSVG floorIdx={0} bhkPlan={bhkPlan} w={w} h={h} pad={pad} scale={scale} mode="architectural" />
        </motion.div>

        {/* First Floor Plan */}
        {floors > 1 && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="bg-card border border-border rounded-xl p-5 shadow-lg">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-heading text-sm font-semibold text-accent flex items-center gap-2">
                <Pencil className="h-4 w-4" /> First Floor Plan
              </h3>
              <span className="text-[10px] text-muted-foreground font-mono">Drawing #A-02</span>
            </div>
            <RoomSVG floorIdx={1} bhkPlan={bhkPlan} w={w} h={h} pad={pad} scale={scale} mode="architectural" />
          </motion.div>
        )}

        {/* Furniture Layout */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-card border border-border rounded-xl p-5 shadow-lg">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-heading text-sm font-semibold text-accent flex items-center gap-2">
              <Sofa className="h-4 w-4" /> Furniture Layout Plan
            </h3>
            <span className="text-[10px] text-muted-foreground font-mono">Drawing #A-03</span>
          </div>
          <RoomSVG floorIdx={0} bhkPlan={bhkPlan} w={w} h={h} pad={pad} scale={scale} mode="furniture" />
        </motion.div>

        {/* Dimension Plan */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-card border border-border rounded-xl p-5 shadow-lg">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-heading text-sm font-semibold text-accent flex items-center gap-2">
              <Scaling className="h-4 w-4" /> Dimension Plan
            </h3>
            <span className="text-[10px] text-muted-foreground font-mono">Drawing #A-04</span>
          </div>
          <RoomSVG floorIdx={0} bhkPlan={bhkPlan} w={w} h={h} pad={pad} scale={scale} mode="dimension" />
        </motion.div>

        {/* Structural Section */}
        <div className="md:col-span-2">
          <h2 className="text-xl font-heading font-bold flex items-center gap-2 mb-6">
            <Layout className="h-5 w-5 text-primary" />
            Structural Sections
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-card border border-border rounded-lg p-4">
              <h3 className="font-heading text-xs font-semibold mb-3 text-accent uppercase tracking-wider">Column Grid</h3>
              <svg viewBox={`0 0 ${w + pad * 2} ${h + pad * 2}`} className="w-full" style={{ maxHeight: 200 }}>
                <rect x={pad} y={pad} width={w} height={h} fill="none" stroke="hsl(187,80%,48%)" strokeWidth="1" />
                {Array.from({ length: grid.columnsAlongLength }).map((_, i) => (
                  <line key={`vl-${i}`} x1={pad + i * grid.spacingLength * scale} y1={pad - 10} x2={pad + i * grid.spacingLength * scale} y2={pad + h + 10} stroke="hsl(187,80%,48%)" strokeWidth="0.3" strokeDasharray="4,4" />
                ))}
                {Array.from({ length: grid.columnsAlongBreadth }).map((_, j) => (
                  <line key={`hl-${j}`} x1={pad - 10} y1={pad + j * grid.spacingBreadth * scale} x2={pad + w + 10} y2={pad + j * grid.spacingBreadth * scale} stroke="hsl(187,80%,48%)" strokeWidth="0.3" strokeDasharray="4,4" />
                ))}
                {Array.from({ length: grid.columnsAlongLength }).map((_, i) =>
                  Array.from({ length: grid.columnsAlongBreadth }).map((_, j) => (
                    <rect key={`c-${i}-${j}`} x={pad + i * grid.spacingLength * scale - 4} y={pad + j * grid.spacingBreadth * scale - 4} width={8} height={8} fill="hsl(45,90%,55%)" />
                  ))
                )}
              </svg>
            </div>

            <div className="bg-card border border-border rounded-lg p-4">
              <h3 className="font-heading text-xs font-semibold mb-3 text-accent uppercase tracking-wider">Beam Reinforcement</h3>
              <svg viewBox={`0 0 ${w + pad * 2} ${h + pad * 2}`} className="w-full" style={{ maxHeight: 200 }}>
                {Array.from({ length: grid.columnsAlongBreadth }).map((_, j) => (
                  <rect key={`bl-${j}`} x={pad} y={pad + j * grid.spacingBreadth * scale - 2} width={w} height={4} fill="hsl(187,80%,48%)" opacity="0.6" />
                ))}
                {Array.from({ length: grid.columnsAlongLength }).map((_, i) => (
                  <rect key={`bb-${i}`} x={pad + i * grid.spacingLength * scale - 2} y={pad} width={4} height={h} fill="hsl(187,80%,48%)" opacity="0.6" />
                ))}
                <text x={pad + w / 2} y={pad + h + 15} textAnchor="middle" fill="hsl(210,20%,85%)" fontSize="8" fontFamily="JetBrains Mono">
                  Beam: {beamWidth}×{beamDepth}mm
                </text>
              </svg>
            </div>

            <div className="bg-card border border-border rounded-lg p-4">
              <h3 className="font-heading text-xs font-semibold mb-3 text-accent uppercase tracking-wider">Slab Section</h3>
              <svg viewBox="0 0 400 120" className="w-full" style={{ maxHeight: 120 }}>
                <rect x="50" y="30" width="300" height="30" fill="hsl(187,80%,48%)" opacity="0.2" stroke="hsl(187,80%,48%)" />
                {[80, 130, 180, 230, 280, 320].map((x, i) => <circle key={i} cx={x} cy="52" r="3" fill="hsl(45,90%,55%)" />)}
                <text x="200" y="20" textAnchor="middle" fill="hsl(210,20%,85%)" fontSize="9" fontFamily="JetBrains Mono">{slabThickness}mm Slab (IS 456)</text>
              </svg>
            </div>
          </div>
        </div>
      </div>

      <Button onClick={onComplete} className="glow-primary w-full h-14 text-lg">
        Generate Final Structural Report <ArrowRight className="h-5 w-5 ml-2" />
      </Button>
    </div>
  );
}
