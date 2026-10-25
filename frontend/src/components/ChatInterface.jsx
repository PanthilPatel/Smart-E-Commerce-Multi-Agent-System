import React, { useState, useEffect, useRef } from 'react';
import { 
    Search, 
    Sparkles, 
    Mic, 
    Command, 
    ArrowUpRight, 
    Zap, 
    Sliders,
    Headphones,
    Laptop,
    Smartphone,
    Watch,
    Tv,
    Gamepad2,
    Star,
    ExternalLink,
    ShieldCheck,
    CheckCircle2,
    Tag,
    TrendingDown,
    Truck,
    CreditCard,
    RotateCw,
    Calendar,
    Clock
} from 'lucide-react';
import { useMagneticButton } from '../hooks/useMotionPhysics';

const SONY_XM5_STUDIO_SVG = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 320" width="100%" height="100%">
  <defs>
    <radialGradient id="sony-shadow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="rgba(0,0,0,0.22)"/>
      <stop offset="100%" stop-color="rgba(0,0,0,0)"/>
    </radialGradient>
    <linearGradient id="sony-headband" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#1A1A1D"/>
      <stop offset="25%" stop-color="#303036"/>
      <stop offset="50%" stop-color="#4A4A52"/>
      <stop offset="75%" stop-color="#303036"/>
      <stop offset="100%" stop-color="#1A1A1D"/>
    </linearGradient>
    <linearGradient id="sony-cup-left" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#3A3A40"/>
      <stop offset="50%" stop-color="#222226"/>
      <stop offset="100%" stop-color="#121214"/>
    </linearGradient>
    <linearGradient id="sony-cup-right" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#3A3A40"/>
      <stop offset="50%" stop-color="#222226"/>
      <stop offset="100%" stop-color="#121214"/>
    </linearGradient>
    <linearGradient id="sony-cushion" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#25252A"/>
      <stop offset="100%" stop-color="#0E0E10"/>
    </linearGradient>
    <linearGradient id="sony-gold" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#F5E6B3"/>
      <stop offset="50%" stop-color="#E5C878"/>
      <stop offset="100%" stop-color="#C9A449"/>
    </linearGradient>
  </defs>
  <ellipse cx="200" cy="275" rx="115" ry="16" fill="url(#sony-shadow)"/>
  <path d="M 125 178 C 120 68, 280 68, 275 178" fill="none" stroke="url(#sony-headband)" stroke-width="18" stroke-linecap="round"/>
  <path d="M 130 168 C 135 85, 265 85, 270 168" fill="none" stroke="#5E5E68" stroke-width="2" stroke-linecap="round" opacity="0.7"/>
  <path d="M 140 158 C 145 92, 255 92, 260 158" fill="none" stroke="#121214" stroke-width="12" stroke-linecap="round"/>
  <rect x="117" y="148" width="8" height="34" rx="4" fill="#3D3D44"/>
  <circle cx="121" cy="180" r="3" fill="url(#sony-gold)"/>
  <rect x="275" y="148" width="8" height="34" rx="4" fill="#3D3D44"/>
  <circle cx="279" cy="180" r="3" fill="url(#sony-gold)"/>
  <g transform="rotate(8, 120, 205)">
    <ellipse cx="118" cy="205" rx="28" ry="46" fill="url(#sony-cushion)" stroke="#2B2B30" stroke-width="2"/>
    <ellipse cx="126" cy="205" rx="22" ry="42" fill="url(#sony-cup-left)"/>
    <ellipse cx="127" cy="205" rx="18" ry="38" fill="none" stroke="rgba(255,255,255,0.18)" stroke-width="1.5"/>
    <circle cx="132" cy="192" r="3.5" fill="none" stroke="url(#sony-gold)" stroke-width="1.5"/>
    <circle cx="132" cy="192" r="1.5" fill="#000"/>
  </g>
  <g transform="rotate(-8, 280, 205)">
    <ellipse cx="282" cy="205" rx="28" ry="46" fill="url(#sony-cushion)" stroke="#2B2B30" stroke-width="2"/>
    <ellipse cx="274" cy="205" rx="22" ry="42" fill="url(#sony-cup-right)"/>
    <ellipse cx="273" cy="205" rx="18" ry="38" fill="none" stroke="rgba(255,255,255,0.18)" stroke-width="1.5"/>
    <circle cx="268" cy="192" r="3.5" fill="none" stroke="url(#sony-gold)" stroke-width="1.5"/>
    <circle cx="268" cy="192" r="1.5" fill="#000"/>
  </g>
  <text x="200" y="295" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="11" font-weight="700" letter-spacing="3" fill="#2D2D32" text-anchor="middle">SONY WH-1000XM5</text>
  <text x="200" y="310" font-family="monospace" font-size="9" font-weight="600" fill="#997A2E" text-anchor="middle">ACTIVE NOISE CANCELLATION · 30H BATTERY</text>
</svg>
`)}`;

const IPHONE_16_PRO_STUDIO_SVG = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 320" width="100%" height="100%">
  <defs>
    <radialGradient id="iphone-shadow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="rgba(0,0,0,0.25)"/>
      <stop offset="100%" stop-color="rgba(0,0,0,0)"/>
    </radialGradient>
    <linearGradient id="titanium-frame" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#E2DDD2"/>
      <stop offset="30%" stop-color="#C5BCAD"/>
      <stop offset="70%" stop-color="#938A7A"/>
      <stop offset="100%" stop-color="#D4CCC0"/>
    </linearGradient>
    <linearGradient id="titanium-back" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#C5BCAD"/>
      <stop offset="50%" stop-color="#A59B8B"/>
      <stop offset="100%" stop-color="#847B6B"/>
    </linearGradient>
    <linearGradient id="iphone-screen" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#121824"/>
      <stop offset="40%" stop-color="#1E293B"/>
      <stop offset="80%" stop-color="#0F172A"/>
      <stop offset="100%" stop-color="#020617"/>
    </linearGradient>
    <linearGradient id="screen-glow" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#F5E6B3" stop-opacity="0.7"/>
      <stop offset="50%" stop-color="#93C5FD" stop-opacity="0.35"/>
      <stop offset="100%" stop-color="#C084FC" stop-opacity="0.15"/>
    </linearGradient>
    <radialGradient id="lens-glint" cx="30%" cy="30%" r="70%">
      <stop offset="0%" stop-color="#38BDF8"/>
      <stop offset="35%" stop-color="#0F172A"/>
      <stop offset="100%" stop-color="#020617"/>
    </radialGradient>
  </defs>
  <ellipse cx="200" cy="278" rx="110" ry="15" fill="url(#iphone-shadow)"/>
  <g transform="translate(130, 42)">
    <rect x="0" y="0" width="108" height="215" rx="22" fill="url(#titanium-frame)" stroke="#524C42" stroke-width="1.5"/>
    <rect x="2.5" y="2.5" width="103" height="210" rx="19.5" fill="url(#titanium-back)"/>
    <rect x="8" y="10" width="48" height="52" rx="14" fill="#999081" stroke="#BAAF9F" stroke-width="1.5"/>
    <circle cx="23" cy="24" r="10" fill="#1C1B1F" stroke="#DDD5C7" stroke-width="2"/>
    <circle cx="23" cy="24" r="7.5" fill="url(#lens-glint)"/>
    <circle cx="21" cy="22" r="2.5" fill="#FFF" opacity="0.9"/>
    <circle cx="23" cy="48" r="10" fill="#1C1B1F" stroke="#DDD5C7" stroke-width="2"/>
    <circle cx="23" cy="48" r="7.5" fill="url(#lens-glint)"/>
    <circle cx="21" cy="46" r="2.5" fill="#FFF" opacity="0.9"/>
    <circle cx="44" cy="36" r="10" fill="#1C1B1F" stroke="#DDD5C7" stroke-width="2"/>
    <circle cx="44" cy="36" r="7.5" fill="url(#lens-glint)"/>
    <circle cx="42" cy="34" r="2.5" fill="#FFF" opacity="0.9"/>
    <circle cx="44" cy="18" r="3.5" fill="#FDE047" opacity="0.9"/>
    <circle cx="44" cy="52" r="3" fill="#111" stroke="#666" stroke-width="0.5"/>
  </g>
  <g transform="translate(162, 32)">
    <rect x="0" y="0" width="112" height="225" rx="24" fill="url(#titanium-frame)" stroke="#FFF" stroke-width="0.5"/>
    <rect x="2.5" y="2.5" width="107" height="220" rx="21.5" fill="#050505"/>
    <rect x="4.5" y="4.5" width="103" height="216" rx="19.5" fill="url(#iphone-screen)"/>
    <path d="M 4.5 90 Q 50 140, 107.5 70 L 107.5 220.5 L 4.5 220.5 Z" fill="url(#screen-glow)"/>
    <circle cx="56" cy="130" r="32" fill="none" stroke="rgba(245,230,179,0.3)" stroke-width="1.5"/>
    <rect x="39" y="11" width="34" height="10" rx="5" fill="#000"/>
    <circle cx="64" cy="16" r="2" fill="#0B132B"/>
    <circle cx="48" cy="16" r="1.5" fill="#020617"/>
    <rect x="36" y="214" width="40" height="2.5" rx="1.25" fill="rgba(255,255,255,0.7)"/>
  </g>
  <text x="200" y="295" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="11" font-weight="700" letter-spacing="3" fill="#423E37" text-anchor="middle">IPHONE 16 PRO</text>
  <text x="200" y="310" font-family="monospace" font-size="9" font-weight="600" fill="#997A2E" text-anchor="middle">A18 PRO CHIP · NATURAL TITANIUM</text>
