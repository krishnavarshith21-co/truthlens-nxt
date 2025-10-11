import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, CheckCircle2, XCircle } from "lucide-react";
import { isDemoMode } from "@/lib/firebase";

export const ApiStatus = () => {
  const geminiConfigured = import.meta.env.VITE_GEMINI_API_KEY && 
                           import.meta.env.VITE_GEMINI_API_KEY !== 'YOUR_API_KEY';
  const newsApiConfigured = import.meta.env.VITE_NEWS_API_KEY && 
                            import.meta.env.VITE_NEWS_API_KEY !== 'YOUR_API_KEY';
  const factCheckConfigured = import.meta.env.VITE_GOOGLE_FACT_CHECK_API_KEY;

  if (!isDemoMode && geminiConfigured && newsApiConfigured && factCheckConfigured) {
    return null; // All good, hide status
  }

  return (
    <div className="fixed top-4 right-4 z-50 max-w-md space-y-2">
      {isDemoMode && (
        <Alert className="bg-yellow-500/10 border-yellow-500/50">
          <AlertCircle className="h-4 w-4 text-yellow-500" />
          <AlertDescription className="text-sm text-yellow-200">
            🎮 <strong>Demo Mode:</strong> Firebase not configured. Using mock data.
          </AlertDescription>
        </Alert>
      )}

      {!geminiConfigured && (
        <Alert className="bg-orange-500/10 border-orange-500/50">
          <XCircle className="h-4 w-4 text-orange-500" />
          <AlertDescription className="text-sm text-orange-200">
            Gemini AI not configured. Using mock analysis.
          </AlertDescription>
        </Alert>
      )}

      {geminiConfigured && (
        <Alert className="bg-green-500/10 border-green-500/50">
          <CheckCircle2 className="h-4 w-4 text-green-500" />
          <AlertDescription className="text-sm text-green-200">
            ✅ Gemini AI connected
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};