import { useState, useEffect } from 'react';
import { getEraKey, ERA_DATA } from '../../data/eraData';

export default function YearControl({ currentYear, onYearChange }) {
  const [inputValue, setInputValue] = useState(String(currentYear));
  const [sliderValue, setSliderValue] = useState(Math.max(1, currentYear));

  useEffect(() => {
    setInputValue(String(currentYear));
    setSliderValue(Math.max(1, currentYear));
  }, [currentYear]);

  function commitYear(value) {
    const year = Math.max(-3000, Math.min(2024, parseInt(value) || 1945));
    onYearChange(year);
  }

  const parsedInput = parseInt(inputValue);
  const eraKey = !isNaN(parsedInput) ? getEraKey(parsedInput) : getEraKey(currentYear);
  const eraLabel = ERA_DATA[eraKey]?.label ?? '';

  return (
    <div>
      <div className="section-label">Navigate Time</div>
      <div className="year-block">
        <input
          type="number"
          className="year-input"
          placeholder="Enter year…"
          min="-3000"
          max="2024"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') commitYear(e.target.value); }}
          onBlur={(e) => commitYear(e.target.value)}
        />
        <div className="era-label">{eraLabel}</div>
      </div>
      <input
        type="range"
        className="year-slider"
        min="1"
        max="2024"
        value={sliderValue}
        onInput={(e) => {
          const y = parseInt(e.target.value);
          setSliderValue(y);
          setInputValue(String(y));
        }}
        onChange={(e) => commitYear(e.target.value)}
      />
      <div className="slider-labels">
        <span>1 AD</span><span>500</span><span>1000</span><span>1500</span><span>2024</span>
      </div>
    </div>
  );
}
