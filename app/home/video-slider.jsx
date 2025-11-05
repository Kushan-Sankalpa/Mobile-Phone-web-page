"use client";

import { useState, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight, Play } from "lucide-react";
import styles from "./video-slider.module.css";

const slides = [
  {
    id: 1,
    video:
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/googlepixel-zLKE2ISzdrASuKOc08RhnFoNYo93M6.mp4",
    
  },
  {
    id: 2,
    video:
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/AppleShort-ioQTH3tg3LOr0klY8l1SNLfeuLffUg.mp4",
    
  },
  // Local files served from /public/media
  { id: 3, video: "/media/samsung.mp4",  },
  { id: 4, video: "/media/applelong.mp4",  },
];

export default function VideoSlider() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showPlayButton, setShowPlayButton] = useState(true);
  const [progress, setProgress] = useState(0);
  const videoRef = useRef(null);

  // Attach listeners to CURRENT slide's <video>
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      const percent = video.duration ? (video.currentTime / video.duration) * 100 : 0;
      setProgress(percent);
    };
    const handleEnded = () => nextSlide();
    const handlePlay  = () => setShowPlayButton(false);

    video.addEventListener("timeupdate", handleTimeUpdate);
    video.addEventListener("ended", handleEnded);
    video.addEventListener("play", handlePlay);

    // Try autoplay for the active slide
    const tryAutoplay = async () => {
      try {
        await video.play();
        setShowPlayButton(false);
      } catch {
        setShowPlayButton(true);
      }
    };
    const t = setTimeout(tryAutoplay, 0);

    const handleKeyDown = (e) => {
      if (e.key === "ArrowLeft") prevSlide();
      if (e.key === "ArrowRight") nextSlide();
    };
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      clearTimeout(t);
      video.removeEventListener("timeupdate", handleTimeUpdate);
      video.removeEventListener("ended", handleEnded);
      video.removeEventListener("play", handlePlay);
      window.removeEventListener("keydown", handleKeyDown);
    };
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
    videoRef.current?.play().catch(() => setShowPlayButton(true));
  };

  const nextIndex = (currentSlide + 1) % slides.length;

  return (
    <div className={styles.slider} role="region" aria-label="Video slider">
      {/* Slides */}
      <div className={styles.slidesWrap}>
        {slides.map((slide, index) => {
          const isActive = index === currentSlide;
          return (
            <div
              key={slide.id}
              className={`${styles.slide} ${isActive ? styles.slideVisible : ""}`}
              role="tabpanel"
              aria-label={`Slide ${index + 1}: ${slide.title}`}
            >
              <video
                ref={isActive ? videoRef : null}
                // Lazy src: only load the active slide
                src={isActive ? slide.video : undefined}
                preload={isActive ? "auto" : "none"}
                className={`${styles.video} no-native-controls`}
                muted
                playsInline
                controls={false}
                controlsList="nodownload nofullscreen noplaybackrate"
                disablePictureInPicture
              />

              {/* Play overlay if autoplay is blocked */}
              {/* {showPlayButton && isActive && (
                <div className={styles.cover}>
                  <button
                    onClick={handlePlayClick}
                    className={styles.playButton}
                    aria-label="Play video"
                  >
                    <Play size={48} className={styles.playIcon} />
                  </button>
                </div>
              )} */}
            </div>
          );
        })}
      </div>

      {/* Hidden preloader for the next slide (optional) */}
      {slides.length > 1 && (
        <video
          className={styles.srOnly}
          src={slides[nextIndex].video}
          preload="metadata"
          muted
          playsInline
          aria-hidden="true"
        />
      )}

      {/* Progress */}
      {/* <progress
        className={styles.progress}
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(progress)}
        max={100}
        value={progress}
      /> */}

      {/* Arrows */}
      <button
        onClick={prevSlide}
        className={`${styles.navButton} ${styles.left}`}
        aria-label="Previous slide"
      >
        <ChevronLeft size={24} className={styles.icon} />
      </button>
      <button
        onClick={nextSlide}
        className={`${styles.navButton} ${styles.right}`}
        aria-label="Next slide"
      >
        <ChevronRight size={24} className={styles.icon} />
      </button>

      {/* Dots */}
      <div className={styles.dots} role="tablist">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`${styles.dot} ${index === currentSlide ? styles.dotActive : ""}`}
            aria-label={`Go to slide ${index + 1}`}
            role="tab"
            aria-selected={index === currentSlide}
          />
        ))}
      </div>

      {/* Title */}
      <div className={styles.titleWrap}>
        <h2 className={styles.title}>{slides[currentSlide].title}</h2>
      </div>
    </div>
  );
}
