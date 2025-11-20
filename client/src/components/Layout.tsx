import { Link, useLocation } from "wouter";
import { Shield, Search, User, Menu, X, Terminal as TerminalIcon, Monitor, Radio, Skull, Sun, Moon, HardDrive } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Terminal } from "@/components/Terminal";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import bannerImage from "@assets/generated_images/digital_security_abstract_background.png";
import { useToast } from "@/hooks/use-toast";

export function Layout({ children }: { children: React.ReactNode }) {
  const [location, setLocation] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<{email: string} | null>(null);
  const [crtEnabled, setCrtEnabled] = useState(true);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const { toast } = useToast();

  useEffect(() => {
    const stored = localStorage.getItem('mock_user');
    if (stored) setUser(JSON.parse(stored));

    // Apply theme
    const root = window.document.documentElement;
    if (theme === 'light') {
        root.classList.add('light-mode');
    } else {
        root.classList.remove('light-mode');
    }
  }, [theme]);

  const handleLogout = () => {
    localStorage.removeItem('mock_user');
    setUser(null);
    setLocation('/login');
  };

  const handleDataBackup = () => {
      toast({
          title: "INITIATING_BACKUP...",
          description: "Connecting to encrypted storage vault...",
      });
      setTimeout(() => {
           toast({
              title: "SUCCESS: DATA_SAVED",
              description: "All local session data persisted to encrypted vault.",
              variant: "default", // In dark mode default is good, need check
           });
      }, 1500);
  };

  return (
    <div className={`min-h-screen bg-background text-foreground font-mono flex flex-col relative overflow-x-hidden ${crtEnabled ? 'crt' : ''}`}>
      {/* CRT Scanline (Global Overlay) */}
      {crtEnabled && <div className="scanline"></div>}

      {/* Background Image with Overlay */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-background/95 z-10 transition-colors duration-500"></div>
        <img src={bannerImage} alt="Background" className="w-full h-full object-cover opacity-10 grayscale contrast-150" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 z-20 mix-blend-overlay"></div>
      </div>

      {/* Ticker Tape */}
      <div className="bg-primary text-primary-foreground text-[10px] font-bold py-1 overflow-hidden whitespace-nowrap border-b border-primary z-50 relative">
        <div className="animate-marquee inline-block">
           <span className="mx-4">/// SYSTEM ALERT: ENCRYPTION PROTOCOLS UPDATED ///</span>
           <span className="mx-4">NEW DATABASE DUMP: 40GB_USER_DATA_LEAK.ZIP ///</span>
           <span className="mx-4">WARNING: UNAUTHORIZED ACCESS ATTEMPTS WILL BE LOGGED ///</span>
           <span className="mx-4">STATUS: DEFCON 4 ///</span>
           <span className="mx-4">LATEST BREACH: MOCK_CORP SERVER 03 ///</span>
           <span className="mx-4">USER_COUNT: 8,492 ONLINE ///</span>
           <span className="mx-4">/// SYSTEM ALERT: ENCRYPTION PROTOCOLS UPDATED ///</span>
           <span className="mx-4">NEW DATABASE DUMP: 40GB_USER_DATA_LEAK.ZIP ///</span>
        </div>
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-md transition-colors duration-500">
        <div className="container mx-auto flex h-16 items-center px-4">
          <div className="mr-4 hidden md:flex items-center">
            <Link href="/" className="mr-8 flex items-center space-x-2 group">
              <Skull className="h-8 w-8 text-primary group-hover:text-destructive transition-colors duration-300" />
              <div className="flex flex-col">
                  <span className="font-black tracking-[0.2em] text-xl glitch-text text-foreground" data-text="DOX_DB">
                    SCXBIN
                  </span>
                  <span className="text-[8px] text-primary uppercase tracking-widest">BD EXPOSE</span>
              </div>
            </Link>
            <nav className="flex items-center space-x-1 text-xs font-bold">
              <Link href="/">
                <Button variant="ghost" className={`rounded-none h-16 border-x border-transparent hover:bg-primary/10 hover:text-primary hover:border-primary/30 transition-all ${location === '/' ? 'border-primary/50 bg-primary/5 text-primary' : 'text-muted-foreground'}`}>
                    [DATABASE]
                </Button>
              </Link>
              <Link href="/tools">
                <Button variant="ghost" className={`rounded-none h-16 border-x border-transparent hover:bg-primary/10 hover:text-primary hover:border-primary/30 transition-all ${location === '/tools' ? 'border-primary/50 bg-primary/5 text-primary' : 'text-muted-foreground'}`}>
                    [TOOLS]
                </Button>
              </Link>
              <Link href="/about">
                <Button variant="ghost" className={`rounded-none h-16 border-x border-transparent hover:bg-primary/10 hover:text-primary hover:border-primary/30 transition-all ${location === '/about' ? 'border-primary/50 bg-primary/5 text-primary' : 'text-muted-foreground'}`}>
                    [ABOUT]
                </Button>
              </Link>
            </nav>
          </div>

          <button className="md:hidden mr-2 text-primary" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            {isMobileMenuOpen ? <X /> : <Menu />}
          </button>

          <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
             {/* Theme Toggle */}
             <Button 
                variant="ghost" 
                size="icon" 
                className="hidden md:flex h-8 w-8 rounded-none mr-1 text-muted-foreground hover:text-primary"
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                title="Toggle Day/Night Mode"
             >
                {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
             </Button>

             {/* CRT Toggle */}
             <Button 
                variant="outline" 
                size="sm" 
                className={`hidden md:flex h-8 border-border bg-background hover:bg-primary hover:text-background text-[10px] uppercase rounded-none mr-2 ${crtEnabled ? 'text-primary border-primary' : 'text-muted-foreground'}`}
                onClick={() => setCrtEnabled(!crtEnabled)}
             >
                <Monitor className="h-3 w-3 mr-1" /> {crtEnabled ? 'CRT: ON' : 'CRT: OFF'}
             </Button>

             {/* Data Store / Unlimited Storage Sim */}
             <Button 
                variant="outline" 
                size="sm" 
                className="hidden md:flex h-8 border-border bg-background hover:bg-primary hover:text-background text-[10px] uppercase rounded-none mr-4 text-muted-foreground"
                onClick={handleDataBackup}
                title="Sync with Unlimited Encrypted Vault"
             >
                <HardDrive className="h-3 w-3 mr-1" /> SYNC_VAULT
             </Button>

            <div className="w-full flex-1 md:w-auto md:flex-none">
              <div className="relative group">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                <Input
                  placeholder="SEARCH_QUERY..."
                  className="pl-8 h-9 md:w-[300px] lg:w-[400px] bg-background border border-border focus-visible:ring-1 focus-visible:ring-primary rounded-none placeholder:text-muted-foreground/30 text-primary font-mono text-xs uppercase"
                />
              </div>
            </div>
            
            {user ? (
               <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-9 w-9 rounded-none hover:bg-transparent p-0">
                    <div className="h-8 w-8 bg-primary text-black hover:bg-white transition-colors flex items-center justify-center border border-primary">
                        <span className="text-sm font-black">{user.email[0].toUpperCase()}</span>
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-64 bg-card border border-primary rounded-none text-primary shadow-[0_0_15px_rgba(0,255,0,0.2)]" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal border-b border-primary/30 pb-2">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-bold leading-none uppercase">{user.email}</p>
                      <p className="text-[10px] leading-none text-muted-foreground pt-1 font-mono">
                        ROLE: {user.email === 'admin@secure.com' ? <span className="text-red-500 font-bold glow-text">ADMINISTRATOR</span> : <span className="text-primary">STANDARD USER</span>}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuItem className="focus:bg-primary focus:text-black cursor-pointer rounded-none text-xs uppercase py-2" onClick={handleLogout}>
                    [ TERMINATE SESSION ]
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link href="/login">
                <Button className="h-9 rounded-none border border-primary bg-primary/10 text-primary hover:bg-primary hover:text-black uppercase text-xs font-bold tracking-widest transition-all shadow-[0_0_5px_rgba(0,255,0,0.3)]">
                  <User className="mr-2 h-4 w-4" />
                  Access
                </Button>
              </Link>
            )}
          </div>
        </div>
      </header>

      {isMobileMenuOpen && (
        <div className="md:hidden border-b border-border bg-background p-4 space-y-4 relative z-50">
          <Link href="/" onClick={() => setIsMobileMenuOpen(false)} className="block text-sm font-bold uppercase text-primary hover:bg-primary/20 p-2 border-l-2 border-transparent hover:border-primary">[DATABASE]</Link>
          <Link href="/tools" onClick={() => setIsMobileMenuOpen(false)} className="block text-sm font-bold uppercase text-primary hover:bg-primary/20 p-2 border-l-2 border-transparent hover:border-primary">[TOOLS]</Link>
          <Link href="/about" onClick={() => setIsMobileMenuOpen(false)} className="block text-sm font-bold uppercase text-primary hover:bg-primary/20 p-2 border-l-2 border-transparent hover:border-primary">[ABOUT]</Link>
          <div className="pt-2 border-t border-border">
            <button 
                className={`text-xs flex items-center gap-2 uppercase font-bold p-2 ${crtEnabled ? 'text-primary' : 'text-muted-foreground'}`}
                onClick={() => setCrtEnabled(!crtEnabled)}
            >
                <Monitor className="h-4 w-4" /> {crtEnabled ? 'DISABLE CRT' : 'ENABLE CRT'}
            </button>
            <button 
                className="text-xs flex items-center gap-2 uppercase font-bold p-2 text-muted-foreground hover:text-primary"
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            >
                {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />} {theme === 'dark' ? 'DAY MODE' : 'NIGHT MODE'}
            </button>
          </div>
        </div>
      )}

      <main className="flex-1 relative z-10 container mx-auto p-4 md:p-6">
        {children}
      </main>

      <footer className="border-t border-border bg-background py-8 relative z-10 mt-12 transition-colors duration-500">
        <div className="container flex flex-col md:flex-row items-start justify-between gap-8 px-4">
          <div className="space-y-2">
            <h3 className="text-primary font-black tracking-widest text-lg">DOX_DB</h3>
            <p className="text-[10px] text-muted-foreground max-w-xs leading-relaxed">
                NOTICE: ALL DATA CONTAINED HEREIN IS FOR EDUCATIONAL AND RESEARCH PURPOSES ONLY. 
                DO NOT USE FOR MALICIOUS ACTIVITY. 
                <br/><br/>
                EST. 2025 // SECURE_NODE_v4.2
            </p>
          </div>
          
          <div className="grid grid-cols-3 gap-12 text-[10px] uppercase text-muted-foreground">
            <div className="space-y-2">
                <h4 className="text-foreground font-bold mb-2">Links</h4>
                <a href="#" className="block hover:text-primary hover:underline">Tor Onion Service</a>
                <a href="#" className="block hover:text-primary hover:underline">PGP Keys</a>
                <a href="#" className="block hover:text-primary hover:underline">Canary</a>
            </div>
            
            <div className="space-y-2">
                <h4 className="text-foreground font-bold mb-2">Connect</h4>
                <div className="flex gap-3">
                    {/* Discord */}
                    <a href="#" className="hover:text-[#5865F2] transition-colors" title="Discord">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className="fill-current">
                            <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561 19.903 19.903 0 005.9937 3.0314.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057 13.111 13.111 0 01-1.8718-.8916.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8916.0766.0766 0 00-.0407.1067c.3604.699.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286 19.9042 19.9042 0 006.0027-3.0311.077.077 0 00.0321-.0544c.4233-4.234-.468-9.7744-3.5516-13.663a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0956 2.1568 2.419 0 1.3332-.9554 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0956 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z" />
                        </svg>
                    </a>
                    {/* Instagram */}
                    <a href="#" className="hover:text-[#E1306C] transition-colors" title="Instagram">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                            <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                            <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                        </svg>
                    </a>
                    {/* Facebook */}
                    <a href="#" className="hover:text-[#1877F2] transition-colors" title="Facebook">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className="fill-current">
                            <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                        </svg>
                    </a>
                </div>
            </div>

            <div className="space-y-2">
                <h4 className="text-foreground font-bold mb-2">Status</h4>
                 <div className="flex items-center space-x-2 text-green-500">
                    <Radio className="h-3 w-3 animate-pulse" />
                    <span>OPERATIONAL</span>
                 </div>
                 <div className="text-xs">
                    UPTIME: 99.99%
                 </div>
            </div>
          </div>
        </div>
        <div className="mt-8 text-center text-[10px] text-muted-foreground/50 font-mono">
            Running on REPLIT_SERVER_NODE // ENCRYPTED CONNECTION
        </div>
      </footer>
      
      {/* Terminal Overlay */}
      <Terminal />
    </div>
  );
}
