import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Construction, ArrowLeft, Save, FileDown, Check, Layout } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { generatePDFReport } from '@/lib/pdfReport';
import { generateAutoCADScript } from '@/lib/calculations';
import { motion, AnimatePresence } from 'framer-motion';
import BuildingInputStep from '@/components/steps/BuildingInputStep';
import ColumnGridStep from '@/components/steps/ColumnGridStep';
import BHKStep from '@/components/steps/BHKStep';
import ConcreteStep from '@/components/steps/ConcreteStep';
import LoadStep from '@/components/steps/LoadStep';
import MaterialStep from '@/components/steps/MaterialStep';
import PlasteringStep from '@/components/steps/PlasteringStep';
import DrawingsStep from '@/components/steps/DrawingsStep';

const STEP_LABELS = [
  'Building Input', 'Column Grid', 'BHK Plan', 'Concrete Mix',
  'Plastering', 'Drawings', 'Report'
];

export default function ProjectPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [step, setStep] = useState(0);
  const [projectName, setProjectName] = useState('');
  const [saving, setSaving] = useState(false);

  // All data states
  const [buildingInput, setBuildingInput] = useState<any>(null);
  const [building, setBuilding] = useState<any>(null);
  const [columnGrid, setColumnGrid] = useState<any>(null);
  const [bhkPlan, setBhkPlan] = useState<any>(null);
  const [concrete, setConcrete] = useState<any>(null);
  const [plastering, setPlastering] = useState<any>(null);
  const [structural, setStructural] = useState<any>(null); // Kept in state for background calc

  // Load existing project
  useEffect(() => {
    if (!id) return;
    supabase.from('projects').select('*').eq('id', id).single().then(({ data }) => {
      if (data) {
        setProjectName(data.name);
        setStep(data.current_step || 0);
        if (data.building_data?.input) { setBuildingInput(data.building_data.input); setBuilding(data.building_data.output); }
        if (data.column_data?.grid) setColumnGrid(data.column_data.grid);
        if (data.bhk_data?.plan) setBhkPlan(data.bhk_data.plan);
        if (data.concrete_data?.design) setConcrete(data.concrete_data.design);
        if (data.plastering_data?.calc) setPlastering(data.plastering_data.calc);
        if (data.structural_data?.design) setStructural(data.structural_data.design);
      }
    });
  }, [id]);

  const saveProject = useCallback(async (updates: any = {}) => {
    setSaving(true);
    await supabase.from('projects').update({
      name: projectName || 'Untitled Project',
      current_step: updates.step ?? step,
      building_data: { input: updates.buildingInput ?? buildingInput, output: updates.building ?? building },
      column_data: { grid: updates.columnGrid ?? columnGrid },
      bhk_data: { plan: updates.bhkPlan ?? bhkPlan },
      concrete_data: { design: updates.concrete ?? concrete },
      plastering_data: { calc: updates.plastering ?? plastering },
      structural_data: { design: updates.structural ?? structural },
    }).eq('id', id);
    setSaving(false);
  }, [id, projectName, step, buildingInput, building, columnGrid, bhkPlan, concrete, plastering, structural]);

  const goToStep = (newStep: number, updates: any = {}) => {
    setStep(newStep);
    saveProject({ ...updates, step: newStep });
  };

  const downloadPDF = () => {
    try {
      generatePDFReport({
        projectName, buildingInput, building, columnGrid, bhkPlan,
        concrete, plastering, structural
      });
      toast({ title: "Success", description: "PDF report downloaded." });
    } catch (error) {
      toast({ title: "Download Failed", variant: "destructive" });
    }
  };

  const downloadCAD = () => {
    if (!bhkPlan || !buildingInput) return;
    const script = generateAutoCADScript(bhkPlan, buildingInput.length, buildingInput.breadth, building.floors);
    const blob = new Blob([script], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${projectName || 'Project'}_AutoCAD_Script.scr`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast({ title: "CAD Export", description: "AutoCAD Script generated." });
  };

  // Background structural calculation logic
  const handleConcreteComplete = (design: any) => {
    // Generate structural defaults automatically since we removed the step
    const structuralDefaults = {
      columnWidth: 230,
      columnDepth: 300,
      beamWidth: 230,
      beamDepth: 450,
      slabThickness: 125,
      columnBars: '4-12mm',
      beamBars: '4-12mm',
      slabBars: '8mm @ 150mm',
      totalSteelKg: (buildingInput.length * buildingInput.breadth * building.floors) * 3.5, // Approx 3.5kg/sqft
    };
    setConcrete(design);
    setStructural(structuralDefaults);
    goToStep(4, { concrete: design, structural: structuralDefaults });
  };

  return (
    <div className="min-h-screen blueprint-grid relative">
      <header className="glass-header border-b border-white/5 py-4">
        <div className="container mx-auto flex items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')} className="hover:bg-primary/10 hover:text-primary rounded-full">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="h-10 w-px bg-white/10 hidden sm:block" />
            <div className="flex items-center gap-3 group">
              <div className="bg-primary/20 p-2 rounded-lg border border-primary/30 group-hover:scale-110 transition-transform">
                <Construction className="h-5 w-5 text-primary" />
              </div>
              <Input
                value={projectName}
                onChange={e => setProjectName(e.target.value)}
                onBlur={() => saveProject({})}
                className="bg-transparent border-none font-bold text-lg text-foreground focus-visible:ring-0 p-0 h-auto w-auto min-w-[150px]"
                placeholder="New Project"
              />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => saveProject({})} className="text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-full px-4">
              {saving ? <Check className="h-4 w-4 mr-2" /> : <Save className="h-4 w-4 mr-2" />}
              {saving ? 'Saved' : 'Auto-saving'}
            </Button>
            {step >= 4 && (
              <Button size="sm" onClick={downloadPDF} className="glow-primary rounded-full px-6">
                <FileDown className="h-4 w-4 mr-2" /> Export PDF
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Modern Step Indicator */}
      <div className="bg-background/40 backdrop-blur-sm border-b border-white/5">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
            {STEP_LABELS.map((label, i) => (
              <div key={i} className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => i <= step && setStep(i)}
                  className={`flex items-center gap-3 px-5 py-2.5 rounded-2xl text-xs font-bold transition-all ${
                    i === step
                      ? 'bg-primary text-black shadow-[0_0_15px_rgba(0,255,255,0.3)] shimmer'
                      : i < step
                        ? 'bg-secondary text-primary border border-primary/20'
                        : 'bg-white/5 text-muted-foreground border border-white/5 cursor-not-allowed'
                  }`}
                >
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${i <= step ? 'bg-black/10' : 'bg-white/10'}`}>
                    {i + 1}
                  </span>
                  {label}
                </button>
                {i < STEP_LABELS.length - 1 && (
                  <div className={`w-8 h-px ${i < step ? 'bg-primary/40' : 'bg-white/5'}`} />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <main className="container mx-auto px-6 py-12 max-w-5xl">
        <div className="glass-card border border-white/5 rounded-[2.5rem] p-8 md:p-12 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -z-10 translate-x-1/2 -translate-y-1/2" />
          
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.4 }}
          >
            {step === 0 && (
              <BuildingInputStep
                initial={buildingInput}
                onComplete={(input, output) => {
                  setBuildingInput(input);
                  setBuilding(output);
                  goToStep(1, { buildingInput: input, building: output });
                }}
              />
            )}
            {step === 1 && building && (
              <ColumnGridStep
                length={buildingInput.length}
                breadth={buildingInput.breadth}
                floors={building.floors}
                onComplete={(grid) => { setColumnGrid(grid); goToStep(2, { columnGrid: grid }); }}
              />
            )}
            {step === 2 && building && (
              <BHKStep
                length={buildingInput.length}
                breadth={buildingInput.breadth}
                floors={building.floors}
                onComplete={(plan) => { setBhkPlan(plan); goToStep(3, { bhkPlan: plan }); }}
              />
            )}
            {step === 3 && building && (
              <ConcreteStep
                floors={building.floors}
                onComplete={handleConcreteComplete}
              />
            )}
            {step === 4 && building && (
              <PlasteringStep
                lengthFt={buildingInput.length}
                breadthFt={buildingInput.breadth}
                floors={building.floors}
                onComplete={(c) => { setPlastering(c); goToStep(5, { plastering: c }); }}
              />
            )}
            {step === 5 && columnGrid && structural && (
              <DrawingsStep
                lengthFt={buildingInput.length}
                breadthFt={buildingInput.breadth}
                grid={columnGrid}
                bhkPlan={bhkPlan}
                floors={building.floors}
                beamWidth={structural.beamWidth}
                beamDepth={structural.beamDepth}
                slabThickness={structural.slabThickness}
                slabBars={structural.slabBars}
                onComplete={() => goToStep(6)}
              />
            )}
            {step === 6 && (
              <div className="text-center py-10 space-y-10">
                <div className="relative inline-block">
                  <div className="absolute inset-0 bg-success/20 blur-3xl rounded-full" />
                  <div className="relative inline-flex items-center justify-center w-28 h-28 rounded-full bg-success/10 border-2 border-success/30">
                    <Check className="h-14 w-14 text-success" />
                  </div>
                </div>
                <div className="space-y-4">
                  <h2 className="text-5xl font-black tracking-tighter">Planning Complete!</h2>
                  <p className="text-xl text-muted-foreground max-w-xl mx-auto font-light leading-relaxed">
                    Your professional architectural layouts and specialized concrete mix designs are ready. 
                    Verified against <span className="text-primary font-bold">IS 10262:2019</span> standards.
                  </p>
                </div>
                <div className="flex flex-wrap gap-4 justify-center pt-8">
                  <Button onClick={downloadPDF} className="glow-primary h-16 px-12 text-lg rounded-full shadow-2xl transition-transform hover:scale-105 active:scale-95">
                    <FileDown className="h-5 w-5 mr-3" /> Download PDF Report
                  </Button>
                  <Button onClick={downloadCAD} variant="outline" className="h-16 px-12 text-lg rounded-full border-white/10 hover:bg-white/5 backdrop-blur-sm group">
                    <Layout className="h-5 w-5 mr-3 group-hover:text-primary transition-colors" /> AutoCAD Script (.SCR)
                  </Button>
                  <Button variant="ghost" onClick={() => navigate('/dashboard')} className="h-16 px-10 text-lg rounded-full text-muted-foreground hover:text-foreground">
                    Project Dashboard
                  </Button>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </main>
    </div>
  );
}