</svg>
`)}`;

const MACBOOK_M3_STUDIO_SVG = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 320" width="100%" height="100%">
  <defs>
    <radialGradient id="mac-shadow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="rgba(0,0,0,0.25)"/>
      <stop offset="100%" stop-color="rgba(0,0,0,0)"/>
    </radialGradient>
    <linearGradient id="mac-lid" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#4B4E5A"/>
      <stop offset="50%" stop-color="#2D3039"/>
      <stop offset="100%" stop-color="#1B1D23"/>
    </linearGradient>
    <linearGradient id="mac-base" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#555966"/>
      <stop offset="40%" stop-color="#343842"/>
      <stop offset="100%" stop-color="#1F2128"/>
    </linearGradient>
    <linearGradient id="mac-screen" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#020617"/>
      <stop offset="40%" stop-color="#1E1B4B"/>
      <stop offset="70%" stop-color="#4C1D95"/>
      <stop offset="100%" stop-color="#0F172A"/>
    </linearGradient>
    <linearGradient id="mac-art" x1="0%" y1="100%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#F5E6B3" stop-opacity="0.85"/>
      <stop offset="50%" stop-color="#E5C878" stop-opacity="0.45"/>
      <stop offset="100%" stop-color="#38BDF8" stop-opacity="0.25"/>
    </linearGradient>
  </defs>
  <ellipse cx="200" cy="272" rx="135" ry="18" fill="url(#mac-shadow)"/>
  <g transform="translate(80, 50)">
    <rect x="0" y="0" width="240" height="155" rx="10" fill="url(#mac-lid)" stroke="#6A6F7E" stroke-width="1.5"/>
    <rect x="4" y="4" width="232" height="147" rx="7" fill="#000"/>
    <rect x="7" y="7" width="226" height="141" rx="5" fill="url(#mac-screen)"/>
    <path d="M 7 100 Q 80 40, 150 110 T 233 80 L 233 148 L 7 148 Z" fill="url(#mac-art)"/>
    <path d="M 110 7 L 130 7 L 128 14 Q 128 17, 125 17 L 115 17 Q 112 17, 112 14 Z" fill="#000"/>
    <circle cx="120" cy="11.5" r="1.5" fill="#1E293B"/>
    <circle cx="123" cy="11.5" r="0.6" fill="#10B981"/>
  </g>
  <g transform="translate(50, 201)">
    <path d="M 28 0 L 272 0 L 296 46 Q 298 50, 290 50 L 10 50 Q 2 50, 4 46 Z" fill="url(#mac-base)" stroke="#747A8C" stroke-width="1.2"/>
    <path d="M 52 5 L 248 5 L 244 26 L 56 26 Z" fill="#121317" stroke="#25272F" stroke-width="0.8"/>
    <g fill="#20222A">
      <rect x="60" y="7" width="180" height="3" rx="1"/>
      <rect x="59" y="11.5" width="182" height="3" rx="1"/>
      <rect x="58" y="16" width="184" height="3" rx="1"/>
      <rect x="57" y="20.5" width="186" height="3.5" rx="1"/>
    </g>
    <rect x="120" y="29" width="60" height="18" rx="2" fill="#252730" stroke="#3A3D47" stroke-width="0.8"/>
    <rect x="85" y="0" width="130" height="3.5" rx="1.5" fill="#0A0B0E"/>
    <rect x="135" y="47" width="30" height="2" rx="1" fill="#525764"/>
  </g>
  <text x="200" y="295" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="11" font-weight="700" letter-spacing="3" fill="#3D404A" text-anchor="middle">MACBOOK AIR M3</text>
  <text x="200" y="310" font-family="monospace" font-size="9" font-weight="600" fill="#997A2E" text-anchor="middle">13.6-INCH LIQUID RETINA · 16GB · 512GB</text>
</svg>
`)}`;

const S24_ULTRA_STUDIO_SVG = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 320" width="100%" height="100%">
  <defs>
    <radialGradient id="s24-shadow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="rgba(0,0,0,0.25)"/>
      <stop offset="100%" stop-color="rgba(0,0,0,0)"/>
    </radialGradient>
    <linearGradient id="s24-frame" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#B0B0B0"/>
      <stop offset="30%" stop-color="#848484"/>
      <stop offset="70%" stop-color="#5E5E5E"/>
      <stop offset="100%" stop-color="#999999"/>
    </linearGradient>
    <linearGradient id="s24-back" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#73767D"/>
      <stop offset="50%" stop-color="#53565C"/>
      <stop offset="100%" stop-color="#37393D"/>
    </linearGradient>
    <linearGradient id="s24-screen" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0A0F1D"/>
      <stop offset="50%" stop-color="#141C30"/>
      <stop offset="100%" stop-color="#070A14"/>
    </linearGradient>
    <linearGradient id="galaxy-ring" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#E2E8F0"/>
      <stop offset="100%" stop-color="#64748B"/>
    </linearGradient>
  </defs>
  <ellipse cx="200" cy="280" rx="110" ry="15" fill="url(#s24-shadow)"/>
  <g transform="translate(132, 40)">
    <rect x="0" y="0" width="105" height="224" rx="10" fill="url(#s24-frame)" stroke="#222" stroke-width="1.5"/>
    <rect x="2" y="2" width="101" height="220" rx="8" fill="url(#s24-back)"/>
    <circle cx="24" cy="28" r="11" fill="#15171C" stroke="url(#galaxy-ring)" stroke-width="2.5"/>
    <circle cx="24" cy="28" r="7.5" fill="#0B132B"/>
    <circle cx="22" cy="26" r="2.5" fill="#38BDF8" opacity="0.9"/>
    <circle cx="24" cy="58" r="11" fill="#15171C" stroke="url(#galaxy-ring)" stroke-width="2.5"/>
    <circle cx="24" cy="58" r="7.5" fill="#0B132B"/>
    <circle cx="22" cy="56" r="2.5" fill="#38BDF8" opacity="0.9"/>
    <circle cx="24" cy="88" r="11" fill="#15171C" stroke="url(#galaxy-ring)" stroke-width="2.5"/>
    <rect x="19" y="83" width="10" height="10" rx="2" fill="#0A0F1D"/>
    <circle cx="48" cy="28" r="5" fill="#1F2937" stroke="#4B5563" stroke-width="1.5"/>
    <circle cx="48" cy="44" r="3.5" fill="#FEF08A" opacity="0.9"/>
    <circle cx="48" cy="62" r="7.5" fill="#15171C" stroke="url(#galaxy-ring)" stroke-width="2"/>
  </g>
  <g transform="translate(164, 32)">
    <rect x="0" y="0" width="108" height="228" rx="10" fill="url(#s24-frame)" stroke="#FFF" stroke-width="0.5"/>
    <rect x="2.5" y="2.5" width="103" height="223" rx="8" fill="#030303"/>
    <rect x="4.5" y="4.5" width="99" height="219" rx="6" fill="url(#s24-screen)"/>
    <polygon points="4.5,4.5 103.5,4.5 103.5,120 4.5,180" fill="rgba(230,199,98,0.08)"/>
    <circle cx="54" cy="115" r="35" fill="none" stroke="rgba(245,230,179,0.3)" stroke-width="2"/>
    <circle cx="54" cy="115" r="22" fill="none" stroke="#E5C878" stroke-width="1.5" stroke-dasharray="6 4"/>
    <circle cx="54" cy="14" r="3" fill="#000"/>
    <circle cx="54" cy="14" r="1.2" fill="#0F172A"/>
    <rect x="91" y="222" width="7" height="3" rx="1" fill="#71717A"/>
  </g>
  <text x="200" y="295" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="11" font-weight="700" letter-spacing="3" fill="#4B4D54" text-anchor="middle">GALAXY S24 ULTRA</text>
  <text x="200" y="310" font-family="monospace" font-size="9" font-weight="600" fill="#997A2E" text-anchor="middle">200MP QUAD CAM · SNAPDRAGON 8 GEN 3</text>
</svg>
`)}`;

