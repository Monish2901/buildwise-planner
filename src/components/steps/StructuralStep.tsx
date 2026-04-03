import { useState, useEffect } from 'react';
import { StructuralDesign, calculateStructuralDesign } from '@/lib/calculations';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Columns3, ArrowRight } from 'lucide-react';

interface Props {
  lengthFt: number;
  breadthFt: number;
  floors: number;
  totalColumns: number;
  onComplete: (design: StructuralDesign) => void;
}

export default function StructuralStep({ lengthFt, breadthFt, floors, totalColumns, onComplete }: Props) {
  const [design, setDesign] = useState<StructuralDesign | null>(null);

  useEffect(() => {
    setDesign(calculateStructuralDesign(lengthFt, breadthFt, floors, totalColumns));
  }, [lengthFt, breadthFt, floors, totalColumns]);

  if (!design) return null;

  const sections = [
    {
      title: 'Column Design',
      items: [
        { label: 'Size', value: design.columnSize },
        { label: 'Reinforcement', value: design.columnBars },
        { label: 'Steel Required', value: `${design.columnSteelKg} kg` },
      ]
    },
    {
      title: 'Beam Design',
      items: [
        { label: 'Size', value: `${design.beamWidth}mm × ${design.beamDepth}mm` },
        { label: 'Reinforcement', value: design.beamBars },
        { label: 'Steel Required', value: `${design.beamSteelKg} kg` },
      ]
    },
    {
      title: 'Slab Design',
      items: [
        { label: 'Thickness', value: `${design.slabThickness}mm` },
        { label: 'Reinforcement', value: design.slabBars },
        { label: 'Steel Required', value: `${design.slabSteelKg} kg` },
      ]
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-heading font-bold flex items-center gap-2">
          <Columns3 className="h-5 w-5 text-primary" />
          Structural Design (IS 456)
        </h2>
        <p className="text-muted-foreground text-sm mt-1">Column, beam & slab design for {floors}-storey building</p>
      </div>

      <div className="grid gap-4">
        {sections.map(section => (
          <motion.div key={section.title} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="bg-secondary/50 border border-border rounded-lg p-4">
            <h3 className="font-heading font-semibold mb-3 text-accent">{section.title}</h3>
            <div className="grid grid-cols-3 gap-3">
              {section.items.map(item => (
                <div key={item.label} className="bg-card rounded-md p-3 border border-border">
                  <div className="text-xs text-muted-foreground">{item.label}</div>
                  <div className="font-mono font-semibold text-primary mt-1 text-sm">{item.value}</div>
                </div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>

      <div className="bg-primary/10 border border-primary/30 rounded-lg p-4">
        <div className="text-center">
          <div className="text-sm text-muted-foreground">Total Steel Required</div>
          <div className="text-3xl font-heading font-bold text-primary mt-1">{design.totalSteelKg} kg</div>
        </div>
      </div>

      <Button onClick={() => onComplete(design)} className="glow-primary">
        Proceed to Load Calculation <ArrowRight className="h-4 w-4" />
      </Button>
    </div>
  );
}
