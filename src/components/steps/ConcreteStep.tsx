import { useState, useEffect } from 'react';
import { ConcreteDesign, calculateConcreteMix } from '@/lib/calculations';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { motion, AnimatePresence } from 'framer-motion';
import { Droplets, ArrowRight, FlaskConical, Shovel, Info, AlertTriangle, Scale } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from '@/components/ui/label';

interface Props {
  floors: number;
  onComplete: (design: ConcreteDesign) => void;
}

const grades = ['M20', 'M25', 'M30', 'M35', 'M40', 'M45', 'M50', 'M55', 'M60'];
const exposures = ['Mild', 'Moderate', 'Severe', 'Very Severe', 'Extreme'];

export default function ConcreteStep({ floors, onComplete }: Props) {
  const [params, setParams] = useState({
    grade: 'M25',
    exposure: 'Moderate',
    slump: 100,
    aggSize: 20,
    sandZone: 2,
    sgCement: 3.15,
    sgFA: 2.65,
    sgCA: 2.74,
    absorption: 1.0,
    moisture: 2.0,
    cementType: 'OPC 43',
    admixturePercent: 1.0,
    volume: 10
  });

  const [design, setDesign] = useState<ConcreteDesign | null>(null);

  const calculate = () => {
    setDesign(calculateConcreteMix(params));
  };

  return (
    <div className="space-y-8 pb-10">
      <div>
        <h2 className="text-2xl font-heading font-bold flex items-center gap-2">
          <FlaskConical className="h-6 w-6 text-primary" />
          Professional Design Mix (M20–M60)
        </h2>
        <p className="text-muted-foreground text-sm mt-1">
          High-performance concrete calculation as per <span className="text-accent font-bold">IS 10262:2019</span>
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Input Column 1: Main Params */}
        <div className="space-y-5 bg-card/40 p-5 rounded-xl border border-border">
          <h3 className="text-xs font-bold uppercase tracking-widest text-primary flex items-center gap-2">
            <Info className="h-3 w-3" /> Phase 1: Requirements
          </h3>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Grade of Concrete</Label>
              <Select value={params.grade} onValueChange={(v) => setParams({...params, grade: v})}>
                <SelectTrigger className="font-mono"><SelectValue /></SelectTrigger>
                <SelectContent>{grades.map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Exposure Condition</Label>
              <Select value={params.exposure} onValueChange={(v) => setParams({...params, exposure: v})}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{exposures.map(e => <SelectItem key={e} value={e}>{e}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Slump (mm)</Label>
                <Input type="number" value={params.slump} onChange={e => setParams({...params, slump: +e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label>Total Vol (m³)</Label>
                <Input type="number" value={params.volume} onChange={e => setParams({...params, volume: +e.target.value})} />
              </div>
            </div>
          </div>
        </div>

        {/* Input Column 2: Materials */}
        <div className="space-y-5 bg-card/40 p-5 rounded-xl border border-border">
          <h3 className="text-xs font-bold uppercase tracking-widest text-primary flex items-center gap-2">
            <Scale className="h-3 w-3" /> Phase 2: Material SG
          </h3>
          <div className="grid grid-cols-1 gap-4">
            <div className="flex items-center justify-between gap-4">
              <Label className="text-xs">Cement SG</Label>
              <Input className="w-24 h-8" type="number" step="0.01" value={params.sgCement} onChange={e => setParams({...params, sgCement: +e.target.value})} />
            </div>
            <div className="flex items-center justify-between gap-4">
              <Label className="text-xs">Fine Agg SG</Label>
              <Input className="w-24 h-8" type="number" step="0.01" value={params.sgFA} onChange={e => setParams({...params, sgFA: +e.target.value})} />
            </div>
            <div className="flex items-center justify-between gap-4">
              <Label className="text-xs">Coarse Agg SG</Label>
              <Input className="w-24 h-8" type="number" step="0.01" value={params.sgCA} onChange={e => setParams({...params, sgCA: +e.target.value})} />
            </div>
            <div className="space-y-2 pt-2">
              <Label className="text-xs">Aggregate Size & Zone</Label>
              <div className="flex gap-2">
                <Select value={params.aggSize.toString()} onValueChange={v => setParams({...params, aggSize: +v})}>
                  <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="10">10mm</SelectItem><SelectItem value="20">20mm</SelectItem></SelectContent>
                </Select>
                <Select value={params.sandZone.toString()} onValueChange={v => setParams({...params, sandZone: +v})}>
                  <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>{[1,2,3,4].map(z => <SelectItem key={z} value={z.toString()}>Zone {z}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>

        {/* Input Column 3: Site Data */}
        <div className="space-y-5 bg-card/40 p-5 rounded-xl border border-border">
          <h3 className="text-xs font-bold uppercase tracking-widest text-primary flex items-center gap-2">
            <Shovel className="h-3 w-3" /> Phase 3: Site Correction
          </h3>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs flex justify-between">Moisture {params.moisture}%</Label>
              <input type="range" min="0" max="10" step="0.5" value={params.moisture} onChange={e => setParams({...params, moisture: +e.target.value})} className="w-full h-1.5 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs flex justify-between">Absorption {params.absorption}%</Label>
              <input type="range" min="0" max="5" step="0.1" value={params.absorption} onChange={e => setParams({...params, absorption: +e.target.value})} className="w-full h-1.5 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary" />
            </div>
            <div className="pt-2">
              <Label className="text-xs">Admixture (%)</Label>
              <Input type="number" step="0.1" value={params.admixturePercent} onChange={e => setParams({...params, admixturePercent: +e.target.value})} className="mt-1" />
            </div>
            <Button onClick={calculate} className="w-full h-12 mt-4 shadow-xl">Run Design Analysis</Button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {design && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
            {/* Warning Banner */}
            <div className="bg-amber-500/10 border border-amber-500/30 p-4 rounded-lg flex items-start gap-4">
              <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
              <div className="text-sm text-amber-200 leading-relaxed font-medium">
                {design.warning}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Lab Results (Theoretical) */}
              <div className="bg-secondary/30 border border-border rounded-2xl p-6">
                <h3 className="font-heading font-bold mb-6 text-primary flex items-center justify-between">
                  <span>Theoretical Mix (Lab)</span>
                  <span className="text-[10px] bg-primary/20 text-primary px-2 py-0.5 rounded">Standard: 1m³</span>
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: 'Cement', value: `${(design.cementKg / design.volumeM3).toFixed(1)} kg` },
                    { label: 'Water', value: `${(design.waterLiters / design.volumeM3).toFixed(1)} L` },
                    { label: 'Fine Agg', value: `${(design.sandKg / design.volumeM3).toFixed(1)} kg` },
                    { label: 'Coarse Agg', value: `${(design.aggregateKg / design.volumeM3).toFixed(1)} kg` },
                  ].map(item => (
                    <div key={item.label} className="bg-card/50 p-4 rounded-xl border border-border/50">
                      <div className="text-[10px] text-muted-foreground uppercase">{item.label}</div>
                      <div className="text-lg font-mono font-bold mt-1">{item.value}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Site Adjusted Results */}
              <div className="bg-primary/5 border border-primary/20 rounded-2xl p-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-3 opacity-10"><Shovel className="h-12 w-12" /></div>
                <h3 className="font-heading font-bold mb-6 text-accent flex items-center justify-between">
                  <span>Corrected Site Values</span>
                  <span className="text-[10px] bg-accent/20 text-accent px-2 py-0.5 rounded">Total: {design.volumeM3}m³</span>
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: 'Corrected Water', value: `${design.correctedWater} L`, highlight: true },
                    { label: 'Admixture', value: `${design.admixtureKg} kg` },
                    { label: 'Wet Sand', value: `${design.correctedSand} kg` },
                    { label: 'Wet CA', value: `${design.correctedAgg} kg` },
                  ].map(item => (
                    <div key={item.label} className={`p-4 rounded-xl border ${item.highlight ? 'bg-primary/20 border-primary' : 'bg-card/50 border-border/50'}`}>
                      <div className="text-[10px] text-muted-foreground uppercase">{item.label}</div>
                      <div className="text-lg font-mono font-bold mt-1">{item.value}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Trial Simulation */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-3">
                <span className="h-px bg-border flex-1"></span>
                Phase 3: Trial Mix Matrix
                <span className="h-px bg-border flex-1"></span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {design.trials.map(trial => (
                  <div key={trial.id} className="bg-card border border-border p-5 rounded-2xl hover:bg-secondary/20 transition-all cursor-default">
                    <div className="text-xs font-bold text-primary mb-3">Trial {trial.id}: {trial.label}</div>
                    <div className="space-y-2 text-xs font-mono">
                      <div className="flex justify-between"><span>W/C:</span> <span className="text-accent">{trial.wcr.toFixed(3)}</span></div>
                      <div className="flex justify-between"><span>Cement:</span> <span>{trial.cementKg.toFixed(1)} kg</span></div>
                      <div className="flex justify-between"><span>Water:</span> <span>{trial.waterLiters.toFixed(1)} L</span></div>
                      <div className="flex justify-between"><span>Admix:</span> <span>{trial.admixture}%</span></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-center pt-6">
              <Button onClick={() => onComplete(design)} className="glow-primary h-14 px-12 text-lg">
                Finalize Design Mix <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