const ONEPLUS_12_STUDIO_SVG = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 320" width="100%" height="100%">
  <defs>
    <radialGradient id="op-shadow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="rgba(0,0,0,0.25)"/>
      <stop offset="100%" stop-color="rgba(0,0,0,0)"/>
    </radialGradient>
    <linearGradient id="op-emerald" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#14532D"/>
      <stop offset="50%" stop-color="#064E3B"/>
      <stop offset="100%" stop-color="#022C22"/>
    </linearGradient>
  </defs>
  <ellipse cx="200" cy="280" rx="110" ry="15" fill="url(#op-shadow)"/>
  <g transform="translate(136, 42)">
    <rect x="0" y="0" width="102" height="220" rx="16" fill="#042F24" stroke="#059669" stroke-width="1.5"/>
    <rect x="2.5" y="2.5" width="97" height="215" rx="14" fill="url(#op-emerald)"/>
    <circle cx="48" cy="62" r="34" fill="#0B382C" stroke="#10B981" stroke-width="2"/>
    <circle cx="48" cy="62" r="28" fill="#022C22" stroke="#047857" stroke-width="1.5"/>
    <circle cx="36" cy="50" r="10" fill="#000" stroke="#059669" stroke-width="1.5"/>
    <circle cx="60" cy="50" r="10" fill="#000" stroke="#059669" stroke-width="1.5"/>
    <circle cx="48" cy="74" r="10" fill="#000" stroke="#059669" stroke-width="1.5"/>
    <circle cx="35" cy="49" r="3" fill="#34D399" opacity="0.8"/>
    <circle cx="59" cy="49" r="3" fill="#34D399" opacity="0.8"/>
  </g>
  <text x="200" y="295" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="11" font-weight="700" letter-spacing="3" fill="#10B981" text-anchor="middle">ONEPLUS 12 5G</text>
  <text x="200" y="310" font-family="monospace" font-size="9" font-weight="600" fill="#997A2E" text-anchor="middle">HASSELBLAD CAMERA · SNAPDRAGON 8 GEN 3</text>
</svg>
`)}`;

const PS5_SLIM_STUDIO_SVG = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 320" width="100%" height="100%">
  <defs>
    <radialGradient id="ps5-shadow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="rgba(0,0,0,0.28)"/>
      <stop offset="100%" stop-color="rgba(0,0,0,0)"/>
    </radialGradient>
    <linearGradient id="ps5-white" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#E2E8F0"/>
      <stop offset="50%" stop-color="#F8FAFC"/>
      <stop offset="100%" stop-color="#CBD5E1"/>
    </linearGradient>
  </defs>
  <ellipse cx="200" cy="275" rx="100" ry="16" fill="url(#ps5-shadow)"/>
  <g transform="translate(150, 40)">
    <path d="M 12 10 Q 8 110, 4 210 L 96 210 Q 92 110, 88 10 Z" fill="#0B0C10"/>
    <path d="M 2 5 Q 0 110, 10 215 L 26 215 Q 16 110, 14 5 Z" fill="url(#ps5-white)" stroke="#CBD5E1" stroke-width="1"/>
    <path d="M 98 5 Q 100 110, 90 215 L 74 215 Q 84 110, 86 5 Z" fill="url(#ps5-white)" stroke="#CBD5E1" stroke-width="1"/>
    <path d="M 14 30 Q 50 20, 86 30" stroke="#38BDF8" stroke-width="3" fill="none" opacity="0.9"/>
    <rect x="46" y="80" width="8" height="40" rx="3" fill="#1E293B"/>
    <circle cx="50" cy="180" r="4" fill="#38BDF8"/>
  </g>
  <text x="200" y="295" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="11" font-weight="700" letter-spacing="3" fill="#1E293B" text-anchor="middle">PLAYSTATION 5 SLIM</text>
  <text x="200" y="310" font-family="monospace" font-size="9" font-weight="600" fill="#997A2E" text-anchor="middle">DISC EDITION · 1TB SSD · 4K 120FPS</text>
</svg>
`)}`;

const IPAD_AIR_STUDIO_SVG = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 320" width="100%" height="100%">
  <defs>
    <radialGradient id="ipad-shadow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="rgba(0,0,0,0.22)"/>
      <stop offset="100%" stop-color="rgba(0,0,0,0)"/>
    </radialGradient>
    <linearGradient id="ipad-screen" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0284C7"/>
      <stop offset="40%" stop-color="#818CF8"/>
      <stop offset="70%" stop-color="#C084FC"/>
      <stop offset="100%" stop-color="#E879F9"/>
    </linearGradient>
  </defs>
  <ellipse cx="200" cy="275" rx="115" ry="16" fill="url(#ipad-shadow)"/>
  <g transform="translate(125, 45)">
    <rect x="0" y="0" width="150" height="210" rx="14" fill="#334155" stroke="#64748B" stroke-width="1.5"/>
    <rect x="4" y="4" width="142" height="202" rx="10" fill="#000"/>
    <rect x="7" y="7" width="136" height="196" rx="8" fill="url(#ipad-screen)"/>
    <circle cx="75" cy="3" r="1.5" fill="#1E293B"/>
  </g>
  <text x="200" y="295" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="11" font-weight="700" letter-spacing="3" fill="#475569" text-anchor="middle">IPAD AIR 11" M2</text>
  <text x="200" y="310" font-family="monospace" font-size="9" font-weight="600" fill="#997A2E" text-anchor="middle">LIQUID RETINA · APPLE M2 CHIP</text>
</svg>
`)}`;

const BOSE_QC_STUDIO_SVG = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 320" width="100%" height="100%">
  <defs>
    <radialGradient id="bose-shadow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="rgba(0,0,0,0.22)"/>
      <stop offset="100%" stop-color="rgba(0,0,0,0)"/>
    </radialGradient>
  </defs>
  <ellipse cx="200" cy="275" rx="115" ry="16" fill="url(#bose-shadow)"/>
  <path d="M 125 178 C 120 70, 280 70, 275 178" fill="none" stroke="#1E293B" stroke-width="16" stroke-linecap="round"/>
  <ellipse cx="120" cy="205" rx="26" ry="44" fill="#0F172A" stroke="#334155" stroke-width="2"/>
  <ellipse cx="280" cy="205" rx="26" ry="44" fill="#0F172A" stroke="#334155" stroke-width="2"/>
  <ellipse cx="125" cy="205" rx="16" ry="32" fill="#E2E8F0"/>
  <ellipse cx="275" cy="205" rx="16" ry="32" fill="#E2E8F0"/>
  <text x="200" y="295" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="11" font-weight="700" letter-spacing="3" fill="#334155" text-anchor="middle">BOSE QC ULTRA</text>
  <text x="200" y="310" font-family="monospace" font-size="9" font-weight="600" fill="#997A2E" text-anchor="middle">SPATIAL AUDIO · WORLD-CLASS ANC</text>
</svg>
`)}`;

const LG_OLED_STUDIO_SVG = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 320" width="100%" height="100%">
  <defs>
    <radialGradient id="tv-shadow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="rgba(0,0,0,0.25)"/>
      <stop offset="100%" stop-color="rgba(0,0,0,0)"/>
    </radialGradient>
    <linearGradient id="tv-screen" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#020617"/>
      <stop offset="40%" stop-color="#0F172A"/>
      <stop offset="70%" stop-color="#1E1B4B"/>
      <stop offset="100%" stop-color="#312E81"/>
    </linearGradient>
  </defs>
  <ellipse cx="200" cy="275" rx="130" ry="16" fill="url(#tv-shadow)"/>
  <g transform="translate(60, 55)">
    <rect x="0" y="0" width="280" height="175" rx="6" fill="#09090B" stroke="#334155" stroke-width="1.5"/>
    <rect x="3" y="3" width="274" height="169" rx="4" fill="url(#tv-screen)"/>
    <path d="M 120 175 L 110 205 L 170 205 L 160 175 Z" fill="#475569"/>
    <rect x="90" y="205" width="100" height="4" rx="2" fill="#64748B"/>
  </g>
  <text x="200" y="295" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="11" font-weight="700" letter-spacing="3" fill="#3B82F6" text-anchor="middle">LG C3 55" 4K OLED</text>
  <text x="200" y="310" font-family="monospace" font-size="9" font-weight="600" fill="#997A2E" text-anchor="middle">120HZ GAMING · DOLBY VISION CINEMA</text>
</svg>
`)}`;

const ROG_G14_STUDIO_SVG = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 320" width="100%" height="100%">
  <defs>
    <radialGradient id="rog-shadow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="rgba(0,0,0,0.25)"/>
      <stop offset="100%" stop-color="rgba(0,0,0,0)"/>
    </radialGradient>
    <linearGradient id="rog-screen" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#020617"/>
      <stop offset="50%" stop-color="#1E1B4B"/>
      <stop offset="100%" stop-color="#4C0519"/>
    </linearGradient>
  </defs>
  <ellipse cx="200" cy="275" rx="130" ry="16" fill="url(#rog-shadow)"/>
  <g transform="translate(75, 55)">
    <rect x="0" y="0" width="250" height="150" rx="8" fill="#18181B" stroke="#3F3F46" stroke-width="1.5"/>
    <rect x="5" y="5" width="240" height="140" rx="6" fill="url(#rog-screen)"/>
  </g>
  <g transform="translate(50, 200)">
    <path d="M 25 0 L 275 0 L 295 45 L 5 45 Z" fill="#27272A" stroke="#52525B" stroke-width="1.2"/>
    <rect x="50" y="6" width="200" height="22" rx="2" fill="#09090B"/>
    <circle cx="150" cy="17" r="2" fill="#E11D48"/>
  </g>
  <text x="200" y="295" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="11" font-weight="700" letter-spacing="3" fill="#E11D48" text-anchor="middle">ROG ZEPHYRUS G14</text>
  <text x="200" y="310" font-family="monospace" font-size="9" font-weight="600" fill="#997A2E" text-anchor="middle">OLED 120HZ · RYZEN 9 · RTX 4060</text>
