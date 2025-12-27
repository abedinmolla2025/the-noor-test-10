import { Play, Headphones, Music2, ChevronRight } from "lucide-react";
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
      className="relative overflow-hidden rounded-[1.5rem] md:rounded-[2rem] shadow-2xl cursor-pointer group"
    >
      {/* Premium Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-violet-900 via-purple-900 to-indigo-900" />
      
      {/* Animated Orbs */}
      <motion.div 
        animate={{ 
          scale: [1, 1.2, 1],
          opacity: [0.25, 0.4, 0.25]
        }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -top-12 -right-12 w-48 h-48 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full blur-[50px]"
      />
      <motion.div 
        animate={{ 
          scale: [1, 1.15, 1],
          opacity: [0.2, 0.35, 0.2]
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="absolute -bottom-12 -left-12 w-40 h-40 bg-gradient-to-tr from-violet-500 to-purple-600 rounded-full blur-[40px]"
      />
      
      {/* Sound Wave Pattern */}
      <div className="absolute inset-0 opacity-[0.04]" style={{
        backgroundImage: `repeating-linear-gradient(90deg, transparent, transparent 2px, white 2px, white 4px)`,
        backgroundSize: '20px 100%'
      }} />
      
      {/* Mesh Pattern */}
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
        backgroundSize: '24px 24px'
      }} />
      
      {/* Inner Border */}
      <div className="absolute inset-0 rounded-[1.5rem] md:rounded-[2rem] border border-white/10 group-hover:border-amber-400/20 transition-colors duration-300" />

      {/* Content */}
      <div className="relative z-10 p-4 md:p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 md:gap-4">
            {/* Icon with glow */}
            <motion.div 
              animate={{ 
                boxShadow: ['0 0 15px rgba(251,191,36,0.2)', '0 0 30px rgba(251,191,36,0.4)', '0 0 15px rgba(251,191,36,0.2)']
              }}
              transition={{ duration: 2.5, repeat: Infinity }}
              className="relative w-11 h-11 md:w-12 md:h-12 rounded-xl bg-gradient-to-br from-amber-400/20 to-amber-500/10 border border-amber-400/30 flex items-center justify-center backdrop-blur-sm"
            >
              <Headphones size={22} className="text-amber-400 md:w-6 md:h-6" />
              
              {/* Floating music notes */}
              <motion.div
                animate={{ 
                  y: [-5, -15, -5],
                  opacity: [0.5, 1, 0.5],
                  x: [0, 5, 0]
                }}
                transition={{ duration: 3, repeat: Infinity }}
                className="absolute -top-1 -right-1"
              >
                <Music2 size={10} className="text-amber-400/70" />
              </motion.div>
            </motion.div>
            
            <div>
              <p className="text-white/50 text-[10px] md:text-xs uppercase tracking-wider font-medium">
                কুরআন শুনুন
              </p>
              <h3 className="text-white text-lg md:text-xl font-bold">
                Audio Recitation
              </h3>
            </div>
          </div>
          
          {/* Play Button */}
          <motion.div 
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.95 }}
            className="relative"
          >
            {/* Pulse ring effect */}
            <motion.div
              animate={{ 
                scale: [1, 1.3, 1],
                opacity: [0.4, 0, 0.4]
              }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute inset-0 bg-amber-400 rounded-full"
            />
            
            <div className="relative w-11 h-11 md:w-12 md:h-12 bg-gradient-to-br from-amber-400 to-amber-500 rounded-full flex items-center justify-center shadow-lg shadow-amber-500/30 group-hover:shadow-amber-500/50 transition-shadow">
              <Play size={22} className="text-violet-900 ml-0.5 md:w-6 md:h-6" fill="currentColor" />
            </div>
          </motion.div>
        </div>
        
        {/* Bottom Section - Compact */}
        <div className="mt-3 pt-3 border-t border-white/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex -space-x-1.5">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="w-6 h-6 rounded-full bg-gradient-to-br from-white/20 to-white/5 border border-violet-900 flex items-center justify-center"
                  >
                    <span className="text-[8px] text-white/70 font-medium">
                      {['AS', 'MS', '+'][i - 1]}
                    </span>
                  </div>
                ))}
              </div>
              <p className="text-white/60 text-xs">১০০+ সূরা</p>
            </div>
            
            <motion.div
              animate={{ x: [0, 3, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="flex items-center gap-0.5 text-amber-400"
            >
              <span className="text-xs font-medium">শুনুন</span>
              <ChevronRight size={14} />
            </motion.div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default AudioRecitationCard;