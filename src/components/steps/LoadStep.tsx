import { useState, useEffect } from 'react';
import { LoadCalc, calculateLoads } from '@/lib/calculations';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Weight, ArrowRight } from 'lucide-react';

interface Props {
  lengthFt: number;
  breadthFt: number;
  floors: number;
  slabThickness: number;
  onComplete: (loads: LoadCalc) => void;
}

export default function LoadStep({ lengthFt, breadthFt, floors, slabThickness, onComplete }: Props) {
  const [loads, setLoads] = useState<LoadCalc | null>(null);

  useEffect(() => {
    setLoads(calculateLoads(lengthFt, breadthFt, floors, slabThickness));
  }, [lengthFt, breadthFt, floors, slabThickness]);

  if (!loads) return null;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-heading font-bold flex items-center gap-2">
          <Weight className="h-5 w-5 text-primary" />
          Load Calculation
        </h2>
        <p className="text-muted-foreground text-sm mt-1">Step-by-step as per IS 875</p>
      </div>

      <div className="bg-secondary/50 border border-border rounded-lg p-4 space-y-2">
        {loads.steps.map((step, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-card rounded-md p-3 border border-border font-mono text-sm"
          >
            {step}
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {[
          { label: 'Dead Load (Slab)', value: `${loads.deadLoadSlab} kN/m²` },
          { label: 'Dead Load (Floor)', value: `${loads.deadLoadFloor} kN/m²` },
          { label: 'Live Load', value: `${loads.liveLoad} kN/m²` },
          { label: 'Load/Floor', value: `${loads.totalLoadPerFloor} kN` },
          { label: 'Total Load', value: `${loads.totalBuildingLoad} kN` },
        ].map(item => (
          <div key={item.label} className="bg-card rounded-md p-3 border border-border">
            <div className="text-xs text-muted-foreground">{item.label}</div>
            <div className="font-mono font-semibold text-primary mt-1">{item.value}</div>
          </div>
        ))}
      </div>

      <Button onClick={() => onComplete(loads)} className="glow-primary">
        Proceed to Safety Checks <ArrowRight className="h-4 w-4" />
      </Button>
    </div>
  );
}
