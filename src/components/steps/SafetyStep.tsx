import { useState, useEffect } from 'react';
import { SafetyCheck, performSafetyChecks } from '@/lib/calculations';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { ShieldCheck, ShieldAlert, ArrowRight, CheckCircle2, XCircle } from 'lucide-react';

interface Props {
  beamDepth: number;
  beamWidth: number;
  slabThickness: number;
  lengthFt: number;
  breadthFt: number;
  totalLoad: number;
  floors: number;
  onComplete: (checks: SafetyCheck[]) => void;
}

export default function SafetyStep({ beamDepth, beamWidth, slabThickness, lengthFt, breadthFt, totalLoad, floors, onComplete }: Props) {
  const [checks, setChecks] = useState<SafetyCheck[]>([]);

  useEffect(() => {
    const spanM = Math.max(lengthFt, breadthFt) * 0.3048 / (Math.ceil(Math.max(lengthFt, breadthFt) / 15));
    setChecks(performSafetyChecks(beamDepth, beamWidth, slabThickness, spanM, totalLoad, floors));
  }, [beamDepth, beamWidth, slabThickness, lengthFt, breadthFt, totalLoad, floors]);

  const allSafe = checks.every(c => c.status === 'SAFE');

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-heading font-bold flex items-center gap-2">
          {allSafe ? <ShieldCheck className="h-5 w-5 text-success" /> : <ShieldAlert className="h-5 w-5 text-warning" />}
          Safety Checks (IS 456)
        </h2>
      </div>

      <div className="space-y-3">
        {checks.map((check, i) => (
          <motion.div
            key={check.name}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className={`border rounded-lg p-4 ${
              check.status === 'SAFE' ? 'border-success/30 bg-success/5' : 'border-destructive/30 bg-destructive/5'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-heading font-semibold flex items-center gap-2">
                {check.status === 'SAFE'
                  ? <CheckCircle2 className="h-4 w-4 text-success" />
                  : <XCircle className="h-4 w-4 text-destructive" />
                }
                {check.name}
              </h3>
              <span className={`text-sm font-mono font-bold ${
                check.status === 'SAFE' ? 'text-success' : 'text-destructive'
              }`}>
                {check.status}
              </span>
            </div>
            <div className="font-mono text-sm text-muted-foreground">
              Actual: {check.actual} {check.unit} | Limit: {check.limit} {check.unit}
            </div>
            {check.suggestion && (
              <div className="mt-2 text-sm text-warning bg-warning/10 rounded p-2">
                💡 {check.suggestion}
              </div>
            )}
          </motion.div>
        ))}
      </div>

      <Button onClick={() => onComplete(checks)} className="glow-primary">
        Proceed to Materials <ArrowRight className="h-4 w-4" />
      </Button>
    </div>
  );
}
