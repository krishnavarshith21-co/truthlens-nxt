import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, CheckCircle2 } from "lucide-react";

export const ApiStatus = () => {
  const supabaseConfigured = !!import.meta.env.VITE_SUPABASE_URL;
  const geminiConfigured = import.meta.env.VITE_GEMINI_API_KEY && 
                           import.meta.env.VITE_GEMINI_API_KEY !== 'YOUR_API_KEY';

  if (supabaseConfigured && geminiConfigured) {
    return null; // All good, hide status
  }

  return (
    <div className="fixed top-4 right-4 z-50 max-w-md space-y-2">
      {supabaseConfigured && geminiConfigured && (
        <Alert className="bg-green-500/10 border-green-500/50">
          <CheckCircle2 className="w-4 h-4 text-green-500" />
          <AlertDescription className="text-sm text-green-200">
            ✅ All systems connected
          </AlertDescription>
        </Alert>
      )}

      {!geminiConfigured && (
        <Alert className="bg-orange-500/10 border-orange-500/50">
          <AlertCircle className="w-4 h-4 text-orange-500" />
          <AlertDescription className="text-sm text-orange-200">
            Gemini AI needs configuration
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};
