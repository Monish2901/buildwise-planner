import { useState, useEffect } from 'react';
import { MaterialEstimation, estimateMaterials } from '@/lib/calculations';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Package, ArrowRight } from 'lucide-react';

interface Props {
  lengthFt: number;
  breadthFt: number;
  floors: number;
  slabThickness: number;
  beamWidth: number;
  beamDepth: number;
  columnWidth: number;
  columnDepth: number;
  totalColumns: number;
  totalSteelKg: number;
  bricks: number;
  onComplete: (materials: MaterialEstimation) => void;
}

export default function MaterialStep(props: Props) {
  const [materials, setMaterials] = useState<MaterialEstimation | null>(null);

  useEffect(() => {
    setMaterials(estimateMaterials(
      props.lengthFt, props.breadthFt, props.floors,
      props.slabThickness, props.beamWidth, props.beamDepth,
      props.columnWidth, props.columnDepth, props.totalColumns, props.totalSteelKg, props.bricks
    ));
  }, []);

  if (!materials) return null;

  const items = [
    { label: 'Concrete', value: `${materials.concreteM3} m³`, color: 'text-primary' },
    { label: 'Steel', value: `${materials.steelKg} kg`, color: 'text-accent' },
    { label: 'Bricks', value: materials.bricks.toLocaleString(), color: 'text-primary' },
    { label: 'Mortar', value: `${materials.mortarM3} m³`, color: 'text-accent' },
    { label: 'Cement Bags', value: materials.cementBags, color: 'text-accent' },
    { label: 'Sand', value: `${materials.sandM3} m³`, color: 'text-primary' },
    { label: 'Aggregate', value: `${materials.aggregateM3} m³`, color: 'text-accent' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-heading font-bold flex items-center gap-2">
          <Package className="h-5 w-5 text-primary" />
          Material Estimation
        </h2>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {items.map((item, i) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.08 }}
            className="bg-card border border-border rounded-lg p-4 text-center"
          >
            <div className="text-xs text-muted-foreground mb-1">{item.label}</div>
            <div className={`font-mono font-bold text-lg ${item.color}`}>{item.value}</div>
          </motion.div>
        ))}
      </div>

      <Button onClick={() => props.onComplete(materials)} className="glow-primary">
        Proceed to Plastering <ArrowRight className="h-4 w-4" />
      </Button>
    </div>
  );
}
