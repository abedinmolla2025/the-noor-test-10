import { useState, useRef, useEffect } from "react";
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX } from "lucide-react";
import { motion } from "framer-motion";

interface QuranAudioPlayerProps {
  audioUrl: string;
  ayahNumber: number;
  onNext?: () => void;
  onPrevious?: () => void;
  hasNext?: boolean;
  hasPrevious?: boolean;
}

const SPEED_OPTIONS = [0.5, 0.75, 1, 1.25, 1.5, 2];

const QuranAudioPlayer = ({
  audioUrl,
  ayahNumber,
  onNext,
  onPrevious,
  hasNext = true,
  hasPrevious = true,
}: QuranAudioPlayerProps) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [speed, setSpeed] = useState(1);

  useEffect(() => {
    if (audioRef.current && audioUrl) {
      audioRef.current.pause();
      audioRef.current.src = audioUrl;
      audioRef.current.playbackRate = speed;
      audioRef.current.load();
      setProgress(0);
      
      audioRef.current.play()
        .then(() => setIsPlaying(true))
        .catch((err) => {
          console.log("Autoplay prevented:", err);
          setIsPlaying(false);
        });
    }
  }, [audioUrl]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = speed;
    }
  }, [speed]);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const cycleSpeed = () => {
    const currentIndex = SPEED_OPTIONS.indexOf(speed);
    const nextIndex = (currentIndex + 1) % SPEED_OPTIONS.length;
    setSpeed(SPEED_OPTIONS[nextIndex]);
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      const progress = (audioRef.current.currentTime / audioRef.current.duration) * 100;
      setProgress(progress || 0);
    }
  };

  const handleEnded = () => {
    setIsPlaying(false);
    setProgress(0);
    if (onNext && hasNext) {
      onNext();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed bottom-20 left-0 right-0 mx-3 bg-card/98 backdrop-blur-lg rounded-2xl shadow-lg border border-primary/30 p-4"
    >
      <audio
        ref={audioRef}
        preload="auto"
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleEnded}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      />

      {/* Progress Bar with Gold */}
      <div className="w-full h-1.5 bg-muted rounded-full mb-3 overflow-hidden">
        <div
          className="h-full bg-primary rounded-full transition-all duration-200 shadow-glow"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="flex items-center justify-between">
        {/* Speed Control with Gold */}
        <button
          onClick={cycleSpeed}
          className="px-3 py-1.5 rounded-lg bg-primary/20 text-primary text-xs font-bold min-w-[45px] hover:bg-primary/30 transition-colors border border-primary/30"
        >
          {speed}x
        </button>
        
        <div className="flex items-center gap-2">
          <button
            onClick={onPrevious}
            disabled={!hasPrevious}
            className="p-2 rounded-full hover:bg-muted transition-colors disabled:opacity-30"
          >
            <SkipBack className="w-5 h-5" />
          </button>

          <button
            onClick={togglePlay}
            className="p-4 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-glow"
          >
            {isPlaying ? (
              <Pause className="w-6 h-6" />
            ) : (
              <Play className="w-6 h-6 ml-0.5" />
            )}
          </button>

          <button
            onClick={onNext}
            disabled={!hasNext}
            className="p-2 rounded-full hover:bg-muted transition-colors disabled:opacity-30"
          >
            <SkipForward className="w-5 h-5" />
          </button>
        </div>

        <button
          onClick={toggleMute}
          className="p-2 rounded-full hover:bg-muted transition-colors"
        >
          {isMuted ? (
            <VolumeX className="w-5 h-5 text-muted-foreground" />
          ) : (
            <Volume2 className="w-5 h-5 text-primary" />
          )}
        </button>
      </div>

      {/* Ayah Number with Gold */}
      <div className="text-center mt-2">
        <span className="text-xs text-primary font-medium">আয়াত {ayahNumber}</span>
      </div>
    </motion.div>
  );
};

export default QuranAudioPlayer;