</svg>
`)}`;

const KEYCHRON_STUDIO_SVG = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 320" width="100%" height="100%">
  <defs>
    <radialGradient id="kb-shadow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="rgba(0,0,0,0.22)"/>
      <stop offset="100%" stop-color="rgba(0,0,0,0)"/>
    </radialGradient>
  </defs>
  <ellipse cx="200" cy="275" rx="125" ry="16" fill="url(#kb-shadow)"/>
  <g transform="translate(70, 95)">
    <rect x="0" y="0" width="260" height="120" rx="12" fill="#1E293B" stroke="#475569" stroke-width="2"/>
    <rect x="8" y="8" width="244" height="104" rx="8" fill="#0F172A"/>
    <rect x="14" y="14" width="20" height="16" rx="3" fill="#EA580C"/>
    <rect x="38" y="14" width="20" height="16" rx="3" fill="#64748B"/>
    <rect x="62" y="14" width="20" height="16" rx="3" fill="#64748B"/>
    <rect x="86" y="14" width="20" height="16" rx="3" fill="#64748B"/>
    <rect x="110" y="14" width="20" height="16" rx="3" fill="#64748B"/>
    <rect x="134" y="14" width="20" height="16" rx="3" fill="#64748B"/>
    <rect x="158" y="14" width="20" height="16" rx="3" fill="#64748B"/>
    <rect x="182" y="14" width="20" height="16" rx="3" fill="#64748B"/>
    <rect x="206" y="14" width="20" height="16" rx="3" fill="#64748B"/>
    <rect x="230" y="14" width="16" height="16" rx="3" fill="#EA580C"/>
    <rect x="14" y="34" width="232" height="66" rx="4" fill="#1E293B" opacity="0.6"/>
  </g>
  <text x="200" y="295" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="11" font-weight="700" letter-spacing="3" fill="#EA580C" text-anchor="middle">KEYCHRON K2 V2</text>
  <text x="200" y="310" font-family="monospace" font-size="9" font-weight="600" fill="#997A2E" text-anchor="middle">WIRELESS MECHANICAL · RGB HOT-SWAP</text>
</svg>
`)}`;

const APPLE_WATCH_STUDIO_SVG = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 320" width="100%" height="100%">
  <defs>
    <radialGradient id="aw-shadow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="rgba(0,0,0,0.22)"/>
      <stop offset="100%" stop-color="rgba(0,0,0,0)"/>
    </radialGradient>
  </defs>
  <ellipse cx="200" cy="275" rx="80" ry="15" fill="url(#aw-shadow)"/>
  <rect x="175" y="35" width="50" height="230" rx="14" fill="#334155"/>
  <rect x="155" y="90" width="90" height="115" rx="24" fill="#0F172A" stroke="#94A3B8" stroke-width="2.5"/>
  <rect x="160" y="95" width="80" height="105" rx="20" fill="#000"/>
  <circle cx="200" cy="148" r="32" fill="none" stroke="#F59E0B" stroke-width="4"/>
  <circle cx="200" cy="148" r="24" fill="none" stroke="#10B981" stroke-width="4"/>
  <circle cx="200" cy="148" r="16" fill="none" stroke="#EF4444" stroke-width="4"/>
  <text x="200" y="295" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="11" font-weight="700" letter-spacing="3" fill="#94A3B8" text-anchor="middle">APPLE WATCH S10</text>
  <text x="200" y="310" font-family="monospace" font-size="9" font-weight="600" fill="#997A2E" text-anchor="middle">TITANIUM · ALWAYS-ON RETINA</text>
</svg>
`)}`;

const ALL_SUGGESTIONS = [
    { label: 'Cozy retro mechanical keyboards with RGB light & pastel keycaps' },
    { label: 'Best noise-cancelling wireless earbuds under ₹15,000' },
    { label: 'iPhone 17 Pro Max' },
    { label: 'Minimalist ambient LED desk lamps & setup aesthetics' },
    { label: 'Ergonomic office chairs for back support under ₹20k' },
    { label: 'Best gaming monitors 1440p 144Hz' },
    { label: 'Sony PlayStation 5 vs Xbox Series X deals' },
];

const QUICK_PRICE_FILTERS = [
    { label: 'Under ₹5,000', query: 'Best budget electronics and audio under ₹5,000', tag: 'Fast Grab' },
    { label: 'Under ₹15,000', query: 'Best smartwatches and ANC earbuds under ₹15,000', tag: 'Popular' },
    { label: 'Under ₹30,000', query: 'Best 5G smartphones and tech under ₹30,000', tag: 'Sweetspot' },
    { label: 'Under ₹50,000', query: 'Best coding laptops and 4K TVs under ₹50,000', tag: 'Value' },
    { label: 'Flagship Luxury', query: 'Best flagship smartphones and MacBooks under ₹1,50,000', tag: 'Centurion' },
];

const DEPARTMENTS = [
    {
        id: 'smartphones',
        title: 'Flagship Smartphones',
        tag: 'iPhone · Galaxy · OnePlus',
        pricingCue: 'Starting ₹14,999 · Up to 24% Off',
        query: 'Best 5G flagship smartphones under ₹70,000',
        icon: Smartphone,
    },
    {
        id: 'laptops',
        title: 'Pro Laptops & MacBooks',
        tag: 'MacBook · ROG · ThinkPad',
        pricingCue: 'Starting ₹38,990 · No-Cost EMI',
        query: 'Best coding and creator laptops under ₹85,000',
        icon: Laptop,
    },
    {
        id: 'audio',
        title: 'ANC Audio & Headphones',
        tag: 'Sony · Bose · AirPods',
        pricingCue: 'Starting ₹1,999 · Top Rated',
        query: 'Best noise-cancelling headphones and earbuds under ₹25,000',
        icon: Headphones,
    },
    {
        id: 'wearables',
        title: 'Smartwatches & Wearables',
        tag: 'Apple · Galaxy · Garmin',
        pricingCue: 'Starting ₹2,499 · AMOLED Picks',
        query: 'Best AMOLED smartwatches and fitness trackers under ₹15,000',
        icon: Watch,
    },
    {
        id: 'tvs',
        title: '4K OLED TVs & Cinema',
        tag: 'Sony · LG · Samsung',
        pricingCue: 'Starting ₹26,990 · Exchange Bonus',
        query: 'Best 55 inch 4K Smart TVs under ₹55,000',
        icon: Tv,
    },
    {
        id: 'gaming',
        title: 'PlayStation & Gaming',
        tag: 'PS5 · RTX · Mechanical',
        pricingCue: 'Starting ₹3,499 · PS5 & 144Hz',
        query: 'PlayStation 5 Slim and 144Hz gaming monitors',
        icon: Gamepad2,
    },
];

