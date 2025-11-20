import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Lock, Unlock, ArrowRightLeft, Hash, Binary } from "lucide-react";
import { terminalEvents } from "@/components/Terminal";
import { useToast } from "@/hooks/use-toast";

export default function Tools() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const { toast } = useToast();

  const process = (mode: 'encrypt' | 'decrypt' | 'hash' | 'binary') => {
    if (!input) return;
    
    let result = "";
    try {
        switch(mode) {
            case 'encrypt': // Simple Base64 for demo
                result = btoa(input);
                terminalEvents.emit(`ENCODING_DATA_PACKET: ${input.length} BYTES`, 'info');
                break;
            case 'decrypt':
                result = atob(input);
                terminalEvents.emit(`DECODING_DATA_STREAM...`, 'success');
                break;
            case 'hash': // Simple faux-hash
                result = Array.from(input).reduce((hash, char) => 0 | (31 * hash + char.charCodeAt(0)), 0).toString(16).toUpperCase().padStart(32, '0');
                terminalEvents.emit(`GENERATING_HASH_SIGNATURE...`, 'warning');
                break;
            case 'binary':
                result = input.split('').map(char => char.charCodeAt(0).toString(2).padStart(8, '0')).join(' ');
                terminalEvents.emit(`CONVERTING_TO_BINARY_STREAM...`, 'info');
                break;
        }
        setOutput(result);
        toast({ title: "OPERATION_COMPLETE", description: "Data processed successfully." });
    } catch (e) {
        terminalEvents.emit(`OPERATION_FAILED: INVALID_INPUT`, 'error');
        toast({ title: "ERROR", description: "Invalid input for this operation.", variant: "destructive" });
    }
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
       <div className="mb-8 border-b border-primary/30 pb-4">
            <h1 className="text-3xl font-bold text-primary tracking-tighter mb-2 flex items-center gap-2">
                <Binary className="h-8 w-8" />
                CRYPTO_TOOLS_V1.0
            </h1>
            <p className="text-muted-foreground font-mono text-sm">
                Educational suite for data obfuscation and analysis.
            </p>
       </div>

       <div className="grid gap-6">
        <Tabs defaultValue="base64" className="w-full">
            <TabsList className="w-full justify-start bg-secondary border border-border rounded-none p-0 h-auto">
                <TabsTrigger value="base64" className="rounded-none data-[state=active]:bg-primary data-[state=active]:text-primary-foreground py-3 px-6 font-mono">BASE64</TabsTrigger>
                <TabsTrigger value="hashing" className="rounded-none data-[state=active]:bg-primary data-[state=active]:text-primary-foreground py-3 px-6 font-mono">HASHING</TabsTrigger>
                <TabsTrigger value="binary" className="rounded-none data-[state=active]:bg-primary data-[state=active]:text-primary-foreground py-3 px-6 font-mono">BINARY</TabsTrigger>
            </TabsList>
            
            <Card className="border-t-0 border-border rounded-none bg-card shadow-xl mt-0">
                <CardContent className="p-6 space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-primary uppercase">Input Stream</label>
                            <Textarea 
                                placeholder="Enter data here..." 
                                className="min-h-[200px] font-mono text-xs bg-secondary/50 border-border focus-visible:ring-primary resize-none rounded-none"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-primary uppercase">Output Stream</label>
                            <Textarea 
                                readOnly 
                                placeholder="Results will appear here..." 
                                className="min-h-[200px] font-mono text-xs bg-black/50 border-border text-green-500 resize-none rounded-none"
                                value={output}
                            />
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-4 justify-center pt-4 border-t border-border">
                        <TabsContent value="base64" className="mt-0 flex gap-4 w-full justify-center">
                            <Button onClick={() => process('encrypt')} className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-none w-32">
                                <Lock className="mr-2 h-4 w-4" /> ENCRYPT
                            </Button>
                            <Button onClick={() => process('decrypt')} variant="outline" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground rounded-none w-32">
                                <Unlock className="mr-2 h-4 w-4" /> DECRYPT
                            </Button>
                        </TabsContent>
                        
                        <TabsContent value="hashing" className="mt-0 w-full flex justify-center">
                             <Button onClick={() => process('hash')} className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-none w-40">
                                <Hash className="mr-2 h-4 w-4" /> GENERATE HASH
                            </Button>
                        </TabsContent>

                        <TabsContent value="binary" className="mt-0 w-full flex justify-center">
                             <Button onClick={() => process('binary')} className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-none w-40">
                                <Binary className="mr-2 h-4 w-4" /> TO BINARY
                            </Button>
                        </TabsContent>
                    </div>
                </CardContent>
            </Card>
        </Tabs>
       </div>
    </div>
  );
}
