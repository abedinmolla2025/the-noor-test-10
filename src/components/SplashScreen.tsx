 import { useEffect, useState } from "react";
 import Lottie from "lottie-react";
 
 export function SplashScreen(props: { lottieUrl?: string; onComplete: () => void }) {
   const { lottieUrl, onComplete } = props;
   const [animationData, setAnimationData] = useState<any>(null);
   const [visible, setVisible] = useState(true);
   const [fadeOut, setFadeOut] = useState(false);
 
   useEffect(() => {
     if (!lottieUrl) {
       onComplete();
       return;
     }
 
     // Load Lottie JSON
     fetch(lottieUrl)
       .then((res) => res.json())
       .then((data) => {
         setAnimationData(data);
         // Auto-hide after 3 seconds
         setTimeout(() => {
           setFadeOut(true);
           setTimeout(() => {
             setVisible(false);
             onComplete();
           }, 500); // Fade out duration
         }, 3000);
       })
       .catch(() => {
         onComplete();
       });
   }, [lottieUrl, onComplete]);
 
   if (!visible) return null;
 
   return (
     <div
       className={`fixed inset-0 z-[9999] flex items-center justify-center bg-background transition-opacity duration-500 ${
         fadeOut ? "opacity-0" : "opacity-100"
       }`}
     >
       {animationData ? (
         <div className="w-full max-w-md px-8">
           <Lottie animationData={animationData} loop={true} />
         </div>
       ) : (
         <div className="flex flex-col items-center gap-4">
           <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
           <p className="text-sm text-muted-foreground">Loading…</p>
         </div>
       )}
     </div>
   );
 }