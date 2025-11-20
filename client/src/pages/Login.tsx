import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ShieldAlert, User, Lock, Fingerprint, Globe, EyeOff, Key, UserPlus, ArrowRight } from "lucide-react";
import { terminalEvents } from "@/components/Terminal";
import { motion, AnimatePresence } from "framer-motion";

export default function Login() {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [step, setStep] = useState<'credentials' | '2fa' | 'verifying'>('credentials');
  const [twoFaCode, setTwoFaCode] = useState("");
  const [, setLocation] = useLocation();
  const [loadingText, setLoadingText] = useState("VERIFYING HASH...");
  const [userIp, setUserIp] = useState("LOADING...");

  useEffect(() => {
    setTimeout(() => {
        setUserIp(`${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.X`);
    }, 1500);
  }, []);

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
        setError("All fields are required.");
        terminalEvents.emit('AUTH_ERROR: MISSING_FIELDS', 'error');
        return;
    }

    if (password.length < 4) {
        setError("Password too short (min 4 chars).");
        terminalEvents.emit('AUTH_ERROR: WEAK_PASSWORD', 'warning');
        return;
    }

    if (mode === 'register') {
        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            terminalEvents.emit('AUTH_ERROR: PASSWORD_MISMATCH', 'error');
            return;
        }
        
        // Check if user exists in mock DB
        const users = JSON.parse(localStorage.getItem('mock_users_db') || '{}');
        if (users[email]) {
            setError("User already exists.");
            terminalEvents.emit('AUTH_ERROR: USER_EXISTS', 'error');
            return;
        }

        // Register user
        users[email] = { password, isAdmin: false }; // New users are never admin
        localStorage.setItem('mock_users_db', JSON.stringify(users));
        
        terminalEvents.emit('REGISTRATION_SUCCESS: NEW_NODE_CREATED', 'success');
        setMode('login');
        setError("");
        // Auto-fill for login
        return;
    }

    // Login Mode
    // Check Admin Hardcoded
    if (email === 'admin@secure.com') {
        if (password === 'secure123') {
             // Admin Success
             proceedTo2FA();
             return;
        } else {
            setError("Invalid credentials.");
            terminalEvents.emit('AUTH_FAIL: ADMIN_ACCESS_DENIED', 'error');
            return;
        }
    }

    // Check Regular Users
    const users = JSON.parse(localStorage.getItem('mock_users_db') || '{}');
    if (users[email] && users[email].password === password) {
        proceedTo2FA();
    } else {
        // Fallback for the quick-access mock user if not in DB yet
        if (email === 'user@example.com' && password === 'user123') {
             proceedTo2FA();
             return;
        }
        setError("Invalid credentials.");
        terminalEvents.emit('AUTH_FAIL: INVALID_CREDENTIALS', 'error');
    }
  };

  const proceedTo2FA = () => {
      setStep('2fa');
      terminalEvents.emit('CREDENTIALS_ACCEPTED. INITIATING_2FA...', 'info');
  };

  const handle2FA = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (twoFaCode.length < 3) {
        setError("Invalid 2FA Code");
        terminalEvents.emit('2FA_ERROR: INVALID_CODE', 'error');
        return;
    }

    setStep('verifying');
    
    const sequence = [
        "HANDSHAKING_WITH_NODE...",
        "DECRYPTING_USER_KEY...",
        "VERIFYING_BIOMETRICS...",
        "ACCESS_GRANTED"
    ];

    sequence.forEach((msg, idx) => {
        setTimeout(() => {
            setLoadingText(msg);
            terminalEvents.emit(msg, idx === sequence.length - 1 ? 'success' : 'info');
        }, idx * 800);
    });

    setTimeout(() => {
        const isAdmin = email === 'admin@secure.com';
        const userData = {
            email,
            isAdmin
        };
        localStorage.setItem('mock_user', JSON.stringify(userData));
        window.location.href = "/";
    }, 3500);
  };

  return (
    <div className="container mx-auto flex items-center justify-center min-h-[calc(100vh-140px)] px-4 relative">
      
      {/* Decorative Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
         <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/5 rounded-full blur-3xl animate-pulse"></div>
         <div className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-destructive/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      <Card className="w-full max-w-md border-primary/30 bg-black/80 backdrop-blur-sm rounded-none shadow-[0_0_30px_rgba(0,255,0,0.1)] relative z-10">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent animate-pulse"></div>
        
        <CardHeader className="space-y-1 border-b border-border bg-secondary/20">
          <CardTitle className="text-2xl font-black tracking-tighter text-primary flex items-center gap-2 glitch-text" data-text={mode === 'login' ? "ACCESS_CONTROL" : "NEW_NODE_REGISTRATION"}>
            {mode === 'login' ? <ShieldAlert className="h-6 w-6" /> : <UserPlus className="h-6 w-6" />}
            {mode === 'login' ? "ACCESS_CONTROL" : "REGISTER_NODE"}
          </CardTitle>
          <CardDescription className="font-mono text-xs">
            SECURE_GATEWAY_V4.2 // ENCRYPTED
          </CardDescription>
        </CardHeader>

        <CardContent className="pt-6">
          <AnimatePresence mode="wait">
            {step === 'credentials' && (
                <motion.form 
                    key={mode}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    onSubmit={handleAuth} 
                    className="space-y-4"
                >
                    {error && (
                        <Alert variant="destructive" className="bg-destructive/10 border-destructive text-destructive rounded-none py-2">
                            <AlertDescription className="text-xs font-bold">{error}</AlertDescription>
                        </Alert>
                    )}
                    
                    <div className="space-y-2">
                        <Label htmlFor="email" className="text-xs uppercase text-primary font-bold">Identifier (Email)</Label>
                        <div className="relative group">
                            <User className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                            <Input 
                                id="email" 
                                type="email" 
                                placeholder="user@secure.com" 
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="pl-8 bg-black border-border rounded-none focus-visible:ring-primary font-mono text-sm"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="password" className="text-xs uppercase text-primary font-bold">Passcode</Label>
                        <div className="relative group">
                            <Lock className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                            <Input 
                                id="password" 
                                type="password" 
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="pl-8 bg-black border-border rounded-none focus-visible:ring-primary font-mono text-sm"
                            />
                        </div>
                    </div>

                    {mode === 'register' && (
                        <div className="space-y-2">
                            <Label htmlFor="confirmPassword" className="text-xs uppercase text-primary font-bold">Confirm Passcode</Label>
                            <div className="relative group">
                                <Lock className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                                <Input 
                                    id="confirmPassword" 
                                    type="password" 
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="pl-8 bg-black border-border rounded-none focus-visible:ring-primary font-mono text-sm"
                                />
                            </div>
                        </div>
                    )}

                    <Button type="submit" className="w-full bg-primary text-black hover:bg-primary/90 rounded-none uppercase tracking-widest font-bold h-10 border border-primary hover:shadow-[0_0_15px_rgba(0,255,0,0.4)] transition-all">
                        {mode === 'login' ? 'Authenticate' : 'Initialize Node'}
                    </Button>
                    
                    <div className="pt-4 border-t border-border mt-6 flex justify-center">
                         <button 
                            type="button"
                            onClick={() => {
                                setMode(mode === 'login' ? 'register' : 'login');
                                setError("");
                                setEmail("");
                                setPassword("");
                                setConfirmPassword("");
                            }}
                            className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1 uppercase tracking-wider hover:underline"
                         >
                            {mode === 'login' ? (
                                <>
                                    Need Access? Create Account <ArrowRight className="h-3 w-3" />
                                </>
                            ) : (
                                <>
                                    Already have a Node? Login <ArrowRight className="h-3 w-3" />
                                </>
                            )}
                         </button>
                    </div>
                </motion.form>
            )}

            {step === '2fa' && (
                 <motion.form 
                    key="2fa"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.1 }}
                    onSubmit={handle2FA} 
                    className="space-y-6 text-center py-4"
                >
                    <div className="flex justify-center mb-4">
                        <div className="h-16 w-16 rounded-full bg-primary/10 border-2 border-primary flex items-center justify-center animate-pulse">
                            <Fingerprint className="h-8 w-8 text-primary" />
                        </div>
                    </div>
                    
                    <div className="space-y-2">
                        <h3 className="text-lg font-bold text-primary">TWO_FACTOR_AUTH</h3>
                        <p className="text-xs text-muted-foreground">Enter the generated token from your secure device.</p>
                    </div>

                    <div className="relative group max-w-[200px] mx-auto">
                        <Key className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                        <Input 
                            autoFocus
                            type="text" 
                            placeholder="000-000" 
                            value={twoFaCode}
                            onChange={(e) => setTwoFaCode(e.target.value)}
                            className="pl-8 bg-black border-border rounded-none focus-visible:ring-primary font-mono text-center tracking-[0.5em] text-lg uppercase"
                            maxLength={6}
                        />
                    </div>

                    <div className="flex gap-2">
                         <Button type="button" variant="outline" onClick={() => setStep('credentials')} className="flex-1 rounded-none border-border text-xs">
                            CANCEL
                        </Button>
                        <Button type="submit" className="flex-1 bg-primary text-black hover:bg-primary/90 rounded-none uppercase font-bold text-xs">
                            VERIFY
                        </Button>
                    </div>
                    
                    <div className="text-[10px] text-muted-foreground mt-4">
                        Hint: Type any code to proceed (Mock Mode)
                    </div>
                </motion.form>
            )}

            {step === 'verifying' && (
                <motion.div
                    key="verifying"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="py-12 flex flex-col items-center justify-center space-y-6"
                >
                    <div className="relative w-24 h-24">
                        <div className="absolute inset-0 border-4 border-primary/20 rounded-full"></div>
                        <div className="absolute inset-0 border-t-4 border-primary rounded-full animate-spin"></div>
                        <Lock className="absolute inset-0 m-auto h-8 w-8 text-primary animate-pulse" />
                    </div>
                    <div className="text-center space-y-2">
                        <div className="text-primary font-mono font-bold text-sm animate-pulse">{loadingText}</div>
                        <div className="w-48 h-1 bg-secondary mx-auto rounded-full overflow-hidden">
                            <div className="h-full bg-primary animate-progress-bar"></div>
                        </div>
                    </div>
                </motion.div>
            )}
          </AnimatePresence>

          {/* Footer Info */}
          <div className="mt-8 pt-4 border-t border-border flex justify-between items-center text-[10px] text-muted-foreground font-mono">
            <div className="flex items-center gap-2">
                <Globe className="h-3 w-3" />
                <span>IP: {userIp}</span>
            </div>
            <div className="flex items-center gap-2">
                <EyeOff className="h-3 w-3" />
                <span>NO_LOGS</span>
            </div>
          </div>

        </CardContent>
      </Card>
    </div>
  );
}
