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
  const [micAllowed, setMicAllowed] = useState(false);
  const [permissionError, setPermissionError] = useState('');
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const speak = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1;
      utterance.volume = 1;
      
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleVoiceCommand = (command: string) => {
    const lowerCommand = command.toLowerCase();
    
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
    } else if (lowerCommand.includes('verify') || lowerCommand.includes('check') || lowerCommand.includes('analyze')) {
      if (location.pathname !== '/') {
        speak("Navigating to verification page. Please upload or paste the content you want to verify.");
        navigate('/?scrollTo=verify');
      } else {
        speak("Please upload a file or paste text in the verification section below.");
        const verifySection = document.getElementById('verify');
        if (verifySection) {
          verifySection.scrollIntoView({ behavior: 'smooth' });
        }
      }
    } else if (lowerCommand.includes('help') || lowerCommand.includes('what can you do')) {
      speak("I can help you verify content, navigate to different pages, or answer questions about VeriFy AI. Try saying things like: verify this content, go to dashboard, or how does it work.");
    } else if (lowerCommand.includes('how does') || lowerCommand.includes('how it works')) {
      speak("VeriFy AI uses advanced artificial intelligence to analyze text, images, videos, and audio. We check authenticity, detect AI-generated content, and verify information against trusted sources. You can upload any content, and we'll give you a trust score with detailed analysis.");
    } else {
      speak("I'm not sure I understood that. You can ask me to verify content, navigate to different pages, or say help for more options.");
    }
  };

  const initSpeechRecognition = () => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      setIsSupported(false);
      return;
    }

    setIsSupported(true);
    
    try {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognitionInstance = new SpeechRecognition();
      recognitionInstance.continuous = false;
      recognitionInstance.interimResults = false;
      recognitionInstance.lang = 'en-US';

      recognitionInstance.onstart = () => {
        console.log('Voice recognition started');
        setIsListening(true);
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
        
        if (event.error === 'not-allowed' || event.error === 'audio-capture') {
          setMicAllowed(false);
          setPermissionError('Microphone access denied or blocked.');
        }
      };

      recognitionInstance.onend = () => {
        console.log('Voice recognition ended');
        setIsListening(false);
      };

      setRecognition(recognitionInstance);
      console.log('Speech recognition initialized successfully');
    } catch (e) {
      console.error('Speech recognition initialization failed:', e);
      setIsSupported(false);
      toast({
        title: 'Speech recognition not supported',
        description: 'Your browser may not support the Web Speech API. Try Chrome or Edge.',
        variant: 'destructive'
      });
    }
  };

  const checkMicPermission = async () => {
    try {
      const nav: any = navigator as any;
      if (nav?.permissions?.query) {
        const status = await nav.permissions.query({ name: 'microphone' });
        console.log('Mic permission status:', status.state);
        
        if (status.state === 'granted') {
          setMicAllowed(true);
          setPermissionError('');
          initSpeechRecognition();
        } else if (status.state === 'prompt') {
          setMicAllowed(false);
          setPermissionError('Please allow microphone access to use voice assistant.');
        } else {
          setMicAllowed(false);
          setPermissionError('Microphone blocked for this site.');
        }

        status.onchange = () => {
          console.log('Mic permission changed:', status.state);
          checkMicPermission();
        };
      } else {
        // Fallback if permissions API not available
        setMicAllowed(false);
        setPermissionError('Click to allow microphone access.');
      }
    } catch (err) {
      console.error('Permission check failed:', err);
      setMicAllowed(false);
      setPermissionError('Click to request microphone access.');
    }
  };

  const requestMicAccess = async () => {
    try {
      console.log('Requesting microphone access...');
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop());
      
      setMicAllowed(true);
      setPermissionError('');
      
      toast({
        title: "Microphone Access Granted",
        description: "Voice assistant is now active!",
      });
      
      // Initialize speech recognition after permission granted
      initSpeechRecognition();
    } catch (err: any) {
      console.error('Microphone access denied:', err);
      setMicAllowed(false);
      
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setPermissionError('Microphone access denied. Click the 🔒 icon near your address bar → Allow Microphone.');
      } else if (err.name === 'NotFoundError') {
        setPermissionError('No microphone found. Please connect a microphone.');
      } else {
        setPermissionError('Could not access microphone. Please check your device settings.');
      }
      
      toast({
        title: "Microphone Access Denied",
        description: "Please allow microphone access to use voice assistant.",
        variant: "destructive"
      });
    }
  };

  const toggleListening = async () => {
    if (!isSupported) {
      toast({
        title: "Not Supported",
        description: "Voice recognition is not supported in your browser. Try Chrome or Edge.",
        variant: "destructive"
      });
      return;
    }

    if (!micAllowed) {
      await requestMicAccess();
      return;
    }

    if (!recognition) {
      toast({
        title: "Voice Assistant Not Ready",
        description: "Please try again.",
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

  // Check permission on mount
  useEffect(() => {
    checkMicPermission();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!isSupported && micAllowed) {
    return null;
  }

  return (
    <div className="fixed bottom-8 right-8 z-50">
      <div className="relative">
        {/* Error message when blocked */}
        {!micAllowed && permissionError && (
          <div className="absolute bottom-full right-0 mb-2 bg-destructive text-destructive-foreground p-3 rounded-lg shadow-2xl animate-fade-in max-w-xs">
            <p className="text-sm font-medium mb-2">{permissionError}</p>
            <div className="flex gap-2">
              <button
                onClick={requestMicAccess}
                className="bg-primary hover:bg-primary/90 text-primary-foreground px-3 py-1 rounded text-sm font-medium transition-colors"
              >
                Retry Access
              </button>
              <button
                onClick={() => window.location.reload()}
                className="bg-secondary hover:bg-secondary/90 text-secondary-foreground px-3 py-1 rounded text-sm font-medium transition-colors"
              >
                Reload
              </button>
            </div>
          </div>
        )}

        {/* Voice Assistant Button */}
        <Button
          onClick={toggleListening}
          size="lg"
          className={`rounded-full w-16 h-16 shadow-2xl transition-all duration-300 ${
            isListening || isSpeaking
              ? 'bg-gradient-to-r from-primary to-purple-600 animate-pulse scale-110' 
              : micAllowed 
              ? 'bg-primary hover:scale-105'
              : 'bg-gray-400 hover:scale-105'
          }`}
          title={
            !micAllowed 
              ? "Click to enable microphone" 
              : isListening 
              ? "Listening..." 
              : isSpeaking 
              ? "Speaking..." 
              : "Start voice assistant"
          }
        >
          {isListening ? (
            <Mic className="h-6 w-6 animate-pulse" />
          ) : (
            <MicOff className="h-6 w-6" />
          )}
        </Button>

        {/* Animated Rings when active */}
        {(isListening || isSpeaking) && micAllowed && (
          <>
            <div className="absolute -top-2 -right-2 w-20 h-20 bg-primary/20 rounded-full animate-ping" />
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-purple-500/10 rounded-full animate-ping" style={{ animationDelay: '0.5s' }} />
            <div className="absolute -top-6 -right-6 w-28 h-28 bg-primary/5 rounded-full animate-ping" style={{ animationDelay: '1s' }} />
          </>
        )}

        {/* Status Tooltip when active */}
        {(isListening || isSpeaking) && micAllowed && (
          <div className="absolute bottom-full right-0 mb-2 bg-background/95 backdrop-blur-sm border border-primary/20 px-4 py-2 rounded-lg shadow-lg animate-fade-in whitespace-nowrap">
            <p className="text-sm font-medium">
              {isListening ? '🎤 Listening...' : '🔊 Speaking...'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
