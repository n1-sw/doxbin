import { useState, useEffect } from "react";
import { Link } from "wouter";
import {
    Eye,
    MessageSquare,
    FileText,
    Lock,
    Plus,
    AlertTriangle,
    ShieldCheck,
    Globe,
    Terminal,
    Flame,
    User,
} from "lucide-react";
import { store, Post } from "@/lib/store";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function Home() {
    const [posts, setPosts] = useState<Post[]>([]);
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        setPosts(store.getPosts());

        const checkAdmin = () => {
            const stored = localStorage.getItem("mock_user");
            if (stored) {
                const u = JSON.parse(stored);
                if (u.isAdmin) setIsAdmin(true);
            }
        };
        checkAdmin();

        const unsubscribe = store.subscribe(() => {
            setPosts(store.getPosts());
        });
        return unsubscribe;
    }, []);

    // Risk level calculator (mock)
    const getRiskLevel = (views: number) => {
        if (views > 40000)
            return {
                label: "CRITICAL",
                color: "text-red-500 border-red-500 bg-red-500/10",
            };
        if (views > 10000)
            return {
                label: "HIGH",
                color: "text-orange-500 border-orange-500 bg-orange-500/10",
            };
        return {
            label: "MODERATE",
            color: "text-yellow-500 border-yellow-500 bg-yellow-500/10",
        };
    };

    return (
        <div className="w-full max-w-7xl mx-auto space-y-8">
            {/* Top Stats Bar */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-card border border-border p-4 flex flex-col items-center justify-center text-center group hover:border-primary transition-colors">
                    <span className="text-[10px] uppercase text-muted-foreground mb-1">
                        Total Entries
                    </span>
                    <span
                        className="text-2xl font-black text-primary glitch-text group-hover:scale-110 transition-transform"
                        data-text={posts.length}
                    >
                        {posts.length}
                    </span>
                </div>
                <div className="bg-card border border-border p-4 flex flex-col items-center justify-center text-center group hover:border-primary transition-colors">
                    <span className="text-[10px] uppercase text-muted-foreground mb-1">
                        Active Users
                    </span>
                    <span className="text-2xl font-black text-white group-hover:text-primary transition-colors">
                        8,492
                    </span>
                </div>
                <div className="bg-card border border-border p-4 flex flex-col items-center justify-center text-center group hover:border-primary transition-colors">
                    <span className="text-[10px] uppercase text-muted-foreground mb-1">
                        Total Views
                    </span>
                    <span className="text-2xl font-black text-white group-hover:text-primary transition-colors">
                        {posts
                            .reduce((acc, curr) => acc + curr.views, 0)
                            .toLocaleString()}
                    </span>
                </div>
                <div className="bg-card border border-border p-4 flex flex-col items-center justify-center text-center group hover:border-destructive transition-colors">
                    <span className="text-[10px] uppercase text-muted-foreground mb-1">
                        System Status
                    </span>
                    <span className="text-xl font-black text-green-500 flex items-center gap-2">
                        <span className="relative flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                        </span>
                        ONLINE
                    </span>
                </div>
            </div>

            {/* Admin Actions */}
            <div className="flex justify-between items-end border-b-2 border-primary/50 pb-2">
                <div>
                    <h1 className="text-2xl font-black text-white tracking-tighter flex items-center gap-2">
                        <Terminal className="h-6 w-6 text-primary" />
                        LATEST_LEAKS_DATABASE
                    </h1>
                    <p className="text-xs text-muted-foreground font-mono mt-1">
                        Sorted by:{" "}
                        <span className="text-primary">DATE_ADDED (DESC)</span>{" "}
                        // Displaying 1-{posts.length} of {posts.length}
                    </p>
                </div>
                {isAdmin && (
                    <Link href="/create">
                        <Button className="rounded-none bg-destructive text-white hover:bg-destructive/80 uppercase tracking-widest text-xs font-bold shadow-[0_0_10px_rgba(255,0,0,0.4)] hover:shadow-[0_0_20px_rgba(255,0,0,0.6)] transition-all">
                            <Plus className="h-4 w-4 mr-2" />[ UPLOAD LEAK ]
                        </Button>
                    </Link>
                )}
            </div>

            {/* Main Database Table */}
            <div className="border border-border bg-black shadow-2xl relative">
                {/* Decorative corner markers */}
                <div className="absolute -top-1 -left-1 w-4 h-4 border-t-2 border-l-2 border-primary"></div>
                <div className="absolute -top-1 -right-1 w-4 h-4 border-t-2 border-r-2 border-primary"></div>
                <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-2 border-l-2 border-primary"></div>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-2 border-r-2 border-primary"></div>

                {/* Table Header */}
                <div className="grid grid-cols-12 gap-2 p-3 border-b border-primary/30 bg-secondary/20 text-[10px] font-bold uppercase tracking-widest text-primary select-none">
                    <div className="col-span-6 md:col-span-4 flex items-center gap-2 cursor-pointer hover:text-white">
                        <FileText className="h-3 w-3" /> Subject / Filename
                    </div>
                    <div className="col-span-2 hidden md:flex items-center gap-2 cursor-pointer hover:text-white">
                        <AlertTriangle className="h-3 w-3" /> Risk Level
                    </div>
                    <div className="col-span-2 hidden md:flex items-center gap-2 cursor-pointer hover:text-white">
                        <User className="h-3 w-3" /> Uploader
                    </div>
                    <div className="col-span-3 md:col-span-2 text-right md:text-left cursor-pointer hover:text-white">
                        Date
                    </div>
                    <div className="col-span-3 md:col-span-2 text-right cursor-pointer hover:text-white">
                        Activity
                    </div>
                </div>

                <div className="divide-y divide-border/50">
                    {posts.map((post, index) => {
                        const risk = getRiskLevel(post.views);
                        return (
                            <motion.div
                                key={post.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.05 }}
                            >
                                <Link
                                    href={`/post/${post.id}`}
                                    className="grid grid-cols-12 gap-2 p-3 hover:bg-primary/10 transition-all group cursor-pointer items-center border-l-2 border-transparent hover:border-primary"
                                >
                                    <div className="col-span-6 md:col-span-4 font-bold text-xs md:text-sm text-gray-300 group-hover:text-primary transition-colors flex flex-col md:flex-row md:items-center gap-1 md:gap-3">
                                        <span className="truncate">
                                            {post.title}
                                        </span>
                                        {index === 0 && (
                                            <Badge
                                                variant="outline"
                                                className="w-fit border-red-500 text-red-500 text-[8px] rounded-none h-4 px-1 animate-pulse"
                                            >
                                                NEW
                                            </Badge>
                                        )}
                                    </div>

                                    <div className="col-span-2 hidden md:block">
                                        <span
                                            className={`text-[10px] border px-2 py-0.5 font-bold ${risk.color}`}
                                        >
                                            {risk.label}
                                        </span>
                                    </div>

                                    <div className="col-span-2 hidden md:block text-xs text-muted-foreground">
                                        <span
                                            className={`flex items-center gap-1 ${post.author === "Admin" ? "text-red-500 font-bold" : "text-gray-400"}`}
                                        >
                                            {post.author === "Admin" && (
                                                <ShieldCheck className="h-3 w-3" />
                                            )}
                                            {post.author}
                                        </span>
                                    </div>

                                    <div className="col-span-3 md:col-span-2 text-[10px] md:text-xs text-muted-foreground text-right md:text-left font-mono">
                                        {post.date}
                                    </div>

                                    <div className="col-span-3 md:col-span-2 flex items-center justify-end gap-3 text-xs text-muted-foreground font-mono">
                                        <div
                                            className="flex items-center gap-1"
                                            title="Views"
                                        >
                                            <Eye className="h-3 w-3 group-hover:text-primary" />
                                            <span>
                                                {(post.views / 1000).toFixed(1)}
                                                k
                                            </span>
                                        </div>
                                        <div
                                            className="flex items-center gap-1"
                                            title="Comments"
                                        >
                                            <MessageSquare className="h-3 w-3 group-hover:text-primary" />
                                            <span>{post.comments.length}</span>
                                        </div>
                                    </div>
                                </Link>
                            </motion.div>
                        );
                    })}
                </div>
            </div>

            {/* Bottom Info Grid */}
            <div className="grid md:grid-cols-3 gap-4 text-[10px] text-muted-foreground font-mono border-t border-border pt-4">
                <div className="border border-border p-2">
                    <h4 className="text-primary font-bold mb-1">
                        LATEST ACTIVITY LOG
                    </h4>
                    <ul className="space-y-1 opacity-70">
                        <li>&gt; User_992 accessed /database/leak_01</li>
                        <li>&gt; Admin uploaded new_entry_x2.zip</li>
                        <li>&gt; Bot_Net_Crawler blocked from IP 88.21.x.x</li>
                    </ul>
                </div>
                <div className="border border-border p-2">
                    <h4 className="text-primary font-bold mb-1">
                        ENCRYPTION STANDARDS
                    </h4>
                    <p className="opacity-70">
                        AES-256-GCM encryption enabled for all stored assets.
                        Zero-knowledge architecture implemented for user logs.
                    </p>
                </div>
                <div className="border border-border p-2">
                    <h4 className="text-primary font-bold mb-1">
                        MIRROR LINKS
                    </h4>
                    <div className="flex gap-2 opacity-70">
                        <a href="#" className="hover:text-white underline">
                            Mirror #1 (EU)
                        </a>
                        <a href="#" className="hover:text-white underline">
                            Mirror #2 (ASIA)
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}
