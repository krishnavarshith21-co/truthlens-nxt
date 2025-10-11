import { useState, useEffect } from 'react';
import { Mic, MicOff } from 'lucide-react';
import { Button } from './ui/button';
import { useToast } from '@/hooks/use-toast';

export const VoiceAssistant = () => {
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognitionInstance = new SpeechRecognition();
      recognitionInstance.continuous = true;
      recognitionInstance.interimResults = true;

      recognitionInstance.onstart = () => {
        speak("Hi! Let's verify your news together. What would you like to check?");
      };

      recognitionInstance.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0].transcript)
          .join('');
        
        console.log('Voice input:', transcript);
        
        if (transcript.toLowerCase().includes('verify')) {
          speak("Sure! Please upload or paste the content you want me to verify.");
        }
      };

      recognitionInstance.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };

      setRecognition(recognitionInstance);
    }
  }, []);

  const speak = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1;
      window.speechSynthesis.speak(utterance);
    }
  };

  const toggleListening = () => {
    if (!recognition) {
      toast({
        title: "Not Supported",
        description: "Voice recognition is not supported in your browser",
        variant: "destructive"
      });
      return;
    }

    if (isListening) {
      recognition.stop();
      setIsListening(false);
    } else {
      recognition.start();
      setIsListening(true);
    }
  };

  return (
    <div className="fixed bottom-8 right-8 z-50">
      <Button
        onClick={toggleListening}
        size="lg"
        className={`rounded-full w-16 h-16 ${
          isListening 
            ? 'bg-gradient-to-r from-primary to-purple-600 animate-pulse' 
            : 'bg-primary'
        }`}
      >
        {isListening ? <Mic className="h-6 w-6" /> : <MicOff className="h-6 w-6" />}
      </Button>
      {isListening && (
        <div className="absolute -top-2 -right-2 w-20 h-20 bg-primary/20 rounded-full animate-ping" />
      )}
    </div>
  );
};
