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
  { id: 3, video: "/media/samsung.mp4" },
  { id: 4, video: "/media/applelong.mp4" },
];

export default function VideoSlider() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showPlayButton, setShowPlayButton] = useState(true);
  const [progress, setProgress] = useState(0);

  // Only affects iPad Pro and below
  const [isCompact, setIsCompact] = useState(false);

  const videoRef = useRef(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const mql = window.matchMedia("(max-width: 1366px)");
    const apply = () => setIsCompact(mql.matches);

    apply();

    if (mql.addEventListener) mql.addEventListener("change", apply);
    else mql.addListener(apply);

    return () => {
      if (mql.removeEventListener) mql.removeEventListener("change", apply);
      else mql.removeListener(apply);
    };
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      const percent = video.duration
        ? (video.currentTime / video.duration) * 100
        : 0;
      setProgress(percent);
    };

    const handleEnded = () => nextSlide();
    const handlePlay = () => setShowPlayButton(false);

    video.addEventListener("timeupdate", handleTimeUpdate);
    video.addEventListener("ended", handleEnded);
    video.addEventListener("play", handlePlay);

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
      <div
        className={styles.slidesWrap}
        // ✅ Only on mobile/iPad: set a taller fixed area (no leftover blank space)
        style={
          isCompact
            ? {
                width: "100%",
                maxWidth: "100%",
                height: "clamp(320px, 78vw, 560px)", // INCREASED height for mobile
                overflow: "hidden",
              }
            : undefined
        }
      >
        {slides.map((slide, index) => {
          const isActive = index === currentSlide;
          return (
            <div
              key={slide.id}
              className={`${styles.slide} ${isActive ? styles.slideVisible : ""}`}
              role="tabpanel"
              aria-label={`Slide ${index + 1}: ${slide.title}`}
              // ✅ Ensure slide matches wrapper height on mobile
              style={isCompact ? { height: "100%" } : undefined}
            >
              <video
                ref={isActive ? videoRef : null}
                src={isActive ? slide.video : undefined}
                preload={isActive ? "auto" : "none"}
                className={`${styles.video} no-native-controls`}
                muted
                playsInline
                controls={false}
                controlsList="nodownload nofullscreen noplaybackrate"
                disablePictureInPicture
                // ✅ Fill the wrapper so no empty area appears under the video
                style={
                  isCompact
                    ? {
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        display: "block",
                      }
                    : undefined
                }
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

      <div className={styles.titleWrap}>
        <h2 className={styles.title}>{slides[currentSlide].title}</h2>
      </div>

      {/* ✅ Mobile/iPad-only fixes: remove huge white space + keep background clean */}
      <style jsx>{`
        @media (max-width: 1366px) {
          /* This is the key fix: if .slider has height/min-height in your CSS module */
          :global(.${styles.slider}) {
            height: auto !important;
            min-height: 0 !important;
            background: transparent !important;
          }

          :global(.${styles.slidesWrap}) {
            background: transparent !important;
          }

          :global(.${styles.slide}) {
            background: transparent !important;
          }

          :global(.${styles.video}) {
            background: transparent !important;
          }
        }
      `}</style>
    </div>
  );
}
