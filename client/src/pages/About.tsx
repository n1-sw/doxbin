import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Shield, Lock, Globe, Server, Cpu, Terminal, Activity } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default function About() {
  const [text, setText] = useState("");
  const fullText = "INITIATING_SYSTEM_MANIFESTO... LOADING_CORE_VALUES... [COMPLETE]";

  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      setText(fullText.slice(0, i));
      i++;
      if (i > fullText.length) clearInterval(interval);
    }, 50);
    return () => clearInterval(interval);
  }, []);

  const stats = [
    { label: "ENCRYPTION", value: "AES-256", icon: Lock },
    { label: "NODES", value: "8,492", icon: Globe },
    { label: "UPTIME", value: "99.99%", icon: Activity },
    { label: "ARCHIVE", value: "42TB", icon: Server },
  ];

  return (
    <div className="container mx-auto py-12 px-4 max-w-5xl space-y-12">
      {/* Manifesto Section */}
      <div className="space-y-6">
        <div className="font-mono text-primary text-sm h-6 mb-4">{text}<span className="animate-pulse">_</span></div>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.5 }}
          className="border-l-2 border-primary pl-6 space-y-4"
        >
          <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter glitch-text" data-text="MISSION_PROTOCOL">
            MISSION_PROTOCOL
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl leading-relaxed font-mono">
            Information wants to be free. We are the custodians of the digital truth. 
            In a world of surveillance and censorship, DOX_DB serves as the immutable archive 
            of cyber-security incidents, threat intelligence, and digital forensics.
          </p>
        </motion.div>
      </div>

      {/* Social Links Section */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.8 }}
        className="flex gap-6 justify-start pt-4"
      >
          <a href="#" className="group flex items-center gap-2 text-muted-foreground hover:text-[#5865F2] transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="fill-current">
                <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561 19.903 19.903 0 005.9937 3.0314.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057 13.111 13.111 0 01-1.8718-.8916.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8916.0766.0766 0 00-.0407.1067c.3604.699.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286 19.9042 19.9042 0 006.0027-3.0311.077.077 0 00.0321-.0544c.4233-4.234-.468-9.7744-3.5516-13.663a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0956 2.1568 2.419 0 1.3332-.9554 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0956 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z" />
            </svg>
            <span className="font-bold text-sm tracking-widest">DISCORD</span>
          </a>
          <a href="#" className="group flex items-center gap-2 text-muted-foreground hover:text-[#E1306C] transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
            </svg>
            <span className="font-bold text-sm tracking-widest">INSTAGRAM</span>
          </a>
          <a href="#" className="group flex items-center gap-2 text-muted-foreground hover:text-[#1877F2] transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="fill-current">
                <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
            </svg>
            <span className="font-bold text-sm tracking-widest">FACEBOOK</span>
          </a>
      </motion.div>

      {/* Specs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 2 + (index * 0.1) }}
          >
            <Card className="bg-black/50 border-primary/30 rounded-none hover:border-primary transition-colors group">
              <CardContent className="p-6 flex flex-col items-center text-center space-y-2">
                <stat.icon className="h-8 w-8 text-primary/50 group-hover:text-primary transition-colors" />
                <span className="text-xs text-muted-foreground font-bold tracking-widest">{stat.label}</span>
                <span className="text-2xl font-black text-white font-mono">{stat.value}</span>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Infrastructure Visual */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.5 }}
        className="border border-border bg-black p-8 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 p-4 opacity-20">
          <Cpu className="h-64 w-64 text-primary animate-pulse" />
        </div>
        
        <div className="relative z-10 grid md:grid-cols-2 gap-12">
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <Terminal className="h-5 w-5 text-primary" />
              INFRASTRUCTURE_MAP
            </h2>
            <ul className="space-y-4 font-mono text-sm text-muted-foreground">
              <li className="flex items-center gap-3">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                <span className="text-primary">NODE_ALPHA:</span> 
                Underground Server Farm (Location: [REDACTED])
              </li>
              <li className="flex items-center gap-3">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                <span className="text-primary">NODE_BETA:</span> 
                Decentralized Mesh Network
              </li>
              <li className="flex items-center gap-3">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                <span className="text-primary">NODE_GAMMA:</span> 
                Cold Storage Backup (Air-gapped)
              </li>
            </ul>
          </div>

          <div className="font-mono text-[10px] text-primary/60 space-y-1 p-4 bg-primary/5 border border-primary/10">
            <p>&gt; root@dox_db:~# status check</p>
            <p>&gt; Checking integrity...</p>
            <p className="text-green-500">&gt; OK</p>
            <p>&gt; Verifying PGP signatures...</p>
            <p className="text-green-500">&gt; OK</p>
            <p>&gt; Scanning for intruders...</p>
            <p className="text-green-500">&gt; 0 THREATS FOUND</p>
            <p>&gt; System load: 12%</p>
            <p>&gt; Memory usage: 4.2GB / 64GB</p>
            <p className="animate-pulse">&gt; _</p>
          </div>
        </div>
      </motion.div>

      <div className="text-center pt-12">
        <p className="text-xs text-muted-foreground font-mono">
          EST. 2025 // DO NOT DISTRIBUTE // EYES ONLY
        </p>
      </div>
    </div>
  );
}