const DEAL_BATCHES = [
    // Batch 0: Flagship Ecosystems & ANC Audio
    [
        {
            id: 'sony-xm5',
            title: 'Sony WH-1000XM5 Wireless ANC Headphones',
            subtitle: 'Industry-leading Active Noise Cancellation with dual processors & 8 mics',
            badge: 'Amazon India',
            storeDot: '#F59E0B',
            rating: '4.8',
            reviews: '3,420',
            price: 24990,
            originalPrice: 34990,
            savingsText: 'Save ₹10,000 (29% OFF)',
            ribbon: 'LIMITED TIME DEAL',
            bankOffer: '💳 Extra ₹2,000 off with HDFC / ICICI Credit Cards',
            deliveryTag: '🚚 Free Next-Day Delivery · Official Brand Warranty',
            query: 'Sony WH-1000XM5 Wireless Noise Cancelling Headphones',
            buyUrl: 'https://www.amazon.in/s?k=Sony+WH-1000XM5',
            image: SONY_XM5_STUDIO_SVG,
        },
        {
            id: 'iphone-16-pro',
            title: 'Apple iPhone 16 Pro (128GB, Natural Titanium)',
            subtitle: 'A18 Pro chip, 48MP Fusion camera system with 4K 120 fps Dolby Vision',
            badge: 'Croma / Flipkart',
            storeDot: '#3B82F6',
            rating: '4.9',
            reviews: '5,180',
            price: 112900,
            originalPrice: 119900,
            savingsText: 'Save ₹7,000 (6% OFF)',
            ribbon: 'LOWEST PRICE IN 90 DAYS',
            bankOffer: '💳 ₹4,000 Instant Cashback on SBI & ICICI Cards',
            deliveryTag: '🚚 Free Express Delivery · Apple 1-Year Warranty',
            query: 'Apple iPhone 16 Pro 128GB',
            buyUrl: 'https://www.croma.com/searchB?q=iphone+16+pro',
            image: IPHONE_16_PRO_STUDIO_SVG,
        },
        {
            id: 'macbook-air-m3',
            title: 'Apple MacBook Air 13" M3 (16GB RAM, 512GB SSD)',
            subtitle: 'Liquid Retina display, up to 18 hrs battery, dual external monitor support',
            badge: 'Flipkart / Amazon',
            storeDot: '#10B981',
            rating: '4.9',
            reviews: '2,890',
            price: 104990,
            originalPrice: 114900,
            savingsText: 'Save ₹9,910 (9% OFF)',
            ribbon: 'TOP CREATOR PICK',
            bankOffer: '💳 ₹5,000 Instant Discount + Up to 12M No-Cost EMI',
            deliveryTag: '🚚 Free Assured Delivery · Apple Official Warranty',
            query: 'MacBook Air M3 16GB',
            buyUrl: 'https://www.flipkart.com/search?q=macbook+air+m3+16gb',
            image: MACBOOK_M3_STUDIO_SVG,
        },
        {
            id: 'galaxy-s24-ultra',
            title: 'Samsung Galaxy S24 Ultra 5G (256GB, Titanium Gray)',
            subtitle: 'Snapdragon 8 Gen 3 for Galaxy, 200MP camera with Galaxy AI & built-in S Pen',
            badge: 'Amazon India',
            storeDot: '#F59E0B',
            rating: '4.8',
            reviews: '4,120',
            price: 102999,
            originalPrice: 129999,
            savingsText: 'Save ₹27,000 (21% OFF)',
            ribbon: 'EXCHANGE BONUS ACTIVE',
            bankOffer: '💳 Extra ₹6,000 off on All Major Bank Cards',
            deliveryTag: '🚚 Prime 1-Day Delivery · Samsung Official Warranty',
            query: 'Samsung Galaxy S24 Ultra 256GB',
            buyUrl: 'https://www.amazon.in/s?k=Samsung+Galaxy+S24+Ultra',
            image: S24_ULTRA_STUDIO_SVG,
        },
    ],
    // Batch 1: Next-Gen Performance & Gaming
    [
        {
            id: 'oneplus-12',
            title: 'OnePlus 12 5G (16GB RAM, 512GB, Flowy Emerald)',
            subtitle: 'Snapdragon 8 Gen 3, 4th Gen Hasselblad Camera, 5400mAh battery with 100W SuperVOOC',
            badge: 'Reliance Digital',
            storeDot: '#10B981',
            rating: '4.7',
            reviews: '2,310',
            price: 64999,
            originalPrice: 69999,
            savingsText: 'Save ₹5,000 (7% OFF)',
            ribbon: 'HOT SPEED PICK',
            bankOffer: '💳 ₹3,000 Instant Discount on OneCard & ICICI',
            deliveryTag: '🚚 Free Express Delivery · Brand Direct Warranty',
            query: 'OnePlus 12 512GB Flowy Emerald',
            buyUrl: 'https://www.reliancedigital.in/search?q=oneplus+12',
            image: ONEPLUS_12_STUDIO_SVG,
        },
        {
            id: 'ps5-slim',
            title: 'Sony PlayStation 5 Slim (1TB SSD, Disc Edition)',
            subtitle: 'Ultra-high speed 1TB SSD, Ray Tracing, 4K-TV Gaming up to 120fps with HDR',
            badge: 'Vijay Sales',
            storeDot: '#3B82F6',
            rating: '4.9',
            reviews: '6,480',
            price: 49990,
            originalPrice: 54990,
            savingsText: 'Save ₹5,000 (9% OFF)',
            ribbon: 'GAMING MEGA DROP',
            bankOffer: '💳 Flat ₹2,500 off on Axis Bank & HDFC Cards',
            deliveryTag: '🚚 Free Guaranteed Delivery · Sony Official 1-Yr',
            query: 'PlayStation 5 Slim Disc Edition',
            buyUrl: 'https://www.vijaysales.com/search/ps5-slim',
            image: PS5_SLIM_STUDIO_SVG,
        },
        {
            id: 'ipad-air-m2',
            title: 'Apple iPad Air 11" M2 (128GB, Space Grey, Wi-Fi)',
            subtitle: 'Apple M2 chip, 11-inch Liquid Retina display, Landscape 12MP Ultra Wide front camera',
            badge: 'Apple / Croma',
            storeDot: '#64748B',
            rating: '4.8',
            reviews: '1,940',
            price: 56900,
            originalPrice: 59900,
            savingsText: 'Save ₹3,000 (5% OFF)',
            ribbon: 'STUDENT & PRO PICK',
            bankOffer: '💳 ₹4,000 Instant Cashback on HDFC Bank Cards',
            deliveryTag: '🚚 Free Next-Day Delivery · Apple 1-Year Warranty',
            query: 'Apple iPad Air M2 11 inch',
            buyUrl: 'https://www.croma.com/searchB?q=ipad+air+m2',
            image: IPAD_AIR_STUDIO_SVG,
        },
        {
            id: 'bose-qc-ultra',
            title: 'Bose QuietComfort Ultra Spatial Audio Headphones',
            subtitle: 'Breakthrough spatialized audio for more immersive listening, CustomTune technology',
            badge: 'Amazon India',
            storeDot: '#F59E0B',
            rating: '4.7',
            reviews: '1,560',
            price: 29900,
            originalPrice: 35900,
            savingsText: 'Save ₹6,000 (17% OFF)',
            ribbon: 'SPATIAL AUDIO STAR',
            bankOffer: '💳 Extra ₹1,500 off on HDFC / ICICI Cards',
            deliveryTag: '🚚 Free Prime Delivery · Bose Official Warranty',
            query: 'Bose QuietComfort Ultra Headphones',
            buyUrl: 'https://www.amazon.in/s?k=Bose+QuietComfort+Ultra',
            image: BOSE_QC_STUDIO_SVG,
        },
    ],
    // Batch 2: Cinema, Creators & Desk Gear
    [
        {
            id: 'lg-c3-oled',
            title: 'LG C3 55" 4K OLED evo Smart Cinema TV',
            subtitle: 'Self-lit OLED evo pixels, α9 AI Processor Gen6, Dolby Vision IQ & Atmos, 0.1ms 120Hz',
            badge: 'Croma / Tata CLiQ',
            storeDot: '#3B82F6',
            rating: '4.9',
            reviews: '1,420',
            price: 99990,
            originalPrice: 139990,
            savingsText: 'Save ₹40,000 (29% OFF)',
            ribbon: 'CINEMA SHOWSTOPPER',
            bankOffer: '💳 Flat ₹5,000 Bank Cashback + Free Installation',
            deliveryTag: '🚚 Free White-Glove Scheduled Delivery · 3-Yr Panel',
            query: 'LG C3 55 inch 4K OLED TV',
            buyUrl: 'https://www.croma.com/searchB?q=lg+c3+55+oled',
            image: LG_OLED_STUDIO_SVG,
        },
        {
            id: 'rog-zephyrus-g14',
            title: 'ASUS ROG Zephyrus G14 (AMD Ryzen 9, RTX 4060, OLED)',
            subtitle: '14" 3K 120Hz OLED ROG Nebula display, 16GB LPDDR5X, 1TB SSD, 1.5kg ultraportable',
            badge: 'Flipkart Assured',
            storeDot: '#E11D48',
            rating: '4.8',
            reviews: '890',
            price: 134990,
            originalPrice: 159990,
            savingsText: 'Save ₹25,000 (16% OFF)',
            ribbon: 'TOP GAMING RIG',
            bankOffer: '💳 ₹7,500 Instant Discount on All Major Bank Cards',
            deliveryTag: '🚚 Free Express Delivery · ASUS Official On-Site',
            query: 'ASUS ROG Zephyrus G14 OLED RTX 4060',
            buyUrl: 'https://www.flipkart.com/search?q=rog+zephyrus+g14+oled',
            image: ROG_G14_STUDIO_SVG,
        },
        {
            id: 'keychron-k2',
            title: 'Keychron K2 V2 Wireless RGB Mechanical Keyboard',
            subtitle: '75% compact layout, Mac/Windows dual layout, Gateron G Pro Brown switches, Bluetooth 5.1',
            badge: 'Amazon India',
            storeDot: '#EA580C',
            rating: '4.8',
            reviews: '3,210',
            price: 7499,
            originalPrice: 9999,
            savingsText: 'Save ₹2,500 (25% OFF)',
            ribbon: 'DESK SETUP ESSENTIAL',
            bankOffer: '💳 10% Instant Discount on SBI Cards',
            deliveryTag: '🚚 Prime 1-Day Delivery · 1-Year Brand Warranty',
            query: 'Keychron K2 V2 Wireless Mechanical Keyboard',
            buyUrl: 'https://www.amazon.in/s?k=Keychron+K2+V2',
            image: KEYCHRON_STUDIO_SVG,
        },
        {
            id: 'apple-watch-s10',
            title: 'Apple Watch Series 10 (GPS + Cellular, 46mm Titanium)',
            subtitle: 'Thinnest Apple Watch ever, largest display, advanced ECG, Sleep Apnea notifications',
            badge: 'Apple / Amazon',
            storeDot: '#94A3B8',
            rating: '4.9',
            reviews: '1,120',
            price: 44900,
            originalPrice: 49900,
            savingsText: 'Save ₹5,000 (10% OFF)',
            ribbon: 'TITANIUM FLAGSHIP',
            bankOffer: '💳 ₹2,500 Instant Cashback on ICICI & HDFC Cards',
            deliveryTag: '🚚 Free Express Delivery · Apple 1-Year Warranty',
            query: 'Apple Watch Series 10 Titanium',
            buyUrl: 'https://www.amazon.in/s?k=Apple+Watch+Series+10',
            image: APPLE_WATCH_STUDIO_SVG,
        },
    ],
];

