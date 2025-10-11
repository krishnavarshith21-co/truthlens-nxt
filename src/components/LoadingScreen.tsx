import { Loader2 } from "lucide-react";

export const LoadingScreen = ({ message = "Loading..." }: { message?: string }) => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4">
      <div className="relative">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <div className="absolute inset-0 animate-ping">
          <Loader2 className="h-12 w-12 text-primary/20" />
        </div>
      </div>
      <p className="text-lg text-muted-foreground animate-pulse">{message}</p>
    </div>
  );
};