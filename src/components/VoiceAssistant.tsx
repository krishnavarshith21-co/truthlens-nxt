import { useState, useEffect } from 'react';
import { Mic, MicOff } from 'lucide-react';
import { Button } from './ui/button';
import { useToast } from '@/hooks/use-toast';

export const VoiceAssistant = () => {
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState<any>(null);
  const [isSupported, setIsSupported] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      setIsSupported(true);
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognitionInstance = new SpeechRecognition();
      recognitionInstance.continuous = false;
      recognitionInstance.interimResults = false;
      recognitionInstance.lang = 'en-US';

      recognitionInstance.onstart = () => {
        console.log('Voice recognition started');
        speak("Hi! Let's verify your news together. What would you like to check?");
      };

      recognitionInstance.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0].transcript)
          .join('');
        
        console.log('Voice input:', transcript);
        
        if (transcript.toLowerCase().includes('verify')) {
          speak("Sure! Please upload or paste the content you want me to verify.");
        } else if (transcript.toLowerCase().includes('help')) {
          speak("You can ask me to verify text, images, videos, or audio files. Just say verify and upload your content.");
        }
      };

      recognitionInstance.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        if (event.error === 'not-allowed') {
          toast({
            title: "Microphone Access Denied",
            description: "Please allow microphone access to use voice assistant",
            variant: "destructive"
          });
        }
      };

      recognitionInstance.onend = () => {
        setIsListening(false);
      };

      setRecognition(recognitionInstance);
    } else {
      setIsSupported(false);
    }
  }, [toast]);

  const speak = (text: string) => {
    if ('speechSynthesis' in window) {
      // Cancel any ongoing speech
      window.speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1;
      utterance.volume = 1;
      
      utterance.onend = () => {
        console.log('Speech ended');
      };
      
      utterance.onerror = (event) => {
        console.error('Speech error:', event);
      };
      
      window.speechSynthesis.speak(utterance);
    }
  };

  const toggleListening = () => {
    if (!isSupported || !recognition) {
      toast({
        title: "Not Supported",
        description: "Voice recognition is not supported in your browser. Try Chrome or Edge.",
        variant: "destructive"
      });
      return;
    }

    if (isListening) {
      recognition.stop();
      window.speechSynthesis.cancel();
      setIsListening(false);
    } else {
      try {
        recognition.start();
        setIsListening(true);
      } catch (error) {
        console.error('Failed to start recognition:', error);
        toast({
          title: "Error",
          description: "Failed to start voice recognition. Please try again.",
          variant: "destructive"
        });
      }
    }
  };

  if (!isSupported) {
    return null; // Hide voice assistant if not supported
  }

  return (
    <div className="fixed bottom-8 right-8 z-50">
      <div className="relative">
        <Button
          onClick={toggleListening}
          size="lg"
          className={`rounded-full w-16 h-16 shadow-lg transition-all duration-300 ${
            isListening 
              ? 'bg-gradient-to-r from-primary to-purple-600 animate-pulse scale-110' 
              : 'bg-primary hover:scale-105'
          }`}
          title={isListening ? "Stop voice assistant" : "Start voice assistant"}
        >
          {isListening ? <Mic className="h-6 w-6" /> : <MicOff className="h-6 w-6" />}
        </Button>
        {isListening && (
          <>
            <div className="absolute -top-2 -right-2 w-20 h-20 bg-primary/20 rounded-full animate-ping" />
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-purple-500/10 rounded-full animate-ping" style={{ animationDelay: '0.5s' }} />
          </>
        )}
      </div>
    </div>
  );
};
