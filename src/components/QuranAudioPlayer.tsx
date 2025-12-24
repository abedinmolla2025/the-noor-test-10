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

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.load();
      setIsPlaying(false);
      setProgress(0);
    }
  }, [audioUrl]);

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
      className="fixed bottom-20 left-0 right-0 mx-3 bg-card/95 backdrop-blur-lg rounded-2xl shadow-lg border border-border p-4"
    >
      <audio
        ref={audioRef}
        src={audioUrl}
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleEnded}
      />

      {/* Progress Bar */}
      <div className="w-full h-1 bg-muted rounded-full mb-3 overflow-hidden">
        <div
          className="h-full bg-primary rounded-full transition-all duration-200"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">আয়াত {ayahNumber}</span>
        
        <div className="flex items-center gap-3">
          <button
            onClick={onPrevious}
            disabled={!hasPrevious}
            className="p-2 rounded-full hover:bg-muted transition-colors disabled:opacity-30"
          >
            <SkipBack className="w-5 h-5" />
          </button>

          <button
            onClick={togglePlay}
            className="p-3 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
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
            <Volume2 className="w-5 h-5" />
          )}
        </button>
      </div>
    </motion.div>
  );
};

export default QuranAudioPlayer;
