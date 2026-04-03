import { useState } from 'react';
import { PlasteringCalc, calculatePlastering } from '@/lib/calculations';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { motion } from 'framer-motion';
import { PaintBucket, ArrowRight } from 'lucide-react';

interface Props {
  lengthFt: number;
  breadthFt: number;
  floors: number;
  onComplete: (calc: PlasteringCalc) => void;
}

export default function PlasteringStep({ lengthFt, breadthFt, floors, onComplete }: Props) {
  const [thickness, setThickness] = useState('12');
  const [result, setResult] = useState<PlasteringCalc | null>(null);

  const calculate = () => {
    setResult(calculatePlastering(lengthFt, breadthFt, floors, parseFloat(thickness)));
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-heading font-bold flex items-center gap-2">
          <PaintBucket className="h-5 w-5 text-primary" />
          Plastering Estimation
        </h2>
      </div>

      <div className="flex gap-4 items-end">
        <div className="flex-1">
          <label className="text-sm font-medium mb-1.5 block">Plaster Thickness (mm)</label>
          <div className="flex gap-2">
            {['6', '12', '15', '20'].map(t => (
              <button
                key={t}
                onClick={() => setThickness(t)}
                className={`px-4 py-2 rounded-md border text-sm font-mono ${
                  thickness === t ? 'border-primary bg-primary/10 text-primary' : 'border-border bg-secondary'
                }`}
              >
                {t}mm
              </button>
            ))}
          </div>
        </div>
        <Button onClick={calculate}>Calculate</Button>
      </div>

      {result && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Total Area', value: `${result.area} sq ft` },
              { label: 'Thickness', value: `${result.thicknessMm}mm` },
              { label: 'Cement Bags', value: result.cementBags },
              { label: 'Sand', value: `${result.sandM3} m³` },
            ].map(item => (
              <div key={item.label} className="bg-card rounded-md p-3 border border-border">
                <div className="text-xs text-muted-foreground">{item.label}</div>
                <div className="font-mono font-semibold text-primary mt-1">{item.value}</div>
              </div>
            ))}
          </div>
          <Button onClick={() => onComplete(result)} className="glow-primary mt-4">
            Proceed to Drawings <ArrowRight className="h-4 w-4" />
          </Button>
        </motion.div>
      )}
    </div>
  );
}
