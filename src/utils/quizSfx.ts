// Utility for playing Quiz SFX using Web Audio API
const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();

// Generate tone using Web Audio API
function playTone(frequency: number, duration: number, type: OscillatorType = "sine") {
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();

  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);

  oscillator.frequency.value = frequency;
  oscillator.type = type;

  gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);

  oscillator.start(audioContext.currentTime);
  oscillator.stop(audioContext.currentTime + duration);
}

// Play correct answer sound - uplifting chime
function playCorrectSound() {
  playTone(523.25, 0.1, "sine"); // C5
  setTimeout(() => playTone(659.25, 0.1, "sine"), 100); // E5
  setTimeout(() => playTone(783.99, 0.2, "sine"), 200); // G5
}

// Play wrong answer sound - gentle error buzz
function playWrongSound() {
  playTone(220, 0.15, "triangle"); // A3
  setTimeout(() => playTone(196, 0.2, "triangle"), 150); // G3
}

// Play result sound - celebratory fanfare
function playResultSound() {
  playTone(523.25, 0.15, "sine"); // C5
  setTimeout(() => playTone(659.25, 0.15, "sine"), 150); // E5
  setTimeout(() => playTone(783.99, 0.15, "sine"), 300); // G5
  setTimeout(() => playTone(1046.50, 0.3, "sine"), 450); // C6
}

// Timer warnings
function playWarn10() {
  // gentle double beep
  playTone(880, 0.06, "sine");
  setTimeout(() => playTone(880, 0.06, "sine"), 120);
}

function playWarn5() {
  // more urgent triple beep
  playTone(988, 0.06, "square");
  setTimeout(() => playTone(988, 0.06, "square"), 110);
  setTimeout(() => playTone(988, 0.06, "square"), 220);
}

export async function playSfx(type: "correct" | "wrong" | "result" | "warn10" | "warn5") {
  try {
    switch (type) {
      case "correct":
        playCorrectSound();
        break;
      case "wrong":
        playWrongSound();
        break;
      case "result":
        playResultSound();
        break;
      case "warn10":
        playWarn10();
        break;
      case "warn5":
        playWarn5();
        break;
    }
  } catch (error) {
    console.error("Error playing SFX:", error);
  }
}
