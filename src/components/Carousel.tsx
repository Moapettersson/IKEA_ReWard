import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useId, useRef, useState, type KeyboardEvent } from 'react';
import styles from './Carousel.module.css';

export interface Slide {
  src: string;
  alt: string;
}

interface CarouselProps {
  label: string;
  slides: Slide[];
  width: number;
  height: number;
}

// Swipe comes from native scroll-snap, so touch, trackpad and keyboard scrolling all work.
export function Carousel({ label, slides, width, height }: CarouselProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const id = useId();

  const goTo = (next: number) => {
    const track = trackRef.current;
    if (!track) return;
    const clamped = Math.max(0, Math.min(slides.length - 1, next));
    const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    track.scrollTo?.({
      left: clamped * track.clientWidth,
      behavior: reduceMotion ? 'auto' : 'smooth',
    });
    setIndex(clamped);
  };

  const onScroll = () => {
    const track = trackRef.current;
    if (!track || track.clientWidth === 0) return;
    setIndex(Math.round(track.scrollLeft / track.clientWidth));
  };

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      goTo(index + 1);
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      goTo(index - 1);
    }
  };

  return (
    <section className={styles.carousel} aria-roledescription="carousel" aria-label={label}>
      <div
        ref={trackRef}
        id={id}
        className={styles.track}
        onScroll={onScroll}
        onKeyDown={onKeyDown}
        tabIndex={0}
        aria-label={`${label}, use the arrow keys to move between slides`}
      >
        {slides.map((slide, i) => (
          <div
            key={slide.src}
            className={styles.slide}
            role="group"
            aria-roledescription="slide"
            aria-label={`${i + 1} of ${slides.length}`}
          >
            <img
              src={slide.src}
              alt={slide.alt}
              width={width}
              height={height}
              loading={i === 0 ? 'eager' : 'lazy'}
              draggable={false}
            />
          </div>
        ))}
      </div>
      <div className={styles.controls}>
        <button
          type="button"
          className={styles.button}
          onClick={() => goTo(index - 1)}
          disabled={index === 0}
          aria-controls={id}
          aria-label="Previous slide"
        >
          <ChevronLeft size={24} strokeWidth={2} aria-hidden="true" />
        </button>
        <p className={styles.counter} aria-live="polite">
          {index + 1} / {slides.length}
        </p>
        <button
          type="button"
          className={styles.button}
          onClick={() => goTo(index + 1)}
          disabled={index === slides.length - 1}
          aria-controls={id}
          aria-label="Next slide"
        >
          <ChevronRight size={24} strokeWidth={2} aria-hidden="true" />
        </button>
      </div>
    </section>
  );
}
