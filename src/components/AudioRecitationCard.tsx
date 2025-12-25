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
      <div className="relative z-10 p-5 md:p-6 lg:p-7">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 md:gap-5">
            {/* Icon with glow */}
            <motion.div 
              animate={{ 
                boxShadow: ['0 0 15px rgba(251,191,36,0.2)', '0 0 30px rgba(251,191,36,0.4)', '0 0 15px rgba(251,191,36,0.2)']
              }}
              transition={{ duration: 2.5, repeat: Infinity }}
              className="relative w-14 h-14 md:w-16 md:h-16 rounded-xl md:rounded-2xl bg-gradient-to-br from-amber-400/20 to-amber-500/10 border border-amber-400/30 flex items-center justify-center backdrop-blur-sm"
            >
              <Headphones size={26} className="text-amber-400 md:w-7 md:h-7" />
              
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
                <Music2 size={12} className="text-amber-400/70" />
              </motion.div>
            </motion.div>
            
            <div>
              <p className="text-white/50 text-xs md:text-sm mb-1 uppercase tracking-wider font-medium">
                কুরআন শুনুন
              </p>
              <h3 className="text-white text-xl md:text-2xl font-bold">
                Audio Recitation
              </h3>
              <p className="text-white/40 text-sm mt-0.5 hidden sm:block">
                Beautiful recitations by world-renowned Qaris
              </p>
            </div>
          </div>
          
          {/* Play Button */}
          <div className="flex items-center gap-3">
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
              
              <div className="relative w-14 h-14 md:w-16 md:h-16 bg-gradient-to-br from-amber-400 to-amber-500 rounded-full flex items-center justify-center shadow-lg shadow-amber-500/30 group-hover:shadow-amber-500/50 transition-shadow">
                <Play size={26} className="text-violet-900 ml-1 md:w-7 md:h-7" fill="currentColor" />
              </div>
            </motion.div>
          </div>
        </div>
        
        {/* Bottom Section - Reciters Preview */}
        <div className="mt-5 pt-4 border-t border-white/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* Reciter avatars */}
              <div className="flex -space-x-2">
                {[1, 2, 3, 4].map((i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="w-8 h-8 md:w-9 md:h-9 rounded-full bg-gradient-to-br from-white/20 to-white/5 border-2 border-violet-900 flex items-center justify-center"
                  >
                    <span className="text-[10px] md:text-xs text-white/70 font-medium">
                      {['AS', 'MS', 'AH', '+'][i - 1]}
                    </span>
                  </motion.div>
                ))}
              </div>
              <div>
                <p className="text-white/80 text-sm font-medium">১০০+ সূরা</p>
                <p className="text-white/40 text-xs">Multiple Reciters</p>
              </div>
            </div>
            
            <motion.div
              animate={{ x: [0, 5, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="flex items-center gap-1 text-amber-400"
            >
              <span className="text-sm font-medium hidden sm:inline">শুনুন</span>
              <ChevronRight size={18} />
            </motion.div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default AudioRecitationCard;