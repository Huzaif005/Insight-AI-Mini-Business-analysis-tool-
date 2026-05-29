import { useEffect, useRef } from 'react';
import { Globe, ArrowRight } from 'lucide-react';

export default function App() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const fadeAnimRef = useRef<number | null>(null);
  const fadingOutRef = useRef<boolean>(false);

  // Direct DOM opacity set for ultra-smooth performance
  const setVideoOpacity = (opacity: number) => {
    if (videoRef.current) {
      videoRef.current.style.opacity = String(opacity);
    }
  };

  const getVideoOpacity = (): number => {
    if (videoRef.current) {
      return parseFloat(videoRef.current.style.opacity || '0');
    }
    return 0;
  };

  // requestAnimationFrame based fade system
  const fadeTo = (targetOpacity: number, duration: number, callback?: () => void) => {
    if (fadeAnimRef.current) {
      cancelAnimationFrame(fadeAnimRef.current);
    }

    const startOpacity = getVideoOpacity();
    const opacityDiff = targetOpacity - startOpacity;
    let startTime: number | null = null;

    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Interpolate opacity and apply
      const currentOpacity = startOpacity + opacityDiff * progress;
      setVideoOpacity(currentOpacity);

      if (progress < 1) {
        fadeAnimRef.current = requestAnimationFrame(step);
      } else {
        fadeAnimRef.current = null;
        if (callback) callback();
      }
    };

    fadeAnimRef.current = requestAnimationFrame(step);
  };

  const handlePlay = () => {
    // Fade in over 500ms on load/play start
    fadingOutRef.current = false;
    fadeTo(1, 500);
  };

  const handleTimeUpdate = () => {
    const video = videoRef.current;
    if (!video) return;

    const timeLeft = video.duration - video.currentTime;
    // Trigger 500ms fade-out to 0 when 0.55s remain
    if (timeLeft <= 0.55 && !fadingOutRef.current) {
      fadingOutRef.current = true;
      fadeTo(0, 500);
    }
  };

  const handleEnded = () => {
    const video = videoRef.current;
    if (!video) return;

    // Set opacity to 0 immediately on end
    setVideoOpacity(0);

    // Wait 100ms, reset to 0, play, and fade back in
    setTimeout(() => {
      video.currentTime = 0;
      video.play()
        .then(() => {
          fadingOutRef.current = false;
          fadeTo(1, 500);
        })
        .catch(err => {
          console.error("Autoplay failed on loop restart:", err);
          // Fallback in case of autoplay blocks
          fadingOutRef.current = false;
          setVideoOpacity(1);
        });
    }, 100);
  };

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Initialize with 0 opacity
    setVideoOpacity(0);

    // Try playing video immediately on mount
    video.play()
      .then(() => {
        fadingOutRef.current = false;
        fadeTo(1, 500);
      })
      .catch(err => {
        console.log("Initial autoplay blocked. Waiting for interaction.", err);
      });

    return () => {
      if (fadeAnimRef.current) {
        cancelAnimationFrame(fadeAnimRef.current);
      }
    };
  }, []);

  return (
    <div className="relative min-h-screen bg-black overflow-hidden flex flex-col justify-between z-10">
      
      {/* Full-screen looping background video */}
      <video
        ref={videoRef}
        autoPlay
        muted
        playsInline
        onPlay={handlePlay}
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleEnded}
        className="absolute inset-0 z-0 w-full h-full object-cover translate-y-[17%] pointer-events-none"
        style={{ opacity: 0 }}
      >
        <source
          src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260328_115001_bcdaa3b4-03de-47e7-ad63-ae3e392c32d4.mp4"
          type="video/mp4"
        />
        Your browser does not support the video tag.
      </video>

      {/* Navigation bar */}
      <header className="relative z-20 pl-6 pr-6 py-6 w-full">
        <div className="liquid-glass rounded-full px-6 py-3 flex items-center justify-between max-w-5xl mx-auto border border-white/5">
          
          {/* Left Side Logo */}
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2 text-white font-semibold text-lg cursor-pointer">
              <Globe className="w-6 h-6 text-white animate-spin-slow" size={24} />
              <span>Asme</span>
            </div>
            
            {/* Nav links (hidden on mobile, md:flex) */}
            <nav className="hidden md:flex items-center gap-8">
              <a href="#" className="text-white/80 hover:text-white transition-colors text-sm font-medium">Features</a>
              <a href="#" className="text-white/80 hover:text-white transition-colors text-sm font-medium">Pricing</a>
              <a href="#" className="text-white/80 hover:text-white transition-colors text-sm font-medium">About</a>
            </nav>
          </div>

          {/* Right Side Buttons */}
          <div className="flex items-center gap-4">
            <button className="text-white hover:text-white/80 transition-colors text-sm font-medium px-2 py-1">
              Sign Up
            </button>
            <button className="liquid-glass rounded-full px-6 py-2 text-white text-sm font-medium transition transform hover:scale-[1.03] active:scale-[0.98]">
              Login
            </button>
          </div>

        </div>
      </header>

      {/* Hero Content Area */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 py-12 text-center -translate-y-[20%]">
        
        {/* Heading */}
        <h1 
          className="text-5xl md:text-6xl lg:text-7xl text-white mb-8 tracking-tight whitespace-nowrap"
          style={{ fontFamily: "'Instrument Serif', serif" }}
        >
          Built for the curious
        </h1>

        {/* Input & Subtitle Container */}
        <div className="max-w-xl w-full space-y-4">
          
          {/* Email input bar */}
          <div className="liquid-glass rounded-full pl-6 pr-2 py-2 flex items-center gap-3 border border-white/5">
            <input 
              type="email" 
              placeholder="Enter your email" 
              className="bg-transparent text-white placeholder:text-white/40 text-base outline-none flex-1 border-none"
            />
            <button 
              type="submit" 
              className="bg-white rounded-full p-3 text-black hover:scale-105 active:scale-95 transition duration-200 cursor-pointer flex items-center justify-center"
              aria-label="Submit Email"
            >
              <ArrowRight className="w-5 h-5" size={20} />
            </button>
          </div>

          {/* Subtitle text */}
          <p className="text-white text-sm leading-relaxed px-4 opacity-70">
            Stay updated with the latest news and insights. Subscribe to our newsletter today and never miss out on exciting updates.
          </p>

          {/* Manifesto button */}
          <div className="pt-4 flex justify-center">
            <button className="liquid-glass rounded-full px-8 py-3 text-white text-sm font-medium hover:bg-white/5 transition-colors border border-white/5 shadow-md">
              Our Manifesto
            </button>
          </div>

        </div>

      </main>

      {/* Social icons footer */}
      <footer className="relative z-10 flex justify-center gap-4 pb-12">
        <button 
          className="liquid-glass rounded-full p-4 text-white/80 hover:text-white hover:bg-white/5 transition-all shadow-sm cursor-pointer"
          aria-label="Instagram"
        >
          <svg
            className="w-5 h-5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
            <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
            <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
          </svg>
        </button>
        <button 
          className="liquid-glass rounded-full p-4 text-white/80 hover:text-white hover:bg-white/5 transition-all shadow-sm cursor-pointer"
          aria-label="Twitter"
        >
          <svg
            className="w-5 h-5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
          </svg>
        </button>
        <button 
          className="liquid-glass rounded-full p-4 text-white/80 hover:text-white hover:bg-white/5 transition-all shadow-sm cursor-pointer"
          aria-label="Globe Website"
        >
          <Globe className="w-5 h-5" size={20} />
        </button>
      </footer>


    </div>
  );
}
