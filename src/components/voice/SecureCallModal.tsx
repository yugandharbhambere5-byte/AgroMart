import React, { useState, useEffect } from 'react';
import { Phone, PhoneOff, Mic, MicOff, Volume2, VolumeX, ShieldCheck, Loader2 } from 'lucide-react';

interface SecureCallModalProps {
  isOpen: boolean;
  calleeName: string;
  onClose: () => void;
  language: string;
}

export default function SecureCallModal({ isOpen, calleeName, onClose, language }: SecureCallModalProps) {
  const [callStatus, setCallStatus] = useState<'connecting' | 'ringing' | 'connected' | 'disconnected'>('connecting');
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    setCallStatus('connecting');
    setDuration(0);

    // Simulated calling state transitions
    const ringingTimeout = setTimeout(() => {
      setCallStatus('ringing');
    }, 1500);

    const connectedTimeout = setTimeout(() => {
      setCallStatus('connected');
    }, 4000);

    return () => {
      clearTimeout(ringingTimeout);
      clearTimeout(connectedTimeout);
    };
  }, [isOpen]);

  useEffect(() => {
    if (callStatus !== 'connected') return;

    const interval = setInterval(() => {
      setDuration(prev => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [callStatus]);

  if (!isOpen) return null;

  const formatDuration = (sec: number) => {
    const m = Math.floor(sec / 60).toString().padStart(2, '0');
    const s = (sec % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const getStatusText = () => {
    if (callStatus === 'connecting') {
      return language === 'mr' ? 'सुरक्षित जोडणी होत आहे...' : language === 'hi' ? 'सुरक्षित कनेक्शन बनाया जा रहा है...' : 'Securing call line...';
    }
    if (callStatus === 'ringing') {
      return language === 'mr' ? 'घंटी वाजते आहे...' : language === 'hi' ? 'घंटी बज रही है...' : 'Ringing...';
    }
    if (callStatus === 'connected') {
      return language === 'mr' ? 'चालू कॉल' : language === 'hi' ? 'सक्रिय कॉल' : 'Connected';
    }
    return 'Disconnected';
  };

  return (
    <div className="fixed inset-0 z-[600] flex items-center justify-center p-4">
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-md"
        onClick={() => {
          setCallStatus('disconnected');
          onClose();
        }}
      />
      
      {/* Modal Container */}
      <div className="relative w-full max-w-sm bg-linear-to-b from-earth-950 to-earth-900 border border-white/10 rounded-3xl p-8 text-center shadow-2xl animate-scale-in text-white flex flex-col items-center gap-6">
        
        {/* Secure badge */}
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-black uppercase tracking-wider">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>{language === 'mr' ? 'गोपनीय वेब कॉल' : language === 'hi' ? 'सुरक्षित वेब कॉल' : 'Secured Web Call'}</span>
        </div>

        {/* Pulsing Avatar Area */}
        <div className="relative my-4 flex items-center justify-center">
          {callStatus !== 'connected' && (
            <>
              <div className="absolute w-28 h-28 rounded-full border border-primary-500/30 bg-primary-500/5 animate-ping" />
              <div className="absolute w-36 h-36 rounded-full border border-primary-500/20 bg-primary-500/5 animate-ping" style={{ animationDelay: '0.5s' }} />
            </>
          )}
          <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-primary-600 to-primary-800 flex items-center justify-center font-black text-3xl shadow-xl relative z-10 border-2 border-white/10">
            {calleeName.charAt(0)}
          </div>
        </div>

        {/* Callee Details */}
        <div>
          <h2 className="text-xl font-black">{calleeName}</h2>
          <p className="text-xs text-white/50 font-bold mt-1 uppercase tracking-widest flex items-center justify-center gap-1.5">
            {callStatus === 'connecting' && <Loader2 className="w-3 h-3 animate-spin text-primary-500" />}
            {callStatus === 'connected' && <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />}
            <span>{getStatusText()}</span>
          </p>
          {callStatus === 'connected' && (
            <span className="text-sm font-mono mt-2 block font-extrabold text-primary-400">
              {formatDuration(duration)}
            </span>
          )}
        </div>

        {/* Security Warning */}
        <div className="text-[10px] text-white/40 font-semibold px-4 py-2 bg-white/5 rounded-xl max-w-xs leading-relaxed">
          {language === 'mr' 
            ? '✓ तुमचा मोबाईल नंबर सुरक्षित ठेवला आहे आणि कोणाशीही शेअर केला गेलेला नाही.' 
            : language === 'hi' 
            ? '✓ आपका मोबाइल नंबर गुप्त रखा गया है और किसी के साथ साझा नहीं किया गया है।' 
            : '✓ Your phone number is hidden and protected. No numbers are shared.'}
        </div>

        {/* Controls */}
        <div className="flex items-center gap-6 mt-4">
          {/* Mute Button */}
          <button
            onClick={() => setIsMuted(!isMuted)}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors border cursor-pointer ${
              isMuted 
                ? 'bg-red-500/20 border-red-500 text-red-500 hover:bg-red-500/30' 
                : 'bg-white/5 border-white/10 text-white/80 hover:bg-white/10'
            }`}
            title="Mute"
          >
            {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>

          {/* End Call Button */}
          <button
            onClick={() => {
              setCallStatus('disconnected');
              onClose();
            }}
            className="w-16 h-16 rounded-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center shadow-lg hover:scale-105 transition-all cursor-pointer border border-red-700"
            title="End Call"
          >
            <PhoneOff className="w-6 h-6" />
          </button>

          {/* Speaker Button */}
          <button
            onClick={() => setIsSpeakerOn(!isSpeakerOn)}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors border cursor-pointer ${
              isSpeakerOn 
                ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400 hover:bg-emerald-500/30' 
                : 'bg-white/5 border-white/10 text-white/80 hover:bg-white/10'
            }`}
            title="Speaker"
          >
            {isSpeakerOn ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
          </button>
        </div>
      </div>
    </div>
  );
}
