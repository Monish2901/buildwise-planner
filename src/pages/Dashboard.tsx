import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Construction, Plus, LogOut, Trash2, Calendar } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Project {
  id: string;
  name: string;
  current_step: number;
  created_at: string;
  building_data: any;
}

export default function Dashboard() {
  const { user, signOut } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .order('updated_at', { ascending: false });
    if (!error) setProjects(data || []);
    setLoading(false);
  };

  const createProject = async () => {
    const { data, error } = await supabase
      .from('projects')
      .insert({ user_id: user!.id, name: `Project ${projects.length + 1}` })
      .select()
      .single();
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      navigate(`/project/${data.id}`);
    }
  };

  const deleteProject = async (id: string) => {
    await supabase.from('projects').delete().eq('id', id);
    setProjects(projects.filter(p => p.id !== id));
    toast({ title: 'Project deleted' });
  };

  const stepLabels = ['Building Input', 'Column Grid', 'BHK Plan', 'Concrete Mix', 'Structural', 'Loads', 'Safety', 'Materials', 'Plastering', 'Drawings', 'Report'];

  return (
    <div className="min-h-screen blueprint-grid">
      <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto flex items-center justify-between py-4 px-4">
          <div className="flex items-center gap-3">
            <Construction className="h-7 w-7 text-primary" />
            <h1 className="text-xl font-heading font-bold text-gradient">BuildWise Planner</h1>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground hidden sm:inline">{user?.email}</span>
            <Button variant="ghost" size="icon" onClick={signOut}><LogOut className="h-4 w-4" /></Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto p-4 sm:p-6 max-w-5xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-heading font-bold">Your Projects</h2>
            <p className="text-muted-foreground text-sm mt-1">IS 456 & IS 10262 compliant structural designs</p>
          </div>
          <Button onClick={createProject} className="glow-primary">
            <Plus className="h-4 w-4" /> New Project
          </Button>
        </div>

        {loading ? (
          <div className="text-center py-20 text-muted-foreground">Loading...</div>
        ) : projects.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20 border border-dashed border-border rounded-lg"
          >
            <Construction className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-heading mb-2">No projects yet</h3>
            <p className="text-muted-foreground mb-6">Create your first structural design project</p>
            <Button onClick={createProject}><Plus className="h-4 w-4" /> Create Project</Button>
          </motion.div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((project, i) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-card border border-border rounded-lg p-5 hover:border-primary/50 transition-colors group cursor-pointer"
                onClick={() => navigate(`/project/${project.id}`)}
              >
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-heading font-semibold truncate">{project.name}</h3>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="opacity-0 group-hover:opacity-100 h-8 w-8"
                    onClick={(e) => { e.stopPropagation(); deleteProject(project.id); }}
                  >
                    <Trash2 className="h-3.5 w-3.5 text-destructive" />
                  </Button>
                </div>
                <div className="text-xs text-muted-foreground mb-3 flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {new Date(project.created_at).toLocaleDateString()}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded font-mono">
                    Step {project.current_step + 1}/{stepLabels.length}
                  </span>
                  <span className="text-xs text-muted-foreground">{stepLabels[project.current_step]}</span>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
