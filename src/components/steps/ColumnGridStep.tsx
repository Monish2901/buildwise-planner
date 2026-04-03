import { useState, useEffect } from 'react';
import { ColumnGrid, calculateColumnGrid } from '@/lib/calculations';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Grid3X3, ArrowRight } from 'lucide-react';

interface Props {
  length: number;
  breadth: number;
  floors: number;
  onComplete: (grid: ColumnGrid) => void;
}

export default function ColumnGridStep({ length, breadth, floors, onComplete }: Props) {
  const [grid, setGrid] = useState<ColumnGrid | null>(null);

  useEffect(() => {
    setGrid(calculateColumnGrid(length, breadth, floors));
  }, [length, breadth, floors]);

  if (!grid) return null;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-heading font-bold flex items-center gap-2">
          <Grid3X3 className="h-5 w-5 text-primary" />
          Column & Grid Layout
        </h2>
        <p className="text-muted-foreground text-sm mt-1">Auto-suggested based on building area & floors (IS 456)</p>
      </div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        {[
          { label: 'Total Columns', value: grid.totalColumns, highlight: true },
          { label: 'Along Length', value: grid.columnsAlongLength },
          { label: 'Along Breadth', value: grid.columnsAlongBreadth },
          { label: 'Spacing (L)', value: `${grid.spacingLength.toFixed(1)}'`, sub: 'ft' },
          { label: 'Spacing (B)', value: `${grid.spacingBreadth.toFixed(1)}'`, sub: 'ft' },
        ].map(item => (
          <div key={item.label} className={`rounded-xl p-4 border transition-all ${item.highlight ? 'bg-primary/10 border-primary/30 shadow-[0_0_15px_rgba(0,255,255,0.1)]' : 'bg-white/5 border-white/5 hover:border-white/10'}`}>
            <div className={`text-[9px] uppercase font-black tracking-widest mb-1 ${item.highlight ? 'text-primary' : 'text-muted-foreground'}`}>{item.label}</div>
            <div className="flex items-baseline gap-1">
              <div className={`font-mono font-bold text-xl ${item.highlight ? 'text-primary' : 'text-foreground'}`}>{item.value}</div>
              {item.sub && <span className="text-[10px] text-muted-foreground">{item.sub}</span>}
            </div>
          </div>
        ))}
      </motion.div>

      {/* Modern blueprint visualization */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="bg-white/5 border border-white/10 rounded-3xl p-6 overflow-hidden">
        <h3 className="text-[11px] uppercase font-bold tracking-[0.2em] mb-6 text-primary flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
          Structural Grid Preview
        </h3>
        <div className="overflow-auto py-8">
          <svg viewBox={`0 0 ${length + 20} ${breadth + 20}`} className="w-full max-w-lg mx-auto drop-shadow-[0_0_15px_rgba(0,255,255,0.1)]" style={{ maxHeight: 300 }}>
            {/* Boundary */}
            <rect x="10" y="10" width={length} height={breadth} fill="rgba(0,255,255,0.02)" stroke="rgba(0,255,255,0.2)" strokeWidth="0.5" strokeDasharray="3,3" />
            
            {/* Grid Lines */}
            {Array.from({ length: grid.columnsAlongLength }).map((_, i) => (
              <line 
                key={`line-l-${i}`} 
                x1={10 + i * grid.spacingLength} y1="10" 
                x2={10 + i * grid.spacingLength} y2={10 + breadth} 
                stroke="rgba(255,255,255,0.05)" strokeWidth="0.2" 
              />
            ))}
            {Array.from({ length: grid.columnsAlongBreadth }).map((_, j) => (
              <line 
                key={`line-b-${j}`} 
                x1="10" y1={10 + j * grid.spacingBreadth} 
                x2={10 + length} y2={10 + j * grid.spacingBreadth} 
                stroke="rgba(255,255,255,0.05)" strokeWidth="0.2" 
              />
            ))}

            {/* Glowing Columns */}
            {Array.from({ length: grid.columnsAlongLength }).map((_, i) =>
              Array.from({ length: grid.columnsAlongBreadth }).map((_, j) => (
                <g key={`${i}-${j}`}>
                  <circle
                    cx={10 + i * grid.spacingLength}
                    cy={10 + j * grid.spacingBreadth}
                    r={1.8}
                    fill="hsl(180,100%,50%)"
                    className="animate-pulse"
                  />
                  <circle
                    cx={10 + i * grid.spacingLength}
                    cy={10 + j * grid.spacingBreadth}
                    r={3}
                    fill="none"
                    stroke="rgba(0,255,255,0.3)"
                    strokeWidth="0.2"
                  />
                </g>
              ))
            )}
          </svg>
        </div>
      </motion.div>

      <div className="flex justify-end">
        <Button onClick={() => onComplete(grid)} className="glow-primary h-14 px-10 rounded-2xl group text-base">
          Configure Rooms <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
        </Button>
      </div>
    </div>
  );
}
