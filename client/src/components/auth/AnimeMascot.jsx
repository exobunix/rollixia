import React, { useEffect, useState, useRef } from 'react';

/**
 * AnimeMascot ("Roxi")
 * Interactive chibi anime mascot with real-time cursor pupil tracking,
 * password-hiding shy paws, and celebratory victory animations.
 */
export default function AnimeMascot({
  cursorPos = { x: 0, y: 0 },
  mood = 'idle', // 'idle' | 'typing' | 'password' | 'celebrate'
  focusedField = null,
  userName = ''
}) {
  const mascotRef = useRef(null);
  const [pupilOffset, setPupilOffset] = useState({ x: 0, y: 0 });
  const [isBlinking, setIsBlinking] = useState(false);

  // Eye tracking calculation
  useEffect(() => {
    if (mood === 'password' || mood === 'celebrate') {
      setPupilOffset({ x: 0, y: 0 });
      return;
    }

    if (!mascotRef.current) return;
    const rect = mascotRef.current.getBoundingClientRect();
    const eyeCenterX = rect.left + rect.width / 2;
    const eyeCenterY = rect.top + rect.height * 0.42;

    const deltaX = cursorPos.x - eyeCenterX;
    const deltaY = cursorPos.y - eyeCenterY;
    const angle = Math.atan2(deltaY, deltaX);
    const distance = Math.min(Math.hypot(deltaX, deltaY), 300);

    // Max translation radius in pixels
    const maxRadius = 4.5;
    const intensity = distance / 300;
    const offsetX = Math.cos(angle) * maxRadius * intensity;
    const offsetY = Math.sin(angle) * maxRadius * intensity;

    setPupilOffset({ x: offsetX, y: offsetY });
  }, [cursorPos, mood]);

  // Periodic cute natural blink
  useEffect(() => {
    if (mood === 'password' || mood === 'celebrate') return;
    const blinkInterval = setInterval(() => {
      setIsBlinking(true);
      setTimeout(() => setIsBlinking(false), 160);
    }, 4500 + Math.random() * 2000);

    return () => clearInterval(blinkInterval);
  }, [mood]);

  const isHidingEyes = mood === 'password';
  const isCelebrating = mood === 'celebrate';

  return (
    <div
      ref={mascotRef}
      className={`anime-mascot-container ${isCelebrating ? 'is-celebrating' : ''} ${isHidingEyes ? 'is-hiding' : ''}`}
      aria-hidden="true"
    >
      {/* Speech Bubble / Floating Reaction Badge */}
      <div className={`mascot-speech-bubble ${isHidingEyes ? 'show' : ''} ${isCelebrating ? 'celebrate-show' : ''}`}>
        {isHidingEyes && <span>🙈 Shh... No peeking!</span>}
        {isCelebrating && <span>🎉 Yay! Welcome aboard!</span>}
        {!isHidingEyes && !isCelebrating && focusedField && (
          <span>✨ Looking good!</span>
        )}
      </div>

      <svg
        className="anime-mascot-svg"
        viewBox="0 0 140 140"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Cyber-glow Gradients */}
          <linearGradient id="mascotEarGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#818cf8" />
            <stop offset="50%" stopColor="#6366f1" />
            <stop offset="100%" stopColor="#c084fc" />
          </linearGradient>

          <linearGradient id="mascotFaceGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="100%" stopColor="#f1f5f9" />
          </linearGradient>

          <radialGradient id="mascotPupilGrad" cx="40%" cy="40%" r="60%">
            <stop offset="0%" stopColor="#38bdf8" />
            <stop offset="50%" stopColor="#4f46e5" />
            <stop offset="100%" stopColor="#1e1b4b" />
          </radialGradient>

          <filter id="mascotSoftGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor="#6366f1" floodOpacity="0.35" />
          </filter>
        </defs>

        {/* Floating Sparkles for celebration */}
        {isCelebrating && (
          <g className="mascot-stars">
            <path d="M 25 25 L 28 32 L 35 35 L 28 38 L 25 45 L 22 38 L 15 35 L 22 32 Z" fill="#fbbf24" />
            <path d="M 115 20 L 117 25 L 122 27 L 117 29 L 115 34 L 113 29 L 108 27 L 113 25 Z" fill="#ec4899" />
            <path d="M 120 75 L 122 79 L 126 81 L 122 83 L 120 87 L 118 83 L 114 81 L 118 79 Z" fill="#38bdf8" />
          </g>
        )}

        {/* 1. Cyber Cat/Robot Ears */}
        <g className="mascot-ears">
          {/* Left Ear */}
          <path
            d="M 36 50 L 18 18 Q 38 25 48 38 Z"
            fill="url(#mascotEarGrad)"
            stroke="rgba(255,255,255,0.7)"
            strokeWidth="1.5"
          />
          <path d="M 33 42 L 23 23 Q 35 28 42 36 Z" fill="#f43f5e" opacity="0.4" />

          {/* Right Ear */}
          <path
            d="M 104 50 L 122 18 Q 102 25 92 38 Z"
            fill="url(#mascotEarGrad)"
            stroke="rgba(255,255,255,0.7)"
            strokeWidth="1.5"
          />
          <path d="M 107 42 L 117 23 Q 105 28 98 36 Z" fill="#f43f5e" opacity="0.4" />
        </g>

        {/* 2. Head Shape with Soft Shadow */}
        <ellipse
          cx="70"
          cy="72"
          rx="46"
          ry="40"
          fill="url(#mascotFaceGrad)"
          stroke="rgba(255, 255, 255, 0.85)"
          strokeWidth="2"
          filter="url(#mascotSoftGlow)"
        />

        {/* 3. Hair Strands / Cyber Antenna */}
        <path
          d="M 66 32 Q 70 20 78 22 Q 72 26 73 33 Z"
          fill="#818cf8"
        />

        {/* 4. Cute Blush Cheeks */}
        <ellipse cx="40" cy="82" rx="7" ry="4" fill="#f43f5e" opacity={isHidingEyes ? 0.75 : 0.35} />
        <ellipse cx="100" cy="82" rx="7" ry="4" fill="#f43f5e" opacity={isHidingEyes ? 0.75 : 0.35} />

        {/* 5. Eyes & Pupils Tracking */}
        {!isHidingEyes && !isCelebrating && (
          <g className="mascot-eyes">
            {/* Left Eye Sclera */}
            <ellipse cx="48" cy="68" rx="10" ry={isBlinking ? 1 : 12} fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" />
            {/* Right Eye Sclera */}
            <ellipse cx="92" cy="68" rx="10" ry={isBlinking ? 1 : 12} fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" />

            {!isBlinking && (
              <>
                {/* Left Pupil with tracking offset */}
                <ellipse
                  cx={48 + pupilOffset.x}
                  cy={68 + pupilOffset.y}
                  rx="6.5"
                  ry="8"
                  fill="url(#mascotPupilGrad)"
                />
                <circle cx={46 + pupilOffset.x} cy={65 + pupilOffset.y} r="2.5" fill="#ffffff" />
                <circle cx={50 + pupilOffset.x} cy={71 + pupilOffset.y} r="1.2" fill="#ffffff" opacity="0.8" />

                {/* Right Pupil with tracking offset */}
                <ellipse
                  cx={92 + pupilOffset.x}
                  cy={68 + pupilOffset.y}
                  rx="6.5"
                  ry="8"
                  fill="url(#mascotPupilGrad)"
                />
                <circle cx={90 + pupilOffset.x} cy={65 + pupilOffset.y} r="2.5" fill="#ffffff" />
                <circle cx={94 + pupilOffset.x} cy={71 + pupilOffset.y} r="1.2" fill="#ffffff" opacity="0.8" />
              </>
            )}

            {/* Eyelashes */}
            <path d="M 38 58 Q 48 54 58 59" stroke="#1e293b" strokeWidth="2.2" strokeLinecap="round" fill="none" />
            <path d="M 82 59 Q 92 54 102 58" stroke="#1e293b" strokeWidth="2.2" strokeLinecap="round" fill="none" />
          </g>
        )}

        {/* Celebrating Happy Eyes (Curved Arc ^_^) */}
        {isCelebrating && (
          <g className="mascot-celebrate-eyes">
            <path d="M 39 70 Q 48 58 57 70" stroke="#4f46e5" strokeWidth="3" strokeLinecap="round" fill="none" />
            <path d="M 83 70 Q 92 58 101 70" stroke="#4f46e5" strokeWidth="3" strokeLinecap="round" fill="none" />
          </g>
        )}

        {/* 6. Cute Mouth */}
        {!isCelebrating ? (
          <path
            d="M 66 84 Q 70 87 74 84"
            stroke="#475569"
            strokeWidth="2"
            strokeLinecap="round"
            fill="none"
          />
        ) : (
          <path
            d="M 64 82 Q 70 94 76 82 Z"
            fill="#f43f5e"
          />
        )}

        {/* 7. Cute Anime Paws / Hands covering eyes during Password entry */}
        <g className={`mascot-paws ${isHidingEyes ? 'paws-up' : 'paws-down'}`}>
          {/* Left Paw */}
          <ellipse
            cx={isHidingEyes ? 48 : 42}
            cy={isHidingEyes ? 68 : 108}
            rx="12"
            ry="10"
            fill="#ffffff"
            stroke="#cbd5e1"
            strokeWidth="1.5"
            transform={isHidingEyes ? 'rotate(15 48 68)' : ''}
          />
          {/* Paw pads */}
          <circle cx={isHidingEyes ? 48 : 42} cy={isHidingEyes ? 68 : 108} r="4" fill="#f43f5e" opacity="0.45" />

          {/* Right Paw */}
          <ellipse
            cx={isHidingEyes ? 92 : 98}
            cy={isHidingEyes ? 68 : 108}
            rx="12"
            ry="10"
            fill="#ffffff"
            stroke="#cbd5e1"
            strokeWidth="1.5"
            transform={isHidingEyes ? 'rotate(-15 92 68)' : ''}
          />
          {/* Paw pads */}
          <circle cx={isHidingEyes ? 92 : 98} cy={isHidingEyes ? 68 : 108} r="4" fill="#f43f5e" opacity="0.45" />
        </g>
      </svg>
    </div>
  );
}
