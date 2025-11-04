// components/home/video-slider.jsx
"use client";

import { useState, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight, Play } from "lucide-react";

const slides = [
  {
    id: 1,
    video:
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/googlepixel-zLKE2ISzdrASuKOc08RhnFoNYo93M6.mp4",
    // poster: "/google-pixel-phone.jpg",
    title: "Google Pixel",
  },
  {
    id: 2,
    video:
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/AppleShort-ioQTH3tg3LOr0klY8l1SNLfeuLffUg.mp4",
    // poster: "/apple-iphone.jpg",
    title: "Apple iPhone",
  },
];

export default function VideoSlider() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showPlayButton, setShowPlayButton] = useState(true);
  const [progress, setProgress] = useState(0);
  const videoRef = useRef(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      const percent = video.duration ? (video.currentTime / video.duration) * 100 : 0;
      setProgress(percent);
    };

    const handleEnded = () => {
      nextSlide();
    };

    const handlePlay = () => {
      setShowPlayButton(false);
    };

    const handleKeyDown = (e) => {
      if (e.key === "ArrowLeft") prevSlide();
      if (e.key === "ArrowRight") nextSlide();
    };

    video.addEventListener("timeupdate", handleTimeUpdate);
    video.addEventListener("ended", handleEnded);
    video.addEventListener("play", handlePlay);
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      video.removeEventListener("timeupdate", handleTimeUpdate);
      video.removeEventListener("ended", handleEnded);
      video.removeEventListener("play", handlePlay);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Attempt autoplay
    const playPromise = video.play();
    if (playPromise !== undefined) {
      playPromise.catch(() => {
        setShowPlayButton(true);
      });
    }
  }, [currentSlide]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
    setProgress(0);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
    setProgress(0);
  };

  const goToSlide = (index) => {
    setCurrentSlide(index);
    setProgress(0);
  };

  const handlePlayClick = () => {
    videoRef.current?.play();
  };

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden pt-16" role="region" aria-label="Video slider">
      {/* Video Container */}
      <div className="relative w-full h-full">
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-opacity duration-500 ${
              index === currentSlide ? "opacity-100" : "opacity-0"
            }`}
            role="tabpanel"
            aria-label={`Slide ${index + 1}: ${slide.title}`}
          >
            <video
              ref={index === currentSlide ? videoRef : null}
              src={slide.video}
              poster={slide.poster}
              className="w-full h-full object-cover"
              muted
              playsInline
            />

            {/* Play Button Overlay */}
            {showPlayButton && index === currentSlide && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                <button
                  onClick={handlePlayClick}
                  className="bg-white/20 hover:bg-white/30 backdrop-blur-sm p-4 rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-white"
                  aria-label="Play video"
                >
                  <Play size={48} className="text-white fill-white" />
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Progress Bar */}
      <div
        className="absolute bottom-0 left-0 right-0 h-1 bg-white/20"
        role="progressbar"
        aria-valuenow={Math.round(progress)}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div className="h-full bg-white transition-all duration-100" style={{ width: `${progress}%` }} />
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-white/20 hover:bg-white/40 backdrop-blur-sm p-3 rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-white"
        aria-label="Previous slide"
      >
        <ChevronLeft size={24} className="text-white" />
      </button>

      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-white/20 hover:bg-white/40 backdrop-blur-sm p-3 rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-white"
        aria-label="Next slide"
      >
        <ChevronRight size={24} className="text-white" />
      </button>

      {/* Dot Indicators */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex gap-2" role="tablist">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-2 h-2 rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-white ${
              index === currentSlide ? "bg-white w-8" : "bg-white/50 hover:bg-white/75"
            }`}
            aria-label={`Go to slide ${index + 1}`}
            role="tab"
            aria-selected={index === currentSlide}
          />
        ))}
      </div>

      {/* Slide Title */}
      <div className="absolute bottom-20 left-8 z-10">
        <h2 className="text-4xl md:text-5xl font-bold text-white">{slides[currentSlide].title}</h2>
      </div>
    </div>
  );
}
