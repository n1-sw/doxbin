import { useState, useEffect } from "react";
import { useRoute, useLocation } from "wouter";
import { store, Post } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Clock, Eye, Share2, AlertTriangle } from "lucide-react";

export default function PostDetail() {
  const [, params] = useRoute("/post/:id");
  const [post, setPost] = useState<Post | undefined>();
  const [commentText, setCommentText] = useState("");
  const [user, setUser] = useState<{email: string} | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem('mock_user');
    if (stored) setUser(JSON.parse(stored));
  }, []);

  useEffect(() => {
    if (params?.id) {
      const p = store.getPost(params.id);
      setPost(p);
      
      // Increment view count
      store.incrementView(params.id);
      
      const unsubscribe = store.subscribe(() => {
        setPost(store.getPost(params.id));
      });
      return unsubscribe;
    }
  }, [params?.id]);

  const handleCommentSubmit = () => {
    if (post && commentText.trim() && user) {
        store.addComment(post.id, commentText, user.email.split('@')[0]);
        setCommentText("");
    }
  };

  if (!post) {
    return <div className="container mx-auto py-20 text-center text-muted-foreground">LOADING_DATA...</div>;
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-5xl">
      {/* Breadcrumb / Back */}
      <div className="mb-6">
        <a href="/" className="text-sm text-muted-foreground hover:text-primary transition-colors">&lt; RETURN_TO_INDEX</a>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
            {/* Header */}
            <div className="border border-border bg-card p-6 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-primary"></div>
                <div className="flex items-center gap-2 mb-2 text-xs text-primary font-bold uppercase tracking-widest">
                    <AlertTriangle className="h-4 w-4" />
                    <span>Database Entry #{post.id.padStart(4, '0')}</span>
                </div>
                <h1 className="text-2xl md:text-3xl font-bold mb-4 text-white font-mono">{post.title}</h1>
                
                <div className="flex flex-wrap gap-4 text-xs text-muted-foreground font-mono">
                    <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>POSTED: {post.date}</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        <span>VIEWS: {post.views.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-1 text-red-500">
                        <span>AUTHOR: {post.author}</span>
                    </div>
                </div>
            </div>

            {/* Description Box */}
            <div className="bg-secondary/30 border border-border p-4 text-sm text-muted-foreground italic">
                {post.description}
            </div>

            {/* Content Body */}
            <div className="border border-border bg-card p-6 space-y-6">
                {post.image && (
                    <div className="relative aspect-video w-full overflow-hidden border border-border bg-black">
                        <img src={post.image} alt="Evidence" className="object-cover w-full h-full opacity-80 hover:opacity-100 transition-opacity" />
                        <div className="absolute bottom-0 left-0 bg-black/80 px-2 py-1 text-[10px] text-primary border-t border-r border-primary">
                            FIG_1.0: ATTACHED_EVIDENCE
                        </div>
                    </div>
                )}
                
                <div className="font-mono text-sm leading-relaxed whitespace-pre-wrap text-gray-300">
                    {post.content}
                </div>
            </div>
        </div>

        {/* Sidebar / Comments */}
        <div className="space-y-6">
            {/* Actions */}
            <div className="border border-border bg-card p-4">
                <Button className="w-full mb-2 bg-primary text-primary-foreground hover:bg-primary/90 rounded-none font-bold uppercase text-xs">
                    <Share2 className="mr-2 h-4 w-4" /> Share Entry
                </Button>
                <Button variant="outline" className="w-full border-destructive text-destructive hover:bg-destructive hover:text-white rounded-none uppercase text-xs">
                    Report Error
                </Button>
            </div>

            {/* Comments Section */}
            <div className="border border-border bg-card flex flex-col h-[600px]">
                <div className="p-3 border-b border-border bg-secondary/50 font-bold text-sm flex justify-between items-center">
                    <span>COMMENTS_LOG</span>
                    <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full">{post.comments.length}</span>
                </div>
                
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {post.comments.length === 0 ? (
                        <div className="text-center text-xs text-muted-foreground py-10">NO_COMMENTS_FOUND</div>
                    ) : (
                        post.comments.map((comment) => (
                            <div key={comment.id} className="text-sm border-l-2 border-border pl-3 py-1">
                                <div className="flex justify-between items-center mb-1">
                                    <span className="font-bold text-primary text-xs">{comment.author}</span>
                                    <span className="text-[10px] text-muted-foreground">{comment.date}</span>
                                </div>
                                <p className="text-gray-400 text-xs">{comment.text}</p>
                            </div>
                        ))
                    )}
                </div>

                <div className="p-4 border-t border-border bg-secondary/30">
                    {user ? (
                        <div className="space-y-2">
                            <Textarea 
                                placeholder="Add observation..." 
                                className="min-h-[80px] bg-background border-border resize-none text-xs rounded-none focus-visible:ring-1 focus-visible:ring-primary"
                                value={commentText}
                                onChange={(e) => setCommentText(e.target.value)}
                            />
                            <Button size="sm" onClick={handleCommentSubmit} className="w-full rounded-none text-xs bg-secondary hover:bg-primary hover:text-primary-foreground border border-border">
                                SUBMIT_LOG
                            </Button>
                        </div>
                    ) : (
                        <div className="text-center">
                            <a href="/login" className="text-xs text-primary hover:underline">LOGIN_REQUIRED_TO_COMMENT</a>
                        </div>
                    )}
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}
