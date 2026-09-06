import React, { useEffect, useState, useRef } from 'react';

/**
 * Full-Body Anime Mascot ("Roxi")
 * Sized to match the full login/signup card height with cute flowing hair,
 * stylish cyber-kawaii outfit, real-time cursor pupil tracking,
 * shy password eye-covering paws/hands, and celebratory jumping animations.
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

  // Dynamic eye tracking: Calculate angle and intensity towards user's cursor
  useEffect(() => {
    if (mood === 'password' || mood === 'celebrate') {
      setPupilOffset({ x: 0, y: 0 });
      return;
    }

    if (!mascotRef.current) return;
    const rect = mascotRef.current.getBoundingClientRect();
    // Eye position is approximately 25% down the height of the full-body SVG
    const eyeCenterX = rect.left + rect.width * 0.5;
    const eyeCenterY = rect.top + rect.height * 0.25;

    const deltaX = cursorPos.x - eyeCenterX;
    const deltaY = cursorPos.y - eyeCenterY;
    const angle = Math.atan2(deltaY, deltaX);
    const distance = Math.min(Math.hypot(deltaX, deltaY), 400);

    // Max translation radius in pixels inside eye socket
    const maxRadius = 4.5;
    const intensity = distance / 400;
    const offsetX = Math.cos(angle) * maxRadius * intensity;
    const offsetY = Math.sin(angle) * maxRadius * intensity;

    setPupilOffset({ x: offsetX, y: offsetY });
  }, [cursorPos, mood]);

  // Natural cute blinking loop
  useEffect(() => {
    if (mood === 'password' || mood === 'celebrate') return;
    const blinkInterval = setInterval(() => {
      setIsBlinking(true);
      setTimeout(() => setIsBlinking(false), 170);
    }, 4000 + Math.random() * 2500);

    return () => clearInterval(blinkInterval);
  }, [mood]);

  const isHidingEyes = mood === 'password';
  const isCelebrating = mood === 'celebrate';

  return (
    <div
      ref={mascotRef}
      className={`anime-mascot-container full-body ${isCelebrating ? 'is-celebrating' : ''} ${isHidingEyes ? 'is-hiding' : ''}`}
      aria-hidden="true"
    >
      {/* Interactive Speech Bubble */}
      <div className={`mascot-speech-bubble ${isHidingEyes ? 'show' : ''} ${isCelebrating ? 'celebrate-show' : ''} ${focusedField && !isHidingEyes && !isCelebrating ? 'show' : ''}`}>
        {isHidingEyes && <span>🙈 Shh... No peeking! Your password is safe!</span>}
        {isCelebrating && <span>🎉 YAY! Welcome to Rollixia, {userName || 'friend'}! ✨</span>}
        {!isHidingEyes && !isCelebrating && focusedField === 'name' && (
          <span>✨ That's a beautiful name!</span>
        )}
        {!isHidingEyes && !isCelebrating && focusedField === 'email' && (
          <span>💌 Let's connect your account!</span>
        )}
        {!isHidingEyes && !isCelebrating && !focusedField && (
          <span>💖 Welcome to Rollixia!</span>
        )}
      </div>

      <svg
        className="anime-mascot-svg full-body-svg"
        viewBox="0 0 300 580"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Hair Gradient (Silky Lavender-Indigo to Rose Pink) */}
          <linearGradient id="hairGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#818cf8" />
            <stop offset="45%" stopColor="#6366f1" />
            <stop offset="85%" stopColor="#a855f7" />
            <stop offset="100%" stopColor="#ec4899" />
          </linearGradient>

          {/* Hair Highlight Sheen */}
          <linearGradient id="hairSheen" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </linearGradient>

          {/* Anime Soft Skin Tone */}
          <linearGradient id="skinGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#fff8f5" />
            <stop offset="70%" stopColor="#ffede6" />
            <stop offset="100%" stopColor="#ffdcd2" />
          </linearGradient>

          {/* Cyber Jacket Gradient */}
          <linearGradient id="jacketGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#312e81" />
            <stop offset="50%" stopColor="#1e1b4b" />
            <stop offset="100%" stopColor="#0f172a" />
          </linearGradient>

          {/* Neon Cyber Trim Gradient */}
          <linearGradient id="neonTrim" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#38bdf8" />
            <stop offset="50%" stopColor="#818cf8" />
            <stop offset="100%" stopColor="#06b6d4" />
          </linearGradient>

          {/* Eye Pupil Celestial Gradient */}
          <radialGradient id="eyePupilGrad" cx="45%" cy="40%" r="60%">
            <stop offset="0%" stopColor="#38bdf8" />
            <stop offset="35%" stopColor="#6366f1" />
            <stop offset="75%" stopColor="#312e81" />
            <stop offset="100%" stopColor="#090d16" />
          </radialGradient>

          {/* Soft Glow Filter for Floating Stars and Highlights */}
          <filter id="softAura" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="8" stdDeviation="10" floodColor="#6366f1" floodOpacity="0.3" />
          </filter>

          <filter id="starGlow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Floating Celebration Sparkles & Stars */}
        {isCelebrating && (
          <g className="mascot-stars" filter="url(#starGlow)">
            <path d="M 40 100 L 44 112 L 56 116 L 44 120 L 40 132 L 36 120 L 24 116 L 36 112 Z" fill="#fbbf24" />
            <path d="M 260 90 L 263 99 L 272 102 L 263 105 L 260 114 L 257 105 L 248 102 L 257 99 Z" fill="#ec4899" />
            <path d="M 25 240 L 28 248 L 36 250 L 28 252 L 25 260 L 22 252 L 14 250 L 22 248 Z" fill="#38bdf8" />
            <path d="M 275 250 L 278 257 L 285 259 L 278 261 L 275 268 L 272 261 L 265 259 L 272 257 Z" fill="#a855f7" />
            {/* Sweet Floating Hearts */}
            <path d="M 50 170 C 50 162, 38 160, 38 168 C 38 176, 50 184, 50 184 C 50 184, 62 176, 62 168 C 62 160, 50 162, 50 170 Z" fill="#f43f5e" opacity="0.85" />
            <path d="M 255 160 C 255 153, 245 151, 245 158 C 245 165, 255 172, 255 172 C 255 172, 265 165, 265 158 C 265 151, 255 153, 255 160 Z" fill="#f43f5e" opacity="0.85" />
          </g>
        )}

        {/* 1. BACK HAIR (Long flowing twintails behind shoulders) */}
        <g className="mascot-back-hair">
          {/* Left Twintail */}
          <path
            d="M 105 130 C 60 150, 45 220, 55 310 C 60 350, 75 365, 80 340 C 70 300, 75 230, 110 180 Z"
            fill="url(#hairGrad)"
            opacity="0.95"
          />
          {/* Left Twintail highlights */}
          <path
            d="M 68 200 C 60 240, 62 290, 72 330"
            stroke="#c084fc"
            strokeWidth="2.5"
            strokeLinecap="round"
            opacity="0.7"
          />

          {/* Right Twintail */}
          <path
            d="M 195 130 C 240 150, 255 220, 245 310 C 240 350, 225 365, 220 340 C 230 300, 225 230, 190 180 Z"
            fill="url(#hairGrad)"
            opacity="0.95"
          />
          {/* Right Twintail highlights */}
          <path
            d="M 232 200 C 240 240, 238 290, 228 330"
            stroke="#c084fc"
            strokeWidth="2.5"
            strokeLinecap="round"
            opacity="0.7"
          />
        </g>

        {/* 2. LEGS & STYLISH SNEAKERS */}
        <g className="mascot-legs">
          {/* Left Leg */}
          <path d="M 125 385 L 122 495 L 138 495 L 143 385 Z" fill="url(#skinGrad)" />
          {/* Left Thigh-high Sock */}
          <path d="M 123 420 L 121 510 L 139 510 L 141 420 Z" fill="#18181b" />
          <rect x="122" y="418" width="19" height="4" rx="2" fill="url(#neonTrim)" />

          {/* Left Sneaker/Boot */}
          <path
            d="M 112 522 C 112 506, 126 504, 140 508 L 144 532 C 144 537, 138 540, 120 540 C 112 540, 112 532, 112 522 Z"
            fill="#ffffff"
            stroke="#cbd5e1"
            strokeWidth="1.5"
          />
          <path d="M 112 534 L 144 534" stroke="url(#neonTrim)" strokeWidth="3" strokeLinecap="round" />
          <ellipse cx="128" cy="520" rx="4" ry="2" fill="#6366f1" />

          {/* Right Leg */}
          <path d="M 157 385 L 162 495 L 178 495 L 175 385 Z" fill="url(#skinGrad)" />
          {/* Right Thigh-high Sock */}
          <path d="M 159 420 L 161 510 L 179 510 L 177 420 Z" fill="#18181b" />
          <rect x="159" y="418" width="19" height="4" rx="2" fill="url(#neonTrim)" />

          {/* Right Sneaker/Boot */}
          <path
            d="M 160 508 C 174 504, 188 506, 188 522 C 188 532, 188 540, 180 540 C 162 540, 156 537, 156 532 Z"
            fill="#ffffff"
            stroke="#cbd5e1"
            strokeWidth="1.5"
          />
          <path d="M 156 534 L 188 534" stroke="url(#neonTrim)" strokeWidth="3" strokeLinecap="round" />
          <ellipse cx="172" cy="520" rx="4" ry="2" fill="#6366f1" />
        </g>

        {/* 3. PLEATED SKIRT */}
        <g className="mascot-skirt">
          <path
            d="M 120 322 Q 150 326 180 322 L 198 385 Q 150 395 102 385 Z"
            fill="#1e1b4b"
          />
          {/* Skirt Pleats */}
          <path d="M 124 324 L 118 387" stroke="#312e81" strokeWidth="2.5" />
          <path d="M 137 325 L 138 389" stroke="#312e81" strokeWidth="2.5" />
          <path d="M 150 326 L 150 390" stroke="#4338ca" strokeWidth="2.5" />
          <path d="M 163 325 L 162 389" stroke="#312e81" strokeWidth="2.5" />
          <path d="M 176 324 L 182 387" stroke="#312e81" strokeWidth="2.5" />
          {/* Glowing Skirt Rim */}
          <path d="M 103 385 Q 150 395 197 385" stroke="url(#neonTrim)" strokeWidth="2" fill="none" />
          {/* Cyber Belt */}
          <path d="M 120 322 Q 150 326 180 322" stroke="url(#neonTrim)" strokeWidth="3.5" fill="none" />
          <rect x="144" y="320" width="12" height="7" rx="2" fill="#ffffff" stroke="#6366f1" strokeWidth="1.2" />
        </g>

        {/* 4. TORSO & CYBER JACKET */}
        <g className="mascot-torso">
          {/* Neck */}
          <rect x="142" y="190" width="16" height="20" rx="4" fill="url(#skinGrad)" />
          {/* Collarbones */}
          <path d="M 143 205 Q 150 209 157 205" stroke="#fca5a5" strokeWidth="1.2" strokeLinecap="round" opacity="0.6" />

          {/* Inner Crop Top */}
          <path d="M 132 208 L 168 208 L 166 322 L 134 322 Z" fill="#ffffff" />
          {/* Cyber Top Accent */}
          <path d="M 146 220 L 154 220 L 150 230 Z" fill="#6366f1" />

          {/* Cropped Cyber Jacket (Open front) */}
          {/* Left Jacket Side */}
          <path
            d="M 116 210 C 114 240, 116 295, 134 315 L 126 315 C 110 290, 102 245, 108 210 Z"
            fill="url(#jacketGrad)"
          />
          {/* Right Jacket Side */}
          <path
            d="M 184 210 C 186 240, 184 295, 166 315 L 174 315 C 190 290, 198 245, 192 210 Z"
            fill="url(#jacketGrad)"
          />
          {/* Jacket Neon Piping */}
          <path d="M 108 210 L 134 315" stroke="url(#neonTrim)" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M 192 210 L 166 315" stroke="url(#neonTrim)" strokeWidth="2.5" strokeLinecap="round" />

          {/* Rollixia Hologram Chest Pin */}
          <circle cx="124" cy="240" r="5" fill="#38bdf8" />
          <circle cx="124" cy="240" r="2.5" fill="#ffffff" />
        </g>

        {/* 5. CUTE ANIME HEAD & FACE */}
        <g className="mascot-head" filter="url(#softAura)">
          {/* Head Base */}
          <path
            d="M 112 140 C 112 95, 188 95, 188 140 C 188 175, 165 196, 150 198 C 135 196, 112 175, 112 140 Z"
            fill="url(#skinGrad)"
            stroke="#ffd5c8"
            strokeWidth="1"
          />

          {/* Cute Rosy Blushing Cheeks */}
          <ellipse cx="128" cy="162" rx="10" ry="6" fill="#f43f5e" opacity={isHidingEyes ? 0.7 : 0.35} />
          <ellipse cx="172" cy="162" rx="10" ry="6" fill="#f43f5e" opacity={isHidingEyes ? 0.7 : 0.35} />
          {/* Anime Blush Marks (///) */}
          <path d="M 124 163 L 126 159 M 128 163 L 130 159 M 132 163 L 134 159" stroke="#f43f5e" strokeWidth="1.2" strokeLinecap="round" opacity="0.6" />
          <path d="M 168 163 L 170 159 M 172 163 L 174 159 M 176 163 L 178 159" stroke="#f43f5e" strokeWidth="1.2" strokeLinecap="round" opacity="0.6" />

          {/* Tiny Anime Nose */}
          <ellipse cx="150" cy="158" rx="1" ry="1.2" fill="#f87171" />

          {/* Cute Smiling Mouth */}
          {!isCelebrating ? (
            <path
              d="M 145 170 Q 150 175 155 170"
              stroke="#e11d48"
              strokeWidth="2"
              strokeLinecap="round"
              fill="none"
            />
          ) : (
            /* Open Joyful Anime Mouth */
            <path
              d="M 143 167 Q 150 180 157 167 Z"
              fill="#f43f5e"
              stroke="#be123c"
              strokeWidth="1.2"
            />
          )}

          {/* Expressive Anime Eyes & Eyelashes */}
          {!isHidingEyes && !isCelebrating && (
            <g className="mascot-eyes">
              {/* Left Eye Sclera */}
              <ellipse
                cx="132"
                cy="145"
                rx="12"
                ry={isBlinking ? 1 : 14}
                fill="#ffffff"
                stroke="#cbd5e1"
                strokeWidth="1"
              />
              {/* Right Eye Sclera */}
              <ellipse
                cx="168"
                cy="145"
                rx="12"
                ry={isBlinking ? 1 : 14}
                fill="#ffffff"
                stroke="#cbd5e1"
                strokeWidth="1"
              />

              {!isBlinking && (
                <>
                  {/* Left Celestial Pupil with Real-Time Cursor Tracking */}
                  <g>
                    <ellipse
                      cx={132 + pupilOffset.x}
                      cy={145 + pupilOffset.y}
                      rx="8"
                      ry="10.5"
                      fill="url(#eyePupilGrad)"
                    />
                    {/* Big sparkling primary star highlight */}
                    <circle cx={130 + pupilOffset.x} cy={141 + pupilOffset.y} r="3.2" fill="#ffffff" />
                    {/* Secondary sparkle */}
                    <circle cx={135 + pupilOffset.x} cy={149 + pupilOffset.y} r="1.6" fill="#ffffff" opacity="0.9" />
                    <circle cx={129 + pupilOffset.x} cy={151 + pupilOffset.y} r="1" fill="#38bdf8" />
                  </g>

                  {/* Right Celestial Pupil with Real-Time Cursor Tracking */}
                  <g>
                    <ellipse
                      cx={168 + pupilOffset.x}
                      cy={145 + pupilOffset.y}
                      rx="8"
                      ry="10.5"
                      fill="url(#eyePupilGrad)"
                    />
                    {/* Big sparkling primary star highlight */}
                    <circle cx={166 + pupilOffset.x} cy={141 + pupilOffset.y} r="3.2" fill="#ffffff" />
                    {/* Secondary sparkle */}
                    <circle cx={171 + pupilOffset.x} cy={149 + pupilOffset.y} r="1.6" fill="#ffffff" opacity="0.9" />
                    <circle cx={165 + pupilOffset.x} cy={151 + pupilOffset.y} r="1" fill="#38bdf8" />
                  </g>
                </>
              )}

              {/* Top Eyelashes with Anime Flick */}
              <path
                d="M 118 135 C 124 130, 138 130, 146 136 L 148 134"
                stroke="#0f172a"
                strokeWidth="3.2"
                strokeLinecap="round"
                fill="none"
              />
              <path
                d="M 182 135 C 176 130, 162 130, 154 136 L 152 134"
                stroke="#0f172a"
                strokeWidth="3.2"
                strokeLinecap="round"
                fill="none"
              />
            </g>
          )}

          {/* Happy Celebrating Eyes (Curved Anime Arcs ^_^) */}
          {isCelebrating && (
            <g className="mascot-celebrate-eyes">
              <path
                d="M 122 147 Q 132 133 142 147"
                stroke="#4338ca"
                strokeWidth="3.8"
                strokeLinecap="round"
                fill="none"
              />
              <path
                d="M 158 147 Q 168 133 178 147"
                stroke="#4338ca"
                strokeWidth="3.8"
                strokeLinecap="round"
                fill="none"
              />
            </g>
          )}

          {/* Delicate Eyebrows */}
          <path d="M 122 127 Q 132 123 142 127" stroke="#6366f1" strokeWidth="2.2" strokeLinecap="round" fill="none" />
          <path d="M 158 127 Q 168 123 178 127" stroke="#6366f1" strokeWidth="2.2" strokeLinecap="round" fill="none" />
        </g>

        {/* 6. FRONT HAIR & CUTE BANGS */}
        <g className="mascot-front-hair">
          {/* Left Side Framing Lock */}
          <path
            d="M 112 125 C 104 150, 102 180, 112 210 C 114 205, 118 175, 116 140 Z"
            fill="url(#hairGrad)"
          />
          {/* Right Side Framing Lock */}
          <path
            d="M 188 125 C 196 150, 198 180, 188 210 C 186 205, 182 175, 184 140 Z"
            fill="url(#hairGrad)"
          />

          {/* Cute Anime Bangs across forehead */}
          <path
            d="M 110 120 C 110 80, 190 80, 190 120 C 180 128, 172 135, 168 128 C 162 136, 154 138, 150 128 C 146 138, 136 136, 132 128 C 126 135, 118 132, 110 120 Z"
            fill="url(#hairGrad)"
          />

          {/* Hair Sheen & Highlights */}
          <ellipse cx="150" cy="98" rx="28" ry="5" fill="url(#hairSheen)" opacity="0.65" transform="rotate(-4 150 98)" />

          {/* Cyber Ribbon Hair Clips / Cat-ear Headset */}
          <path d="M 98 90 L 82 55 Q 106 65 116 85 Z" fill="url(#jacketGrad)" stroke="url(#neonTrim)" strokeWidth="1.5" />
          <path d="M 95 80 L 88 64 Q 100 70 106 80 Z" fill="#ec4899" opacity="0.8" />

          <path d="M 202 90 L 218 55 Q 194 65 184 85 Z" fill="url(#jacketGrad)" stroke="url(#neonTrim)" strokeWidth="1.5" />
          <path d="M 205 80 L 212 64 Q 200 70 194 80 Z" fill="#ec4899" opacity="0.8" />

          {/* Headband wire */}
          <path d="M 112 85 Q 150 74 188 85" stroke="url(#neonTrim)" strokeWidth="2.5" fill="none" />
        </g>

        {/* 7. INTERACTIVE ARMS & HANDS */}
        {/* State A: Idle / Typing Pose */}
        {!isHidingEyes && !isCelebrating && (
          <g className="mascot-arms idle-arms">
            {/* Left Arm (Relaxed at side / hand on hip) */}
            <path
              d="M 108 214 Q 92 255 96 295 L 106 295 Q 104 255 116 218 Z"
              fill="url(#jacketGrad)"
            />
            {/* Left Hand */}
            <ellipse cx="98" cy="302" rx="7" ry="6" fill="url(#skinGrad)" />

            {/* Right Arm (Gracefully gesturing towards the login form) */}
            <path
              d="M 192 214 Q 215 250 235 275 L 243 268 Q 220 245 184 218 Z"
              fill="url(#jacketGrad)"
            />
            {/* Right Hand pointing */}
            <ellipse cx="242" cy="275" rx="7" ry="6" fill="url(#skinGrad)" />
            <path d="M 244 274 L 254 270" stroke="url(#skinGrad)" strokeWidth="3" strokeLinecap="round" />
            {/* Cute magic sparkle at fingertip */}
            <circle cx="258" cy="269" r="2.5" fill="#38bdf8" />
          </g>
        )}

        {/* State B: Shy Password Mode (Hands cover eyes! "No peeking!") */}
        {isHidingEyes && (
          <g className="mascot-arms shy-arms">
            {/* Left Arm raised to face */}
            <path
              d="M 108 215 C 90 200, 100 155, 126 148 L 132 158 C 114 165, 106 195, 116 220 Z"
              fill="url(#jacketGrad)"
            />
            {/* Left Paw / Cute Gloved Hand over Left Eye */}
            <g transform="rotate(18 132 146)">
              <ellipse cx="132" cy="146" rx="14" ry="11" fill="#ffffff" stroke="#c7d2fe" strokeWidth="1.5" />
              {/* Cute Cat Paw Pads */}
              <ellipse cx="132" cy="146" rx="6" ry="5" fill="#f43f5e" opacity="0.6" />
              <circle cx="125" cy="141" r="2" fill="#f43f5e" opacity="0.6" />
              <circle cx="132" cy="139" r="2" fill="#f43f5e" opacity="0.6" />
              <circle cx="139" cy="141" r="2" fill="#f43f5e" opacity="0.6" />
            </g>

            {/* Right Arm raised to face */}
            <path
              d="M 192 215 C 210 200, 200 155, 174 148 L 168 158 C 186 165, 194 195, 184 220 Z"
              fill="url(#jacketGrad)"
            />
            {/* Right Paw / Cute Gloved Hand over Right Eye */}
            <g transform="rotate(-18 168 146)">
              <ellipse cx="168" cy="146" rx="14" ry="11" fill="#ffffff" stroke="#c7d2fe" strokeWidth="1.5" />
              {/* Cute Cat Paw Pads */}
              <ellipse cx="168" cy="146" rx="6" ry="5" fill="#f43f5e" opacity="0.6" />
              <circle cx="161" cy="141" r="2" fill="#f43f5e" opacity="0.6" />
              <circle cx="168" cy="139" r="2" fill="#f43f5e" opacity="0.6" />
              <circle cx="175" cy="141" r="2" fill="#f43f5e" opacity="0.6" />
            </g>
          </g>
        )}

        {/* State C: Celebrate Victory Pose (Both Arms Joyfully in the Air!) */}
        {isCelebrating && (
          <g className="mascot-arms celebrate-arms">
            {/* Left Arm Cheering Upwards */}
            <path
              d="M 108 214 Q 75 165 72 110 L 84 108 Q 88 160 118 216 Z"
              fill="url(#jacketGrad)"
            />
            {/* Left Hand Victory Sign */}
            <ellipse cx="73" cy="104" rx="7" ry="6" fill="url(#skinGrad)" />
            <path d="M 70 102 L 64 90 M 74 102 L 72 88" stroke="url(#skinGrad)" strokeWidth="2.5" strokeLinecap="round" />

            {/* Right Arm Cheering Upwards */}
            <path
              d="M 192 214 Q 225 165 228 110 L 216 108 Q 212 160 182 216 Z"
              fill="url(#jacketGrad)"
            />
            {/* Right Hand Victory Sign */}
            <ellipse cx="227" cy="104" rx="7" ry="6" fill="url(#skinGrad)" />
            <path d="M 224 102 L 226 88 M 230 102 L 236 90" stroke="url(#skinGrad)" strokeWidth="2.5" strokeLinecap="round" />
          </g>
        )}
      </svg>
    </div>
  );
}
