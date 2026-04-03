import { useState } from 'react';
import { PlasteringCalc, calculatePlastering } from '@/lib/calculations';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { motion } from 'framer-motion';
import { PaintBucket, ArrowRight, List } from 'lucide-react';

interface Props {
  lengthFt: number;
  breadthFt: number;
  floors: number;
  onComplete: (calc: PlasteringCalc) => void;
}

export default function PlasteringStep({ lengthFt, breadthFt, floors, onComplete }: Props) {
  const [thickness, setThickness] = useState('12');
  const [cementRatio, setCementRatio] = useState('1');
  const [sandRatio, setSandRatio] = useState('6');
  const [result, setResult] = useState<PlasteringCalc | null>(null);

  const calculate = () => {
    setResult(calculatePlastering(
        lengthFt, 
        breadthFt, 
        floors, 
        parseFloat(thickness) || 12,
        parseFloat(cementRatio) || 1,
        parseFloat(sandRatio) || 6
    ));
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-heading font-bold flex items-center gap-2">
          <PaintBucket className="h-5 w-5 text-primary" />
          Plastering Estimation (IS 1200)
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Strict IS 1200 estimation (External: 1 side, Internal: 1.5x perimeter, 1.33 dry volume factor).
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
        <div>
          <label className="text-sm font-medium mb-1.5 block">Plaster Thickness (mm)</label>
          <div className="flex gap-2">
            {['6', '12', '15', '20'].map(t => (
              <button
                key={t}
                onClick={() => setThickness(t)}
                className={`flex-1 py-1.5 rounded-md border text-sm font-mono transition-colors ${
                  thickness === t ? 'border-primary bg-primary/10 text-primary' : 'border-border bg-secondary hover:bg-secondary/80'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="text-sm font-medium mb-1.5 block">Mix Ratio (Cement : Sand)</label>
          <div className="flex items-center gap-2">
            <Input 
              type="number" 
              value={cementRatio} 
              onChange={e => setCementRatio(e.target.value)} 
              className="w-full text-center"
            />
            <span>:</span>
            <Input 
              type="number" 
              value={sandRatio} 
              onChange={e => setSandRatio(e.target.value)} 
              className="w-full text-center"
            />
          </div>
        </div>
        <div>
          <Button onClick={calculate} className="w-full">Calculate</Button>
        </div>
      </div>

      {result && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: 'External Area', value: `${result.externalArea} m²` },
              { label: 'Internal Area', value: `${result.internalArea} m²` },
              { label: 'Total Area', value: `${result.totalArea} m²` },
              { label: 'Wet Volume', value: `${result.wetVolume} m³` },
              { label: 'Dry Volume', value: `${result.dryVolume} m³` },
              { label: 'Cement Required', value: `${result.cementBags} bags` },
              { label: 'Sand Required', value: `${result.sandM3} m³` },
            ].map(item => (
              <div key={item.label} className="bg-card rounded-md p-3 border border-border">
                <div className="text-xs text-muted-foreground">{item.label}</div>
                <div className="font-mono font-semibold text-primary mt-1 text-sm">{item.value}</div>
              </div>
            ))}
          </div>

          <div className="bg-secondary/30 rounded-lg p-4 border border-border">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <List className="h-4 w-4 text-primary" />
              Calculation Steps
            </h3>
            <div className="space-y-2 text-sm text-muted-foreground font-mono">
              {result.steps.map((step, idx) => (
                <div key={idx} className="pb-2 border-b border-border/50 last:border-0 last:pb-0">
                  {step}
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end">
            <Button onClick={() => onComplete(result)} className="glow-primary mt-4">
              Proceed to Drawings <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