const RETAILER_PARTNERS = [
    { name: 'Amazon.in', badge: 'Prime Certified' },
    { name: 'Flipkart', badge: 'Plus Assured' },
    { name: 'Croma', badge: 'Tata Direct' },
    { name: 'Reliance Digital', badge: 'Authorised' },
    { name: 'Tata CLiQ', badge: 'Luxury Fleet' },
    { name: 'Vijay Sales', badge: 'Store Direct' },
    { name: 'Apple Authorised', badge: 'MFi Genuine' },
];

const SCAN_TICKER_MESSAGES = [
    "01 Orchestrator: Parsing intent constraints...",
    "02 Search: Scanning Amazon, Flipkart, Croma...",
    "03 Pricing: Extracting live JSON-LD offers...",
    "04 Reviews: Distilling verified sentiment..."
];

export default function ChatInterface({ onQuerySubmit, loading, isGuest = false, steeringMode = 'balanced', setSteeringMode }) {
    const [input, setInput] = useState('');
    const [focused, setFocused] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [currentSuggestions, setCurrentSuggestions] = useState(ALL_SUGGESTIONS.slice(0, 3));
    const [tickerIndex, setTickerIndex] = useState(0);
    const inputRef = useRef(null);
    const magneticBtn = useMagneticButton(0.24);

    // Automatic daily rotation seed: shifts default batch automatically every 24 hours
    const daySeed = Math.floor(Date.now() / (1000 * 60 * 60 * 24));
    const [dealBatchIndex, setDealBatchIndex] = useState(() => daySeed % DEAL_BATCHES.length);
    const [isDealPaused, setIsDealPaused] = useState(false);
    const [timeToMidnight, setTimeToMidnight] = useState('06h 00m');
    const activeDeals = DEAL_BATCHES[dealBatchIndex] || DEAL_BATCHES[0];
    const todayDateStr = new Date().toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });

    // Auto-switch trending deals automatically every 5.5 seconds (pauses smoothly when user hovers)
    useEffect(() => {
        if (isDealPaused || loading) return;
        const interval = setInterval(() => {
            setDealBatchIndex((prev) => (prev + 1) % DEAL_BATCHES.length);
        }, 5500);
        return () => clearInterval(interval);
    }, [isDealPaused, loading]);

    // Live countdown to midnight daily deal reset
    useEffect(() => {
        const updateCountdown = () => {
            const now = new Date();
            const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0);
            const diffMs = Math.max(0, midnight - now);
            const hours = Math.floor(diffMs / (1000 * 60 * 60));
            const mins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
            setTimeToMidnight(`${String(hours).padStart(2, '0')}h ${String(mins).padStart(2, '0')}m`);
        };
        updateCountdown();
        const timer = setInterval(updateCountdown, 60000);
        return () => clearInterval(timer);
    }, []);

    // Dynamic scanning ticker rotating every 1.4 seconds when loading
    useEffect(() => {
        if (!loading) {
            setTickerIndex(0);
            return;
        }
        const interval = setInterval(() => {
            setTickerIndex((prev) => (prev + 1) % SCAN_TICKER_MESSAGES.length);
        }, 1400);
        return () => clearInterval(interval);
    }, [loading]);

    // Keyboard shortcut to focus search input: Ctrl/Cmd + /
    useEffect(() => {
        const handler = (e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === '/') {
                e.preventDefault();
                inputRef.current?.focus();
            }
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, []);

    // Rotate suggestions every 6 seconds
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentSuggestions(() => {
                const shuffled = [...ALL_SUGGESTIONS].sort(() => 0.5 - Math.random());
                return shuffled.slice(0, 3);
            });
        }, 6000);
        return () => clearInterval(interval);
    }, []);

    const handleMicClick = () => {
        if (isGuest) {
            onQuerySubmit("");
            return;
        }
        
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            alert('Speech recognition is not supported in this browser.');
            return;
        }

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = true;

        recognition.onstart = () => setIsListening(true);
        recognition.onresult = (event) => {
            const transcript = Array.from(event.results)
                .map(result => result[0].transcript)
                .join('');
            setInput(transcript);
        };
        recognition.onerror = (event) => {
            console.error(event.error);
            setIsListening(false);
        };
        recognition.onend = () => setIsListening(false);

        recognition.start();
    };

    const handleSubmit = (e, q) => {
        if (e) e.preventDefault();
        const query = (q ?? input).trim();
        if (!query || loading) return;
        onQuerySubmit(query);
    };

    const handleChipClick = (suggestion) => {
        setInput(suggestion);
        handleSubmit(null, suggestion);
    };

    return (
        <section className="relative z-10 mx-auto w-full max-w-6xl text-left pt-1 pb-4">
            
            {/* 1. FEATURED FLAGSHIP SPOTLIGHT BANNER (Eye-Catching Storefront Header) */}
            <div className="mb-5 relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#18181C] via-[#1F1D15] to-[#121215] border border-[#E6C762]/30 p-4 sm:p-5 shadow-[0_16px_36px_-12px_rgba(0,0,0,0.8),inset_0_1px_0_0_rgba(255,255,255,0.12)]">
                <div className="absolute -top-12 -right-12 w-64 h-64 rounded-full bg-[#E6C762]/[0.08] blur-2xl pointer-events-none" />
                
                <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="space-y-1.5">
                        <div className="flex flex-wrap items-center gap-2">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#E6C762]/15 border border-[#E6C762]/35 text-[#E6C762] text-[10px] font-mono font-bold uppercase tracking-wider shadow-sm">
                                <Sparkles className="w-3 h-3 text-[#E6C762]" />
                                Festive Arbitrage Live · Verified Storefront Deals
                            </span>
                            <span className="text-[11px] font-mono text-[#34D399] flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#34D399] animate-pulse" />
                                14 Marketplaces Synced
                            </span>
                        </div>
                        <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight leading-tight">
                            Up to <span className="text-[#E8D082]">32% Off</span> Flagship Electronics — Verified Across Amazon, Flipkart & Croma
                        </h2>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-zinc-300">
                            <span className="flex items-center gap-1 text-zinc-200">
                                <CheckCircle2 className="w-3.5 h-3.5 text-[#34D399]" /> 10% Instant Bank Offers Tracked
                            </span>
                            <span className="text-zinc-600 hidden sm:inline">·</span>
                            <span className="flex items-center gap-1 text-zinc-200">
                                <ShieldCheck className="w-3.5 h-3.5 text-[#E6C762]" /> 100% Authorised Sellers
                            </span>
                            <span className="text-zinc-600 hidden sm:inline">·</span>
                            <span className="flex items-center gap-1 text-zinc-200">
                                <TrendingDown className="w-3.5 h-3.5 text-[#34D399]" /> Sub-Second Live Price Match
                            </span>
                        </div>
                    </div>

                    {/* Quick-Filter Price Pills */}
                    <div className="flex flex-wrap items-center gap-1.5 lg:justify-end">
                        <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider block w-full lg:w-auto lg:mr-1">
                            Browse by Budget:
                        </span>
                        {QUICK_PRICE_FILTERS.map((pill) => (
                            <button
                                key={pill.label}
                                type="button"
                                onClick={() => handleChipClick(pill.query)}
                                className="group inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.04] hover:bg-[#E6C762]/10 border border-white/[0.08] hover:border-[#E6C762]/40 text-xs font-semibold text-zinc-200 hover:text-[#F3E5AB] transition-all active:scale-95 shadow-sm"
                            >
                                <span>{pill.label}</span>
                                <span className="text-[9px] font-mono text-[#E6C762] bg-[#E6C762]/10 px-1 py-0.2 rounded hidden sm:inline">
                                    {pill.tag}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Eyebrow - Compact */}
            <div className="mb-2 flex justify-center">
                <div className="inline-flex items-center space-x-2 rounded-full border border-white/[0.08] bg-white/[0.03] px-3.5 py-1 select-none shadow-sm">
                    <span className="relative flex h-1.5 w-1.5">
                        <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#E6C762] shadow-[0_0_6px_#E6C762]" />
                    </span>
                    <span className="font-mono text-[10px] uppercase tracking-[0.24em] text-zinc-400 font-medium">
                        Autonomous Multi-Agent Shopping Engine
                    </span>
                </div>
            </div>

            {/* Headline with Editorial Serif */}
            <h1 className="text-center text-3xl font-normal leading-[1.1] tracking-tight text-white sm:text-4xl md:text-5xl">
                Shop as if <span className="font-editorial italic font-normal text-[#E8D082]">seven specialists</span> worked for you.
            </h1>
            <p className="mx-auto mt-2 max-w-2xl text-center text-[14px] leading-relaxed text-zinc-400 font-normal">
                State your mandate. SEAMAS dispatches seven autonomous specialists across Indian retail ecosystems,
                synthesizing price trends, reviews, and seller credibility into an executive decision.
            </p>

            {/* Steering Mode Selector */}
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-2.5 max-w-3xl mx-auto">
                {[
                    { id: 'speed', name: 'Speed Swarm', desc: 'Single-cycle sub-second radar sweep', cost: 'Fast · 5 Credits', icon: Zap },
                    { id: 'balanced', name: 'Balanced Matrix', desc: 'Dual-depth pricing, sentiment & seller audit', cost: 'Standard · 10 Credits', icon: Sliders },
                    { id: 'accuracy', name: 'Deep Audit', desc: 'Exhaustive 4-pass cross-market arbitrage', cost: 'Comprehensive · 20 Credits', icon: Sparkles },
                ].map((mode) => {
                    const isActive = steeringMode === mode.id;
                    const Icon = mode.icon;
                    return (
                        <button
                            key={mode.id}
                            type="button"
                            onClick={() => !loading && setSteeringMode && setSteeringMode(mode.id)}
                            disabled={loading}
                            className={`group relative flex flex-col rounded-xl p-3 border text-left transition-all duration-300 ${
                                isActive 
                                    ? 'border-[#E6C762]/50 bg-[#E6C762]/[0.05] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1),0_8px_20px_-8px_rgba(230,199,98,0.2)]' 
                                    : 'border-white/[0.08] bg-[#121215] hover:border-white/20 hover:bg-[#18181C]'
                            } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            {isActive && (
                                <span className="absolute top-2.5 right-2.5 h-1.5 w-1.5 rounded-full bg-[#E6C762] shadow-[0_0_6px_#E6C762]" />
                            )}
                            <div className="flex items-center gap-2">
                                <Icon className={`h-3.5 w-3.5 ${isActive ? 'text-[#E6C762]' : 'text-zinc-500 group-hover:text-zinc-300'}`} />
                                <span className="font-semibold text-xs text-white">{mode.name}</span>
                            </div>
                            <span className="mt-1 text-[10px] text-zinc-400 leading-tight">{mode.desc}</span>
                            <span className="mt-1.5 font-mono text-[9px] text-zinc-400 uppercase tracking-wider font-semibold">{mode.cost}</span>
                        </button>
                    );
                })}
            </div>

            {/* Command Omnibar Card */}
            <div className="relative mt-4">
                <div
                    aria-hidden="true"
                    className={`pointer-events-none absolute -inset-3 rounded-[28px] opacity-40 blur-2xl transition-opacity duration-500 ${focused ? 'opacity-70' : 'opacity-30'}`}
                    style={{
                        background: 'radial-gradient(ellipse 70% 50% at 50% 50%, rgba(230, 199, 98, 0.12), rgba(255, 255, 255, 0.03), transparent)',
                    }}
                />

                <div className="relative overflow-hidden rounded-2xl bg-[#121215] border border-white/[0.08] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.14),0_20px_40px_-15px_rgba(0,0,0,0.8)]">
                    {loading && (
                        <div className="laser-scan-line pointer-events-none absolute inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-[#E5C878] to-transparent shadow-[0_0_12px_#E5C878]" />
                    )}
                    <form onSubmit={handleSubmit} className="flex items-center gap-3 px-5 py-3.5 sm:px-6 sm:py-4">
                        <Search className="h-5 w-5 shrink-0 text-[#E6C762]" strokeWidth={1.75} />
                        <input
                            ref={inputRef}
                            type="text"
                            value={input}
                            onChange={(e) => {
                                if (isGuest) {
                                    onQuerySubmit("");
                                } else {
                                    setInput(e.target.value);
                                }
                            }}
                            onFocus={() => {
                                if (isGuest) {
                                    onQuerySubmit("");
                                } else {
                                    setFocused(true);
                                }
                            }}
                            onBlur={() => setFocused(false)}
                            disabled={loading}
                            placeholder={isGuest ? "Please sign in to compare prices and search..." : "Command 7 specialists (e.g. Best noise-cancelling headphones under ₹25,000)..."}
                            className="flex-1 bg-transparent text-base sm:text-lg font-normal tracking-tight text-white placeholder:text-zinc-500 focus:outline-none"
                        />

                        {/* Voice button */}
                        <button
                            type="button"
                            onClick={handleMicClick}
                            className={`hidden shrink-0 rounded-full p-2.5 transition-all duration-300 sm:inline-flex ${isListening ? 'bg-[#E6C762]/20 text-[#E6C762] shadow-[0_0_15px_rgba(230,199,98,0.3)] animate-pulse' : 'text-zinc-400 hover:bg-white/[0.06] hover:text-white'}`}
                            aria-label="Voice input"
                        >
                            <Mic className="h-4 w-4" strokeWidth={isListening ? 2 : 1.6} />
                        </button>

                        {/* Kbd badge */}
                        <kbd className="hidden sm:inline-flex items-center gap-0.5 px-2 py-0.5 rounded-lg bg-white/[0.06] border border-white/[0.1] text-[10px] font-mono text-zinc-400 select-none">
                            <Command className="h-2.5 w-2.5" strokeWidth={2} />/
                        </kbd>

                        {/* Primary High-Craft Brushed Champagne Gold & Pearl CTA Button with Magnetic Physics */}
                        <button
                            type="submit"
                            onMouseMove={magneticBtn.onMouseMove}
                            onMouseLeave={magneticBtn.onMouseLeave}
                            onClick={(e) => {
                                if (!input.trim() && !loading) {
                                    e.preventDefault();
                                    inputRef.current?.focus();
                                }
                            }}
                            disabled={loading}
                            className="group relative inline-flex shrink-0 items-center gap-2 overflow-hidden rounded-xl px-5 py-2.5 text-sm font-semibold text-[#09090B] bg-gradient-to-b from-[#F5E6B3] via-[#E5C878] to-[#C9A449] shadow-[0_1px_0_0_rgba(255,255,255,0.5)_inset,0_8px_24px_-4px_rgba(212,175,55,0.35)] hover:brightness-110 transition-all duration-200 active:scale-[0.98] disabled:cursor-not-allowed opacity-95 btn-tactile-spring"
                        >
                            <span>{loading ? "Orchestrating…" : "Search Market"}</span>
                            <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 text-[#09090B]" strokeWidth={2.2} />
                        </button>
                    </form>

                    {/* Suggestions list */}
                    <div className="border-t border-white/[0.06] px-5 py-2.5 sm:px-6">
                        <div className="flex flex-wrap items-center gap-2">
                            <span className="mr-1 text-[10px] uppercase tracking-wider text-zinc-500 font-semibold font-mono">
                                Suggestions:
                            </span>
                            {currentSuggestions.map((s) => (
                                <button
                                    key={s.label}
                                    type="button"
                                    onClick={() => handleChipClick(s.label)}
                                    className="group inline-flex items-center gap-1.5 rounded-full border border-white/[0.07] bg-white/[0.02] px-3 py-1 text-xs text-zinc-300 transition-all duration-300 hover:shadow-[0_0_15px_rgba(230,199,98,0.15)] hover:border-[#E6C762]/40 hover:bg-[#E6C762]/[0.05] hover:text-white interactive-chip-spring"
                                >
                                    <Sparkles className="h-3 w-3 text-zinc-500 transition-colors group-hover:text-[#E6C762]" strokeWidth={1.75} />
                                    {s.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Animated Dynamic Scanning Ticker */}
                {loading && (
                    <div className="mt-3 flex items-center justify-center gap-2 py-2 px-4 rounded-xl bg-[#E6C762]/[0.06] border border-[#E6C762]/20 text-xs font-mono text-[#E5C878] animate-pulse">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#E5C878] animate-ping" />
                        <span className="tracking-wide">{SCAN_TICKER_MESSAGES[tickerIndex]}</span>
                    </div>
                )}
            </div>

            {/* 2. UPGRADED DEPARTMENT CARDS WITH ATTRACTIVE PRICING CUES & ICONS */}
            <div className="mt-6">
                <div className="flex items-center justify-between mb-2.5 px-0.5">
                    <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-400 font-semibold flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#E6C762]" />
                        Shop by Department · Direct Swarm Dispatch
                    </span>
                    <span className="text-[10px] text-zinc-500 font-mono hidden sm:inline">
                        Click category to initiate live arbitrage sweep
                    </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
                    {DEPARTMENTS.map((dept) => {
                        const Icon = dept.icon;
                        return (
                            <button
                                key={dept.id}
                                type="button"
                                onClick={() => handleChipClick(dept.query)}
                                className="group relative rounded-xl bg-[#121215] border border-white/[0.08] hover:border-[#E6C762]/50 hover:bg-[#18181C] p-3 text-left transition-all duration-200 shadow-sm flex flex-col justify-between card-interactive product-card-glow"
                            >
                                <div>
                                    <div className="w-8 h-8 rounded-lg bg-white/[0.04] border border-white/[0.08] group-hover:border-[#E6C762]/30 group-hover:bg-[#E6C762]/10 flex items-center justify-center transition-colors mb-2 text-[#E6C762]">
                                        <Icon className="w-4 h-4" />
                                    </div>
                                    <h4 className="text-xs font-bold text-white group-hover:text-[#F3E5AB] transition-colors leading-snug">
                                        {dept.title}
                                    </h4>
                                    <span className="mt-1 text-[10px] font-mono text-zinc-400 group-hover:text-zinc-300 truncate block">
                                        {dept.tag}
                                    </span>
                                </div>
                                <div className="mt-2.5 pt-2 border-t border-white/[0.05]">
                                    <span className="text-[10px] font-mono text-[#34D399] font-medium block truncate">
                                        {dept.pricingCue}
                                    </span>
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Verified Retailer Partner Strip */}
            <div className="mt-5 rounded-xl bg-white/[0.02] border border-white/[0.06] px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 text-left">
                <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-[#34D399]" />
                    <span className="font-mono text-[10px] uppercase tracking-wider text-zinc-300 font-semibold">
                        VERIFIED RETAILERS INDEXED:
                    </span>
                </div>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] font-mono text-zinc-400">
                    {RETAILER_PARTNERS.map((retailer, i) => (
                        <div key={retailer.name} className="flex items-center gap-1.5">
                            <span className="text-zinc-200 font-medium hover:text-[#E6C762] transition-colors">{retailer.name}</span>
                            <span className="text-[9px] text-[#34D399] bg-[#34D399]/10 px-1 py-0.2 rounded border border-[#34D399]/20 hidden md:inline">
                                {retailer.badge}
                            </span>
                            {i < RETAILER_PARTNERS.length - 1 && <span className="text-zinc-600 hidden sm:inline">·</span>}
                        </div>
                    ))}
                </div>
            </div>

            {/* 3. TODAY'S VERIFIED PRICE DROPS & TRENDING DEALS (Guaranteed Studio Renders + Bank Offers) */}
            <div className="mt-8 space-y-4">
                <div className="flex flex-wrap items-end justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#E6C762] shadow-[0_0_8px_#E6C762]" />
                            <span className="font-mono text-[10px] uppercase tracking-[0.24em] text-[#E6C762] font-semibold">
                                Live Storefront Index · Daily Cycle: {todayDateStr}
                            </span>
                        </div>
                        <h2 className="mt-1 text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-3">
                            <span>Today's Verified Price Drops & Trending Deals</span>
                        </h2>
                        <p className="text-xs text-zinc-400 mt-0.5">
                            Real-time price convergence across verified Indian marketplaces with active inventory. Rotates automatically every 24 hours.
                        </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2.5">
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-xs font-mono text-zinc-300 shadow-sm">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#E6C762] opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#E6C762]"></span>
                            </span>
                            <span>Auto-Switching ({dealBatchIndex + 1}/{DEAL_BATCHES.length})</span>
                        </div>

                        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-xs font-mono text-zinc-400">
                            <Clock className="w-3.5 h-3.5 text-[#E6C762]" />
                            <span>Daily Reset in {timeToMidnight}</span>
                        </div>

                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#34D399]/10 border border-[#34D399]/25 text-[#34D399] font-mono text-[10px] font-semibold shadow-sm">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#34D399] animate-pulse" />
                            <span>DOM-Verified Live</span>
                        </div>

                        {/* Interactive Pagination Dots */}
                        <div className="flex items-center gap-1.5 pl-1">
                            {DEAL_BATCHES.map((_, idx) => (
                                <button
                                    key={idx}
                                    type="button"
                                    onClick={() => setDealBatchIndex(idx)}
                                    className={`h-2 rounded-full transition-all duration-300 ${dealBatchIndex === idx ? 'w-6 bg-[#E6C762] shadow-[0_0_8px_rgba(230,199,98,0.5)]' : 'w-2 bg-white/20 hover:bg-white/40'}`}
                                    aria-label={`Jump to batch ${idx + 1}`}
                                />
                            ))}
                        </div>
                    </div>
                </div>

                <div 
                    onMouseEnter={() => setIsDealPaused(true)}
                    onMouseLeave={() => setIsDealPaused(false)}
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 transition-all duration-500"
                >
                    {activeDeals.map((deal) => (
                        <div
                            key={deal.id}
                            className="group relative flex flex-col justify-between rounded-2xl bg-[#121215] border border-white/[0.08] hover:border-white/20 transition-all duration-300 hover:-translate-y-1 shadow-[0_16px_36px_-12px_rgba(0,0,0,0.8)] overflow-hidden"
                        >
                            {/* Studio-White Pedestal with Guaranteed High-Resolution SVG Render */}
                            <div className="relative aspect-[4/3] bg-gradient-to-b from-[#FFFFFF] to-[#F4F4F6] rounded-2xl m-3 p-3 flex items-center justify-center overflow-hidden shadow-inner">
                                <img
                                    src={deal.image}
                                    alt={deal.title}
                                    className="h-full w-full object-contain max-h-44 mx-auto drop-shadow-[0_12px_24px_rgba(0,0,0,0.18)] transition-transform duration-500 group-hover:scale-105"
                                    loading="eager"
                                />

                                {/* Store Badge Top-Left */}
                                <div className="absolute top-2.5 left-2.5 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/85 backdrop-blur-md border border-white/10 text-[10px] font-mono text-zinc-200">
                                    <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: deal.storeDot }} />
                                    <span>{deal.badge}</span>
                                </div>

                                {/* Limited Time / Ribbon Badge Top-Right */}
                                <div className="absolute top-2.5 right-2.5 inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500/90 text-black font-mono text-[9px] font-bold shadow-sm">
                                    <Tag className="w-2.5 h-2.5" />
                                    <span>{deal.ribbon}</span>
                                </div>

                                {/* Savings Pill Bottom-Left */}
                                <div className="absolute bottom-2.5 left-2.5 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-[#34D399] text-[#09090B] font-mono text-[10px] font-bold shadow-sm">
                                    <span>{deal.savingsText}</span>
                                </div>
                            </div>

                            {/* Card Body */}
                            <div className="p-4 pt-1 flex flex-col justify-between flex-1">
                                <div>
                                    <div className="flex items-center gap-2 mb-1.5">
                                        <span className="flex items-center gap-1 text-[#E6C762] text-xs font-semibold">
                                            <Star className="w-3.5 h-3.5 fill-[#E6C762]" />
                                            {deal.rating}
                                        </span>
                                        <span className="text-[11px] text-zinc-500 font-mono">({deal.reviews} ratings)</span>
                                    </div>
                                    <h3 className="text-sm font-bold text-white group-hover:text-[#F3E5AB] transition-colors line-clamp-2 leading-snug">
                                        {deal.title}
                                    </h3>
                                    <p className="text-[11px] text-zinc-400 mt-1 line-clamp-1">{deal.subtitle}</p>

                                    {/* Bank Offer & Delivery Strip */}
                                    <div className="mt-2.5 space-y-1 text-[10px] font-mono border-t border-b border-white/[0.04] py-2">
                                        <div className="text-amber-300/90 truncate flex items-center gap-1">
                                            <CreditCard className="w-3 h-3 text-[#E6C762] shrink-0" />
                                            <span className="truncate">{deal.bankOffer}</span>
                                        </div>
                                        <div className="text-emerald-400/90 truncate flex items-center gap-1">
                                            <Truck className="w-3 h-3 text-[#34D399] shrink-0" />
                                            <span className="truncate">{deal.deliveryTag}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-3.5 pt-1">
                                    <div className="flex items-baseline gap-2 mb-3">
                                        <span className="text-xl font-bold text-white tabular-nums tracking-tight">
                                            ₹{deal.price.toLocaleString('en-IN')}
                                        </span>
                                        <span className="text-xs text-zinc-500 line-through tabular-nums">
                                            ₹{deal.originalPrice.toLocaleString('en-IN')}
                                        </span>
                                    </div>

                                    <div className="grid grid-cols-2 gap-2">
                                        <button
                                            type="button"
                                            onClick={() => handleChipClick(deal.query)}
                                            className="inline-flex items-center justify-center gap-1 px-2.5 py-2 rounded-xl bg-gradient-to-b from-[#F5E6B3] via-[#E5C878] to-[#C9A449] hover:brightness-110 text-[#09090B] text-xs font-bold shadow-sm transition-all active:scale-[0.98]"
                                        >
                                            <span>Compare 4 Stores</span>
                                        </button>
                                        <a
                                            href={deal.buyUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            onClick={(e) => e.stopPropagation()}
                                            className="inline-flex items-center justify-center gap-1 px-2 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] hover:border-white/20 text-zinc-300 hover:text-white text-xs font-medium transition-all"
                                        >
                                            <span>View Deal</span>
                                            <ExternalLink className="w-3 h-3 shrink-0" />
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
