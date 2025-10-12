import { useState, useEffect } from 'react';
import { Mic, MicOff } from 'lucide-react';
import { Button } from './ui/button';
import { useToast } from '@/hooks/use-toast';
import { useNavigate, useLocation } from 'react-router-dom';

export const VoiceAssistant = () => {
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState<any>(null);
  const [isSupported, setIsSupported] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [micPermission, setMicPermission] = useState<'granted' | 'prompt' | 'denied' | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const speak = (text: string) => {
    if ('speechSynthesis' in window) {
      // Cancel any ongoing speech
      window.speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1;
      utterance.volume = 1;
      
      utterance.onstart = () => {
        setIsSpeaking(true);
      };
      
      utterance.onend = () => {
        console.log('Speech ended');
        setIsSpeaking(false);
      };
      
      utterance.onerror = (event) => {
        console.error('Speech error:', event);
        setIsSpeaking(false);
      };
      
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleVoiceCommand = (command: string) => {
    const lowerCommand = command.toLowerCase();
    
    // Navigation commands
    if (lowerCommand.includes('go home') || lowerCommand.includes('home page')) {
      speak("Taking you to the home page.");
      navigate('/');
    } else if (lowerCommand.includes('dashboard') || lowerCommand.includes('my dashboard')) {
      speak("Opening your dashboard.");
      navigate('/dashboard');
    } else if (lowerCommand.includes('leaderboard') || lowerCommand.includes('rankings')) {
      speak("Opening the leaderboard.");
      navigate('/leaderboard');
    } else if (lowerCommand.includes('about') || lowerCommand.includes('learn more')) {
      speak("Opening the about page.");
      navigate('/about');
    } else if (lowerCommand.includes('contact') || lowerCommand.includes('get in touch')) {
      speak("Opening the contact page.");
      navigate('/contact');
    }
    
    // Verification commands
    else if (lowerCommand.includes('verify') || lowerCommand.includes('check') || lowerCommand.includes('analyze')) {
      if (location.pathname !== '/') {
        speak("Navigating to verification page. Please upload or paste the content you want to verify.");
        navigate('/?scrollTo=verify');
      } else {
        speak("Please upload a file or paste text in the verification section below.");
        // Scroll to verification section
        const verifySection = document.getElementById('verify');
        if (verifySection) {
          verifySection.scrollIntoView({ behavior: 'smooth' });
        }
      }
    }
    
    // Help commands
    else if (lowerCommand.includes('help') || lowerCommand.includes('what can you do')) {
      speak("I can help you verify content, navigate to different pages, or answer questions about VeriFy AI. Try saying things like: verify this content, go to dashboard, or how does it work.");
    } else if (lowerCommand.includes('how does') || lowerCommand.includes('how it works')) {
      speak("VeriFy AI uses advanced artificial intelligence to analyze text, images, videos, and audio. We check authenticity, detect AI-generated content, and verify information against trusted sources. You can upload any content, and we'll give you a trust score with detailed analysis.");
    }
    
    // Default response
    else {
      speak("I'm not sure I understood that. You can ask me to verify content, navigate to different pages, or say help for more options.");
    }
  };

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
        if (location.pathname === '/') {
          speak("Hi! I'm your VeriFy AI assistant. You can ask me to verify content, check the dashboard, or learn about VeriFy. What would you like to do?");
        } else {
          speak("I'm listening. How can I help you?");
        }
      };

      recognitionInstance.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0].transcript)
          .join('');
        
        console.log('Voice input:', transcript);
        handleVoiceCommand(transcript);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [toast, location.pathname]);

  // Track browser microphone permission state
  useEffect(() => {
    const nav: any = navigator as any;
    if (nav?.permissions?.query) {
      try {
        nav.permissions.query({ name: 'microphone' as any }).then((status: any) => {
          setMicPermission(status.state);
          status.onchange = () => setMicPermission(status.state);
        }).catch(() => {/* ignore */});
      } catch { /* ignore */ }
    }
  }, []);


  const requestMicrophonePermission = async () => {
    try {
      // Request microphone access first
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      // Stop the stream immediately - we just needed permission
      stream.getTracks().forEach(track => track.stop());
      setMicPermission('granted');
      return true;
    } catch (error: any) {
      console.error('Microphone permission error:', error);
      const name = error?.name || '';
      if (name === 'NotAllowedError' || name === 'PermissionDeniedError') {
        setMicPermission('denied');
        toast({
          title: "Microphone Permission Required",
          description: "Please allow microphone access in your browser settings to use voice assistant.",
          variant: "destructive"
        });
      } else if (name === 'NotFoundError') {
        toast({
          title: "No Microphone Found",
          description: "Please connect a microphone to use voice assistant.",
          variant: "destructive"
        });
      } else if (name === 'NotReadableError') {
        toast({
          title: "Microphone In Use",
          description: "Your microphone is being used by another application. Please close it and try again.",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Microphone Error",
          description: "Could not access microphone. Please check your device settings.",
          variant: "destructive"
        });
      }
      return false;
    }
  };

  const toggleListening = async () => {
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
      // Request microphone permission first
      const hasPermission = await requestMicrophonePermission();
      if (!hasPermission) {
        return;
      }

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
        {/* Voice Assistant Button */}
        <Button
          onClick={toggleListening}
          size="lg"
          className={`rounded-full w-16 h-16 shadow-2xl transition-all duration-300 ${
            isListening || isSpeaking
              ? 'bg-gradient-to-r from-primary to-purple-600 animate-pulse scale-110' 
              : 'bg-primary hover:scale-105'
          }`}
          title={isListening ? "Listening..." : isSpeaking ? "Speaking..." : "Start voice assistant"}
        >
          {isListening ? (
            <Mic className="h-6 w-6 animate-pulse" />
          ) : (
            <MicOff className="h-6 w-6" />
          )}
        </Button>

        {/* Animated Rings */}
        {(isListening || isSpeaking) && (
          <>
            <div className="absolute -top-2 -right-2 w-20 h-20 bg-primary/20 rounded-full animate-ping" />
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-purple-500/10 rounded-full animate-ping" style={{ animationDelay: '0.5s' }} />
            <div className="absolute -top-6 -right-6 w-28 h-28 bg-primary/5 rounded-full animate-ping" style={{ animationDelay: '1s' }} />
          </>
        )}

        {/* Status Tooltip */}
        {(isListening || isSpeaking) && (
          <div className="absolute bottom-full right-0 mb-2 bg-background/95 backdrop-blur-sm border border-primary/20 px-4 py-2 rounded-lg shadow-lg animate-fade-in whitespace-nowrap">
            <p className="text-sm font-medium">
              {isListening ? '🎤 Listening...' : '🔊 Speaking...'}
            </p>
          </div>
        )}

        {/* Permission helper when blocked */}
        {micPermission === 'denied' && !isListening && !isSpeaking && (
          <div className="absolute bottom-full right-0 mb-2 bg-destructive text-destructive-foreground px-3 py-2 rounded-lg shadow-lg animate-fade-in">
            <div className="flex items-center gap-3">
              <p className="text-sm font-medium">Microphone blocked for this site.</p>
              <button
                onClick={requestMicrophonePermission}
                className="underline text-sm hover:opacity-90"
              >
                Retry access
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
