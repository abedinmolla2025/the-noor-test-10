import { Play, Headphones } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const AudioRecitationCard = () => {
  const navigate = useNavigate();

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.01 }}
      onClick={() => navigate("/quran")}
      className="relative bg-gradient-to-br from-[hsl(158,64%,22%)] via-[hsl(168,55%,25%)] to-[hsl(158,50%,20%)] rounded-2xl p-5 shadow-xl overflow-hidden cursor-pointer group"
    >
      {/* Decorative elements */}
      <div className="absolute right-0 top-0 w-32 h-32 bg-[hsl(45,93%,58%)]/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />
      <div className="absolute left-0 bottom-0 w-24 h-24 bg-[hsl(158,64%,40%)]/10 rounded-full translate-y-1/2 -translate-x-1/2 blur-2xl" />
      
      {/* Border accent */}
      <div className="absolute inset-0 rounded-2xl border border-[hsl(45,93%,58%)]/10 group-hover:border-[hsl(45,93%,58%)]/30 transition-colors" />
      
      <div className="relative z-10 flex items-center justify-between">
        <div className="flex items-center gap-4">
          {/* Icon with gold glow */}
          <motion.div 
            animate={{ 
              boxShadow: ['0 0 10px hsl(45,93%,58%,0.2)', '0 0 20px hsl(45,93%,58%,0.4)', '0 0 10px hsl(45,93%,58%,0.2)']
            }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-12 h-12 rounded-xl bg-gradient-to-br from-[hsl(45,93%,58%)]/20 to-[hsl(45,93%,58%)]/10 border border-[hsl(45,93%,58%)]/30 flex items-center justify-center"
          >
            <Headphones size={22} className="text-[hsl(45,93%,58%)]" />
          </motion.div>
          
          <div>
            <p className="text-white/60 text-sm mb-0.5">Listen to Quran</p>
            <h3 className="text-white text-xl font-bold">Audio Recitation</h3>
          </div>
        </div>
        
        <motion.button 
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          className="w-14 h-14 bg-gradient-to-br from-[hsl(45,93%,58%)] to-[hsl(45,93%,48%)] rounded-full flex items-center justify-center shadow-lg shadow-[hsl(45,93%,58%)]/20 group-hover:shadow-[hsl(45,93%,58%)]/40 transition-shadow"
        >
          <Play size={24} className="text-[hsl(158,64%,15%)] ml-1" fill="currentColor" />
        </motion.button>
      </div>
    </motion.div>
  );
};

export default AudioRecitationCard;