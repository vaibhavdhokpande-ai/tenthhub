export default function HeroIllustration() {
  return (
    <svg viewBox="0 0 480 420" className="w-full h-auto" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Cloud */}
      <g opacity="0.9">
        <circle cx="390" cy="300" r="26" fill="white" stroke="#171717" strokeWidth="2.5" />
        <circle cx="415" cy="290" r="20" fill="white" stroke="#171717" strokeWidth="2.5" />
        <circle cx="365" cy="292" r="18" fill="white" stroke="#171717" strokeWidth="2.5" />
        <rect x="358" y="300" width="70" height="20" rx="10" fill="white" stroke="#171717" strokeWidth="2.5" />
      </g>

      {/* Stars */}
      <path d="M100 90 L108 108 L127 112 L108 116 L100 134 L92 116 L73 112 L92 108 Z" fill="#F3C548" stroke="#171717" strokeWidth="2" />
      <path d="M420 130 L425 142 L438 145 L425 148 L420 160 L415 148 L402 145 L415 142 Z" fill="#F3C548" stroke="#171717" strokeWidth="2" />
      <circle cx="330" cy="360" r="5" fill="#F0603F" />

      {/* Pencil (diagonal) */}
      <g transform="rotate(-32 240 260)">
        <rect x="130" y="240" width="230" height="46" rx="8" fill="#B9A9F0" stroke="#171717" strokeWidth="2.5" />
        <polygon points="80,263 130,240 130,286" fill="#171717" />
        <polygon points="80,263 108,251 108,275" fill="#F7F4EF" />
        <rect x="335" y="240" width="25" height="46" fill="#F0603F" stroke="#171717" strokeWidth="2.5" />
      </g>

      {/* Rider figure (simplified, sitting) */}
      <g transform="translate(230 150)">
        <circle cx="30" cy="20" r="22" fill="#F7F4EF" stroke="#171717" strokeWidth="2.5" />
        <path d="M12 12 Q10 -6 34 -2 Q46 2 40 20 Q52 8 46 26" fill="#171717" />
        <path d="M8 55 Q0 90 20 100" stroke="#171717" strokeWidth="6" strokeLinecap="round" fill="none" />
        <path d="M52 55 Q64 78 50 92" stroke="#171717" strokeWidth="6" strokeLinecap="round" fill="none" />
        <rect x="8" y="42" width="46" height="46" rx="18" fill="#F7F4EF" stroke="#171717" strokeWidth="2.5" />
        <path d="M-8 45 Q10 30 32 42" stroke="#171717" strokeWidth="6" strokeLinecap="round" fill="none" />
      </g>
    </svg>
  );
}
