import { useState, useEffect, useRef } from 'react';
import { Terminal as TerminalIcon, X, Minus, Maximize2, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Log {
  id: string;
  timestamp: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
}

export const terminalEvents = {
  emit: (message: string, type: 'info' | 'warning' | 'error' | 'success' = 'info') => {
    const event = new CustomEvent('terminal-log', { detail: { message, type } });
    window.dispatchEvent(event);
  }
};

export function Terminal() {
  const [logs, setLogs] = useState<Log[]>([]);
  const [isOpen, setIsOpen] = useState(true);
  const [isMinimized, setIsMinimized] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initial boot sequence
    const bootLogs = [
      { msg: "INITIALIZING_SECURE_PROTOCOL_V2...", type: 'info' },
      { msg: "CONNECTING_TO_ENCRYPTED_NODE_MESH...", type: 'warning' },
      { msg: "CONNECTION_ESTABLISHED: 192.168.X.X", type: 'success' },
      { msg: "LISTENING_FOR_PACKETS...", type: 'info' }
    ];

    bootLogs.forEach((log, index) => {
      setTimeout(() => {
        addLog(log.msg, log.type as any);
      }, index * 800);
    });

    const handleLog = (e: any) => {
      addLog(e.detail.message, e.detail.type);
    };

    window.addEventListener('terminal-log', handleLog);
    return () => window.removeEventListener('terminal-log', handleLog);
  }, []);

  const addLog = (message: string, type: 'info' | 'warning' | 'error' | 'success') => {
    const newLog = {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toLocaleTimeString('en-US', { hour12: false }),
      message,
      type
    };
    setLogs(prev => [...prev.slice(-50), newLog]); // Keep last 50 logs
  };

  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, isOpen]);

  if (!isOpen) return (
    <button 
      onClick={() => setIsOpen(true)}
      className="fixed bottom-4 right-4 bg-card border border-primary text-primary p-2 z-50 hover:bg-primary/10"
    >
      <TerminalIcon className="h-5 w-5" />
    </button>
  );

  return (
    <motion.div 
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className={`fixed bottom-4 right-4 z-50 flex flex-col border border-primary bg-black/90 backdrop-blur shadow-[0_0_20px_rgba(0,255,255,0.2)] w-[350px] md:w-[450px] transition-all duration-300 ${isMinimized ? 'h-[40px]' : 'h-[300px]'}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-primary/30 bg-primary/5 cursor-pointer" onClick={() => setIsMinimized(!isMinimized)}>
        <div className="flex items-center gap-2 text-xs font-bold text-primary uppercase tracking-wider">
          <TerminalIcon className="h-3 w-3" />
          <span>SYSTEM_CONSOLE</span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={(e) => { e.stopPropagation(); setIsMinimized(!isMinimized); }} className="hover:text-white text-primary/70">
            <Minus className="h-3 w-3" />
          </button>
          <button onClick={(e) => { e.stopPropagation(); setIsOpen(false); }} className="hover:text-white text-primary/70">
            <X className="h-3 w-3" />
          </button>
        </div>
      </div>

      {/* Content */}
      {!isMinimized && (
        <div className="flex-1 overflow-y-auto p-3 font-mono text-[10px] md:text-xs space-y-1 custom-scrollbar">
          {logs.map(log => (
            <div key={log.id} className="flex gap-2">
              <span className="text-muted-foreground">[{log.timestamp}]</span>
              <span className={`
                ${log.type === 'error' ? 'text-red-500' : ''}
                ${log.type === 'warning' ? 'text-yellow-500' : ''}
                ${log.type === 'success' ? 'text-green-500' : ''}
                ${log.type === 'info' ? 'text-blue-400' : ''}
              `}>
                <ChevronRight className="h-2 w-2 inline mr-1" />
                {log.message}
              </span>
            </div>
          ))}
          <div ref={bottomRef} />
          <div className="animate-pulse text-primary">_</div>
        </div>
      )}
    </motion.div>
  );
}
