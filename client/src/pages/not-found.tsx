import { Link } from "wouter";
import { AlertTriangle } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] text-center px-4">
      <AlertTriangle className="h-24 w-24 text-destructive mb-6 animate-pulse" />
      <h1 className="text-6xl font-bold text-destructive mb-2 tracking-tighter">404</h1>
      <p className="text-xl text-muted-foreground mb-8 font-mono">
        DATA_SEGMENT_NOT_FOUND
      </p>
      <p className="max-w-md text-sm text-muted-foreground mb-8 border-l-2 border-destructive pl-4 text-left">
        The requested resource could not be located in the database. It may have been expunged or never existed.
      </p>
      <Link href="/">
        <span className="px-6 py-3 bg-secondary border border-border hover:border-primary hover:text-primary transition-colors cursor-pointer uppercase tracking-widest text-sm font-bold">
          Return to Index
        </span>
      </Link>
    </div>
  );
}
