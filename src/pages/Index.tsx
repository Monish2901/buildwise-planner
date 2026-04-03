import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Building2, ArrowRight, Columns3, ShieldCheck, FileDown, Construction, Sparkles, Layout, PenTool } from 'lucide-react';

export default function Index() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen blueprint-grid flex flex-col relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px] -z-10 animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent/10 rounded-full blur-[120px] -z-10" />

      <header className="glass-header border-b border-white/5">
        <div className="container mx-auto flex items-center justify-between py-5 px-6">
          <div className="flex items-center gap-3 group cursor-default">
            <div className="bg-primary/20 p-2.5 rounded-xl border border-primary/30 group-hover:scale-110 transition-transform duration-300">
              <Construction className="h-6 w-6 text-primary" />
            </div>
            <span className="text-2xl font-bold tracking-tighter text-foreground group-hover:text-primary transition-colors">BuildWise<span className="text-primary font-light">Planner</span></span>
          </div>
          <Button onClick={() => navigate('/auth')} variant="ghost" className="hover:bg-primary/10 hover:text-primary border border-transparent hover:border-primary/20 rounded-full px-8">
            Sign In
          </Button>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-6 py-24 lg:py-32 flex flex-col items-center justify-center text-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }} 
          animate={{ opacity: 1, scale: 1 }} 
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative inline-block mb-8"
        >
          <div className="bg-primary/10 text-primary px-5 py-2 rounded-full text-[10px] font-bold uppercase tracking-[0.25em] border border-primary/20 flex items-center gap-2 mb-8 mx-auto">
            <Sparkles className="h-3.5 w-3.5 animate-bounce" />
            Empowering Modern Engineering
          </div>
          <h1 className="text-6xl md:text-8xl font-black mb-6 leading-[1] tracking-tighter">
            Architectural <br />
            <span className="text-gradient">Intelligence.</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-12 leading-relaxed font-light">
            Precision building estimation and professional AutoCAD generation. 
            Designing the future with IS 456 & 10262 compliance.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex flex-col sm:flex-row gap-5"
        >
          <Button size="lg" onClick={() => navigate('/auth')} className="glow-primary h-16 px-10 text-lg rounded-full group">
            Start Designing <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
          <Button variant="outline" size="lg" className="h-16 px-10 text-lg rounded-full border-white/10 hover:bg-white/5 backdrop-blur-sm">
            View Live Demo
          </Button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-32 w-full"
        >
          {[
            { icon: Layout, title: 'Smart Floor Plans', desc: 'Generate 1BHK–5BHK layouts instantly with auto-room scaling.' },
            { icon: PenTool, title: 'AutoCAD Engine', desc: 'Direct .SCR export for professional drafting on layered standards.' },
            { icon: ShieldCheck, title: 'Compliance First', desc: 'Real-time structural validation against global engineering codes.' },
          ].map(({ icon: Icon, title, desc }, i) => (
            <motion.div 
              key={title} 
              whileHover={{ y: -10 }}
              className="glass-card border border-white/5 rounded-3xl p-8 text-left group hover:border-primary/20 transition-all cursor-default relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <Icon className="h-24 w-24" />
              </div>
              <div className="bg-primary/10 w-14 h-14 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-primary group-hover:text-black transition-colors duration-500">
                <Icon className="h-7 w-7 text-primary group-hover:text-black" />
              </div>
              <h3 className="text-xl font-bold mb-3">{title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed leading-relaxed">{desc}</p>
            </motion.div>
          ))}
        </motion.div>

        <footer className="mt-32 pb-10 w-full border-t border-white/5 pt-10 text-center text-xs text-muted-foreground">
          <p>© 2024 BuildWise Planner | Built for Civil Engineers & Architects</p>
        </footer>
      </main>
    </div>
  );
}
