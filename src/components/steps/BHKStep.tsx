import { useState, useEffect } from 'react';
import { BHKPlan, generateBHKPlan, BHKSelection } from '@/lib/calculations';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Home, ArrowRight, BedDouble, Square, SquareStack, LayoutGrid } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

interface Props {
  length: number;
  breadth: number;
  floors: number;
  onComplete: (plan: BHKPlan) => void;
}

const bhkOptions = [1, 2, 3, 4, 5];

export default function BHKStep({ length, breadth, floors, onComplete }: Props) {
  const [selection, setSelection] = useState<BHKSelection>({
    bhk: 2,
    carParking: false,
    masterBedroom: true,
    diningRoom: true,
    storeRoom: false,
    studyRoom: false,
    poojaRoom: false,
    laundryRoom: false,
  });
  const [plan, setPlan] = useState<BHKPlan | null>(null);

  useEffect(() => {
    setPlan(generateBHKPlan(selection, length, breadth, floors));
  }, [selection, length, breadth, floors]);

  const toggleOption = (key: keyof BHKSelection) => {
    setSelection(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-heading font-bold flex items-center gap-2">
          <Home className="h-5 w-5 text-primary" />
          Smart Residential Planner
        </h2>
        <p className="text-muted-foreground text-sm mt-1">Configure your BHK type and optional rooms (IS 456 & Civil Standards)</p>
      </div>

      <div className="space-y-6">
        <label className="text-[11px] uppercase font-black tracking-[0.2em] text-primary flex items-center gap-2 mb-4">
          <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
          1. CONFIGURATION TYPE
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
          {bhkOptions.map(bhk => (
            <button
              key={bhk}
              onClick={() => setSelection(prev => ({ ...prev, bhk }))}
              className={`py-4 rounded-2xl border-2 text-center transition-all duration-300 font-bold tracking-tight ${
                selection.bhk === bhk
                  ? 'border-primary bg-primary/10 text-primary shadow-[0_0_20px_rgba(0,255,255,0.2)] scale-105'
                  : 'border-white/5 bg-white/5 text-muted-foreground hover:border-white/20'
              }`}
            >
              {bhk} BHK
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-6">
        <label className="text-[11px] uppercase font-black tracking-[0.2em] text-primary flex items-center gap-2 mb-4">
          <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
          2. OPTIONAL MODULAR SPACES
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 bg-white/5 p-8 rounded-[2rem] border border-white/5">
          {[
            { id: 'carParking', label: 'Car Parking' },
            { id: 'masterBedroom', label: 'Master Bedroom' },
            { id: 'diningRoom', label: 'Dining Room' },
            { id: 'storeRoom', label: 'Store Room' },
            { id: 'studyRoom', label: 'Study Room' },
            { id: 'poojaRoom', label: 'Pooja Room' },
            { id: 'laundryRoom', label: 'Laundry Room' },
          ].map(opt => (
            <div key={opt.id} className="flex items-center justify-between p-2 hover:bg-white/5 rounded-xl transition-colors">
              <Label htmlFor={opt.id} className="text-sm font-medium tracking-tight cursor-pointer opacity-80">{opt.label}</Label>
              <Switch
                id={opt.id}
                checked={(selection as any)[opt.id]}
                onCheckedChange={() => toggleOption(opt.id as any)}
                className="data-[state=checked]:bg-primary"
              />
            </div>
          ))}
        </div>
      </div>

      {plan && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-10">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              { icon: LayoutGrid, label: 'Carpet Area', value: plan.carpetArea, unit: 'sq ft', color: 'primary' },
              { icon: SquareStack, label: 'Wall Area', value: plan.wallArea, unit: 'sq ft', color: 'accent' },
              { icon: Square, label: 'Built-up Area', value: plan.builtUpArea, unit: 'sq ft', color: 'foreground' },
            ].map(stat => (
              <div key={stat.label} className="bg-white/5 border border-white/5 rounded-3xl p-5 flex items-center gap-4 hover:border-white/10 transition-all">
                <div className={`p-2.5 rounded-xl bg-${stat.color}/10 border border-${stat.color}/20`}>
                  <stat.icon className={`h-5 w-5 text-${stat.color}`} />
                </div>
                <div>
                  <div className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">{stat.label}</div>
                  <div className="font-mono font-bold text-xl">{stat.value} <span className="text-[10px] font-light ml-1 opacity-60">{stat.unit}</span></div>
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-10">
            {Array.from({ length: floors }).map((_, floorIdx) => (
              <div key={floorIdx} className="bg-white/5 border border-white/5 rounded-[2.5rem] p-8 md:p-10 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                  <Home className="h-32 w-32" />
                </div>
                <h3 className="text-2xl font-black mb-8 flex justify-between items-end border-b border-white/5 pb-6">
                  <span>{floorIdx === 0 ? 'Ground' : (floorIdx === 1 ? 'First' : `${floorIdx + 1}th`)} <span className="text-primary">Floor Plan</span></span>
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.3em] pb-1.5 opacity-60">Architectural Standard</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {plan.rooms.filter(r => r.floor === floorIdx).map((room, i) => (
                    <div key={i} className="bg-card/40 backdrop-blur-md rounded-2xl p-5 border border-white/5 flex items-center gap-5 hover:border-primary/40 hover:bg-primary/5 transition-all group/room">
                      <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center shrink-0 group-hover/room:bg-primary group-hover/room:text-black transition-colors duration-500">
                        <BedDouble className="h-5 w-5 opacity-60 group-hover/room:opacity-100" />
                      </div>
                      <div className="min-w-0">
                        <div className="font-bold tracking-tight text-base mb-1">{room.name}</div>
                        <div className="text-[11px] font-mono text-muted-foreground bg-white/5 px-2 py-0.5 rounded inline-block">
                          {room.lengthFt}' × {room.breadthFt}' <span className="mx-1 opacity-30">|</span> {room.area} <span className="text-[9px]">sq ft</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-end">
            <Button onClick={() => onComplete(plan)} className="glow-primary h-14 px-12 rounded-2xl group text-base">
              Establish Concrete Mix <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
