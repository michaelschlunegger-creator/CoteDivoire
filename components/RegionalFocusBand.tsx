"use client";

import {useCallback, useEffect, useRef, useState} from "react";

const AUTO_ADVANCE_MS = 7000;

const countries = [
  {name: "Sierra Leone", focus: "Exploration context"},
  {name: "Liberia", focus: "Connected margin systems"},
  {name: "Côte d’Ivoire", focus: "Basin architecture"},
  {name: "Ghana", focus: "Data maturity"},
  {name: "Togo", focus: "Regional continuity"},
  {name: "Benin", focus: "Margin connections"},
  {name: "Nigeria", focus: "Regional synthesis"},
] as const;

export function RegionalFocusBand() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [manualPause, setManualPause] = useState(false);
  const [focusWithin, setFocusWithin] = useState(false);
  const [pointerActive, setPointerActive] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const countryButtons = useRef<Array<HTMLButtonElement | null>>([]);

  const selectCountry = useCallback((index: number, moveFocus = false) => {
    const nextIndex = (index + countries.length) % countries.length;
    setActiveIndex(nextIndex);

    window.requestAnimationFrame(() => {
      const button = countryButtons.current[nextIndex];
      button?.scrollIntoView({behavior: "smooth", block: "nearest", inline: "center"});
      if (moveFocus) button?.focus({preventScroll: true});
    });
  }, []);

  const autoplayPaused = manualPause || focusWithin || pointerActive || prefersReducedMotion;

  useEffect(() => {
    const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updateMotionPreference = () => setPrefersReducedMotion(motionPreference.matches);
    updateMotionPreference();
    motionPreference.addEventListener("change", updateMotionPreference);
    return () => motionPreference.removeEventListener("change", updateMotionPreference);
  }, []);

  useEffect(() => {
    if (autoplayPaused) return;
    const timer = window.setTimeout(() => selectCountry(activeIndex + 1), AUTO_ADVANCE_MS);
    return () => window.clearTimeout(timer);
  }, [activeIndex, autoplayPaused, selectCountry]);

  const activeCountry = countries[activeIndex];

  return (
    <section
      className={`regional-focus-band${autoplayPaused ? " is-paused" : ""}`}
      aria-labelledby="regional-focus-title"
      onFocusCapture={() => setFocusWithin(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setFocusWithin(false);
      }}
      onPointerDown={() => setPointerActive(true)}
      onPointerUp={() => setPointerActive(false)}
      onPointerCancel={() => setPointerActive(false)}
    >
      <div className="regional-focus-heading">
        <div>
          <span className="regional-focus-kicker"><i aria-hidden="true"/> Regional focus</span>
          <h2 id="regional-focus-title">Connected transform-margin systems</h2>
        </div>
        <div className="regional-focus-controls" aria-label="Regional focus carousel controls">
          <button type="button" onClick={() => selectCountry(activeIndex - 1)} aria-label="Previous country">←</button>
          <span aria-hidden="true">{String(activeIndex + 1).padStart(2, "0")} / {String(countries.length).padStart(2, "0")}</span>
          <button
            className="regional-autoplay-toggle"
            type="button"
            aria-label={manualPause ? "Resume automatic country rotation" : "Pause automatic country rotation"}
            aria-pressed={manualPause}
            onClick={(event) => {
              const nextPauseState = !manualPause;
              setManualPause(nextPauseState);
              if (!nextPauseState) event.currentTarget.blur();
            }}
          >
            <span aria-hidden="true">{manualPause ? "▶" : "Ⅱ"}</span>
          </button>
          <button type="button" onClick={() => selectCountry(activeIndex + 1)} aria-label="Next country">→</button>
        </div>
      </div>

      <div className="regional-focus-viewport" role="tablist" aria-label="Seven-country regional focus">
        <div className="regional-focus-track">
          {countries.map((country, index) => (
            <button
              key={country.name}
              ref={(button) => {countryButtons.current[index] = button;}}
              id={`regional-focus-tab-${index}`}
              className={`regional-country${index === activeIndex ? " active" : ""}`}
              type="button"
              role="tab"
              aria-selected={index === activeIndex}
              aria-controls="regional-focus-panel"
              tabIndex={index === activeIndex ? 0 : -1}
              onClick={() => selectCountry(index)}
              onKeyDown={(event) => {
                if (event.key === "ArrowRight") {
                  event.preventDefault();
                  selectCountry(index + 1, true);
                } else if (event.key === "ArrowLeft") {
                  event.preventDefault();
                  selectCountry(index - 1, true);
                } else if (event.key === "Home") {
                  event.preventDefault();
                  selectCountry(0, true);
                } else if (event.key === "End") {
                  event.preventDefault();
                  selectCountry(countries.length - 1, true);
                }
              }}
            >
              <span>{String(index + 1).padStart(2, "0")}</span>
              <strong>{country.name}</strong>
            </button>
          ))}
        </div>
      </div>

      <div
        key={activeCountry.name}
        id="regional-focus-panel"
        className="regional-focus-detail"
        role="tabpanel"
        aria-labelledby={`regional-focus-tab-${activeIndex}`}
      >
        <span>{activeCountry.name}</span>
        <i aria-hidden="true"/>
        <strong>{activeCountry.focus}</strong>
        <small>Atlantic-margin perspective</small>
      </div>
      <div className="regional-focus-progress" aria-hidden="true"><i key={activeIndex}/></div>
    </section>
  );
}
