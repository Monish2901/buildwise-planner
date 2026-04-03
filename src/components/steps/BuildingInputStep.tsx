import { useState } from 'react';
import { BuildingInput, BuildingOutput, calculateBuilding } from '@/lib/calculations';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Ruler, ArrowRight, Building, Sparkles } from 'lucide-react';

interface Props {
  onComplete: (input: BuildingInput, output: BuildingOutput) => void;
  initial?: BuildingInput;
}

export default function BuildingInputStep({ onComplete, initial }: Props) {
  const [length, setLength] = useState(initial?.length?.toString() || '');
  const [breadth, setBreadth] = useState(initial?.breadth?.toString() || '');
  const [height, setHeight] = useState(initial?.totalHeight?.toString() || '');
  const [result, setResult] = useState<BuildingOutput | null>(null);

  const calculate = () => {
    const input: BuildingInput = {
      length: parseFloat(length),
      breadth: parseFloat(breadth),
      totalHeight: parseFloat(height),
    };
    const output = calculateBuilding(input);
    setResult(output);
  };

  const handleNext = () => {
    if (result) {
      onComplete(
        { length: parseFloat(length), breadth: parseFloat(breadth), totalHeight: parseFloat(height) },
        result
      );
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-heading font-bold flex items-center gap-2">
          <Ruler className="h-5 w-5 text-primary" />
          Building Dimensions
        </h2>
        <p className="text-muted-foreground text-sm mt-1">Enter your building dimensions. Floor count is auto-detected (1 floor = 11 ft).</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label className="text-sm font-medium mb-1.5 block">Length (ft)</label>
          <Input type="number" value={length} onChange={e => setLength(e.target.value)} placeholder="e.g. 40" className="bg-secondary" />
        </div>
        <div>
          <label className="text-sm font-medium mb-1.5 block">Breadth (ft)</label>
          <Input type="number" value={breadth} onChange={e => setBreadth(e.target.value)} placeholder="e.g. 30" className="bg-secondary" />
        </div>
        <div>
          <label className="text-sm font-medium mb-1.5 block">Total Height (ft)</label>
          <Input type="number" value={height} onChange={e => setHeight(e.target.value)} placeholder="e.g. 33" className="bg-secondary" />
        </div>
      </div>

      <Button onClick={calculate} disabled={!length || !breadth || !height}>
        Calculate <ArrowRight className="h-4 w-4" />
      </Button>

      {result && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <div className="bg-white/5 border border-white/10 rounded-3xl p-6 md:p-8">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-3">
              <Building className="h-6 w-6 text-primary" /> Estimation Breakdown
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { label: 'Calculated Floors', value: result.floorLabel, sub: 'Auto-detected' },
                { label: 'Area/Floor', value: `${result.builtUpAreaPerFloor.toLocaleString()}`, unit: 'sq ft' },
                { label: 'Total Area', value: `${result.totalBuiltUpArea.toLocaleString()}`, unit: 'sq ft' },
                { label: 'Outer wall bricks', value: result.outerBricks.toLocaleString(), sub: '9" Thickness' },
                { label: 'Inner wall bricks', value: result.innerBricks.toLocaleString(), sub: '4.5" Thickness' },
                { label: 'TOTAL BRICKS', value: result.brickQuantity.toLocaleString(), highlight: true, sub: 'Final Count' },
              ].map(item => (
                <div key={item.label} className={`group relative rounded-2xl p-5 border transition-all ${item.highlight ? 'bg-primary/10 border-primary/30 shadow-[0_0_20px_rgba(0,255,255,0.1)]' : 'bg-card/40 border-white/5 hover:border-white/10'}`}>
                  <div className={`text-[10px] uppercase font-black tracking-[0.2em] mb-1 ${item.highlight ? 'text-primary' : 'text-muted-foreground'}`}>{item.label}</div>
                  <div className="flex items-baseline gap-1">
                    <div className={`font-mono font-bold text-2xl ${item.highlight ? 'text-primary' : 'text-foreground'}`}>{item.value}</div>
                    {item.unit && <span className="text-[10px] text-muted-foreground font-light">{item.unit}</span>}
                  </div>
                  {item.sub && <div className="text-[9px] text-muted-foreground mt-1 opacity-60 uppercase tracking-wider">{item.sub}</div>}
                </div>
              ))}
            </div>
            <div className="mt-8 p-4 bg-accent/5 border border-accent/10 rounded-xl flex items-center gap-3">
              <Sparkles className="h-4 w-4 text-accent animate-pulse" />
              <p className="text-[11px] text-accent/80 font-medium tracking-wide">
                10% opening deduction applied optimally for modular doors & windows.
              </p>
            </div>
          </div>
          <div className="flex justify-end">
            <Button onClick={handleNext} className="glow-primary h-14 px-10 rounded-2xl group text-base">
              Establish Grid Layout <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
