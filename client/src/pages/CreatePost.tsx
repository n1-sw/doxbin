import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { store } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, Upload, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function CreatePost() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [user, setUser] = useState<{email: string, isAdmin: boolean} | null>(null);
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  useEffect(() => {
    const stored = localStorage.getItem('mock_user');
    if (stored) {
        const u = JSON.parse(stored);
        setUser(u);
        if (!u.isAdmin) {
            setLocation('/');
        }
    } else {
        setLocation('/login');
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content) {
        toast({
            title: "ERROR: MISSING_FIELDS",
            description: "Title and Content are mandatory for database entry.",
            variant: "destructive"
        });
        return;
    }

    // Add post to store (we need to expose this in store.ts, let's assumes we will update store.ts or use a workaround)
    // Since store.ts is a module with local state, we need to update it. 
    // I'll assume I updated store.ts or I will update it in the next step. 
    // Wait, I didn't add `addPost` to store.ts yet. I'll do that now.
    
    // For now, let's assume the function exists or I'll patch it.
    // Actually, I can just read the store, mutate the array (since it's exported mutable in my previous file implicitly via getPosts returning ref? No, it returned spread copy).
    // I need to update store.ts to allow adding posts.
    
    // Let's use a temporary workaround if store.ts doesn't have it, but I should really update store.ts.
    // I will update store.ts in this batch too.
    
    store.addPost({
        title,
        description,
        content,
        image: imageUrl,
        author: 'Admin'
    });

    toast({
        title: "SUCCESS: ENTRY_ADDED",
        description: "Database updated successfully.",
    });

    setLocation('/');
  };

  if (!user) return null;

  return (
    <div className="container mx-auto py-8 px-4 max-w-3xl">
      <Card className="border-border bg-card rounded-none shadow-xl">
        <CardHeader className="border-b border-border bg-secondary/30">
          <CardTitle className="text-xl font-bold tracking-tighter text-primary flex items-center gap-2 uppercase">
            <AlertTriangle className="h-5 w-5" />
            New Database Entry
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">SUBJECT / TITLE</Label>
              <Input 
                id="title" 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="bg-secondary border-input rounded-none focus-visible:ring-primary font-mono"
                placeholder="e.g. MALWARE_ANALYSIS: TYPE_X"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">BRIEF DESCRIPTION</Label>
              <Input 
                id="description" 
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="bg-secondary border-input rounded-none focus-visible:ring-primary font-mono"
                placeholder="Short summary for index..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="image">EVIDENCE URL (IMAGE)</Label>
              <div className="flex gap-2">
                <Input 
                    id="image" 
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    className="bg-secondary border-input rounded-none focus-visible:ring-primary font-mono"
                    placeholder="https://..."
                />
                <Button type="button" variant="outline" className="rounded-none border-border" onClick={() => window.open(imageUrl, '_blank')}>
                    <Upload className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">DETAILED REPORT</Label>
              <Textarea 
                id="content" 
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="min-h-[300px] bg-secondary border-input rounded-none focus-visible:ring-primary font-mono"
                placeholder="Full technical breakdown..."
              />
            </div>

            <Button type="submit" className="w-full bg-primary text-primary-foreground hover:bg-primary/90 rounded-none uppercase tracking-widest font-bold h-12">
              <Save className="mr-2 h-4 w-4" />
              COMMIT TO DATABASE
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
