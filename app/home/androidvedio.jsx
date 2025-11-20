"use client";

import { useEffect, useRef, useState } from "react";
import { Play } from "lucide-react";
import styles from "./androidvedio.module.css";

export default function AndroidVedio({
  title = "",
  src = "/media/android.mp4", // put your file in /public/media
}) {
  const videoRef = useRef(null);
  const [showCover, setShowCover] = useState(true);     // blocks native badges until we start
  const [showPlayButton, setShowPlayButton] = useState(false); // shown only if autoplay is blocked

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;

    const onPlay = () => {
      setShowCover(false);      // hide cover once playing (prevents native badges)
      setShowPlayButton(false);
    };
    const onEnded = () => {
      try {
        v.currentTime = 0;
        v.play();               // loop-like behavior
      } catch {}
    };

    v.addEventListener("play", onPlay);
    v.addEventListener("ended", onEnded);

    // Try autoplay
    (async () => {
      try {
        await v.play();
        setShowCover(false);
        setShowPlayButton(false);
      } catch {
        // Autoplay blocked by browser — keep the cover and show our play button
        setShowCover(true);
        setShowPlayButton(true);
      }
    })();

    return () => {
      v.removeEventListener("play", onPlay);
      v.removeEventListener("ended", onEnded);
    };
  }, []);

  const handlePlayClick = () => {
    const v = videoRef.current;
    if (!v) return;
    v.play().catch(() => {
      // If still blocked, keep showing the button
      setShowCover(true);
      setShowPlayButton(true);
    });
  };

  return (
    <section className={styles.section} aria-label="Android video">
      <div className={styles.inner}>
        <div className={styles.videoWrap}>
          <video
            ref={videoRef}
            className={`${styles.video} no-native-controls`}
            src={src}
            muted           // keep muted so browsers allow autoplay
            playsInline
            // We do not render any controls; also ask browser to suppress overlays where possible:
            controls={false}
            controlsList="nodownload nofullscreen noplaybackrate"
            disablePictureInPicture
            preload="metadata"
          />
          {showCover && (
            <div className={styles.cover}>
              {showPlayButton && (
                <button
                  type="button"
                  className={styles.playButton}
                  onClick={handlePlayClick}
                  aria-label="Play video"
                >
                  <Play size={48} className={styles.playIcon} />
                </button>
              )}
            </div>
          )}
        </div>

       
      </div>
    </section>
  );
}
