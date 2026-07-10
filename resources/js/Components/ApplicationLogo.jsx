import React from 'react';

export default function ApplicationLogo({ className = '', iconOnly = false, ...props }) {
    // Determine if it should be iconOnly based on height classes or explicit props
    const isIconOnly = iconOnly || 
        className.includes('h-8') || 
        className.includes('h-7') || 
        className.includes('h-6') || 
        className.includes('h-5') ||
        className.includes('h-4');

    // Clean class names: remove strict height, width, and text classes to prevent layout breaking
    const cleanClassName = className
        .replace(/\bh-\d+\b/g, '')
        .replace(/\bw-\d+\b/g, '')
        .replace(/\btext-[a-z0-9-]+\b/g, '')
        .replace(/\bfill-current\b/g, '');

    // Map sizes based on passed classes to keep consistent proportions
    let iconSize = 'h-10 w-10';
    let textSize = 'text-3xl';
    
    if (className.includes('h-14')) {
        iconSize = 'h-12 w-12';
        textSize = 'text-4xl';
    } else if (className.includes('h-10')) {
        iconSize = 'h-9 w-9';
        textSize = 'text-3xl';
    } else if (className.includes('h-8')) {
        iconSize = 'h-8 w-8';
        textSize = 'text-xl';
    } else if (className.includes('h-7')) {
        iconSize = 'h-7 w-7';
        textSize = 'text-lg';
    } else if (className.includes('h-6')) {
        iconSize = 'h-6 w-6';
        textSize = 'text-md';
    } else if (className.includes('h-5')) {
        iconSize = 'h-5 w-5';
        textSize = 'text-sm';
    } else if (className.includes('h-4')) {
        iconSize = 'h-4 w-4';
        textSize = 'text-xs';
    }

    return (
        <div className={`flex items-center gap-2 select-none ${cleanClassName}`} {...props}>
            <style dangerouslySetInnerHTML={{__html: `
                @keyframes hologram-glow {
                    0%, 100% {
                        filter: drop-shadow(0 0 3px rgba(6, 182, 212, 0.4)) drop-shadow(0 0 8px rgba(99, 102, 241, 0.2));
                        opacity: 0.9;
                    }
                    50% {
                        filter: drop-shadow(0 0 6px rgba(6, 182, 212, 0.7)) drop-shadow(0 0 12px rgba(168, 85, 247, 0.4));
                        opacity: 1;
                    }
                }
                
                @keyframes text-glitch {
                    0%, 93%, 100% {
                        transform: translate(0);
                        clip-path: inset(0 0 0 0);
                    }
                    94% {
                        transform: translate(-1.5px, 0.5px);
                        clip-path: inset(10% 0 85% 0);
                    }
                    95% {
                        transform: translate(1.5px, -0.5px);
                        clip-path: inset(80% 0 5% 0);
                    }
                    96% {
                        transform: translate(-0.5px, 1px);
                        clip-path: inset(40% 0 45% 0);
                    }
                    97% {
                        transform: translate(0.5px, -1px);
                        clip-path: inset(0 0 0 0);
                    }
                }

                @keyframes holo-shimmer {
                    0% {
                        background-position: -200% center;
                    }
                    100% {
                        background-position: 200% center;
                    }
                }

                .holo-text-container {
                    position: relative;
                    display: inline-block;
                    font-family: 'Outfit', 'Inter', sans-serif;
                    font-weight: 900;
                    letter-spacing: 0.08em;
                    line-height: 1.1;
                    animation: hologram-glow 4s infinite ease-in-out;
                }

                .holo-text-base {
                    color: #4338ca; /* Indigo base for light mode */
                    text-shadow: 
                        0 1px 0 #4f46e5,
                        0 2px 0 #4338ca,
                        0 3px 0 #3730a3,
                        0 4px 0 #1e1b4b,
                        0 5px 6px rgba(0, 0, 0, 0.15);
                    transition: text-shadow 0.3s;
                }

                .dark .holo-text-base {
                    color: #1e1b4b; /* Deep background layer for dark mode */
                    text-shadow: 
                        0 1px 0 #818cf8,
                        0 2px 0 #6366f1,
                        0 3px 0 #4f46e5,
                        0 4px 0 #312e81,
                        0 5px 8px rgba(99, 102, 241, 0.3);
                }

                .holo-text-overlay {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: linear-gradient(
                        90deg,
                        #06b6d4 0%,
                        #a855f7 25%,
                        #6366f1 50%,
                        #06b6d4 75%,
                        #a855f7 100%
                    );
                    background-size: 200% auto;
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    animation: holo-shimmer 8s linear infinite, text-glitch 6s infinite;
                    opacity: 0.9;
                }

                .hologram-grid-overlay {
                    position: absolute;
                    inset: 0;
                    background: linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(6, 182, 212, 0.15) 50%);
                    background-size: 100% 3px;
                    pointer-events: none;
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                }

                .holo-emblem {
                    position: relative;
                    animation: hologram-glow 4s infinite ease-in-out;
                }

                .holo-emblem-core {
                    transform-origin: center;
                    animation: spin-slow 16s linear infinite;
                }

                @keyframes spin-slow {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `}} />

            {/* Glowing 3D/Hologram Emblem */}
            <div className={`holo-emblem ${iconSize} shrink-0`}>
                <svg viewBox="0 0 100 100" className="w-full h-full fill-none">
                    {/* Outer Hexagon Orbit */}
                    <polygon 
                        points="50,5 90,25 90,75 50,95 10,75 10,25" 
                        stroke="url(#emblemGradientCyan)" 
                        strokeWidth="5" 
                        strokeDasharray="18, 12" 
                        className="holo-emblem-core"
                    />
                    
                    {/* Inner Hologram Core */}
                    <polygon 
                        points="50,22 75,36 75,64 50,78 25,64 25,36" 
                        fill="url(#emblemGradientIndigo)" 
                        fillOpacity="0.3"
                        stroke="#06b6d4" 
                        strokeWidth="2.5"
                    />

                    {/* Glowing Core Dot */}
                    <circle cx="50" cy="50" r="14" fill="#06b6d4" fillOpacity="0.8" className="animate-pulse" />
                    <circle cx="50" cy="50" r="6" fill="#ffffff" fillOpacity="0.9" />
                    
                    {/* Connection Node Beams */}
                    <line x1="50" y1="5" x2="50" y2="40" stroke="#6366f1" strokeWidth="2.5" strokeDasharray="3, 3" />
                    <line x1="10" y1="75" x2="38" y2="58" stroke="#6366f1" strokeWidth="2.5" strokeDasharray="3, 3" />
                    <line x1="90" y1="75" x2="62" y2="58" stroke="#6366f1" strokeWidth="2.5" strokeDasharray="3, 3" />

                    <defs>
                        <linearGradient id="emblemGradientCyan" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#06b6d4" />
                            <stop offset="50%" stopColor="#3b82f6" />
                            <stop offset="100%" stopColor="#6366f1" />
                        </linearGradient>
                        <linearGradient id="emblemGradientIndigo" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#6366f1" stopOpacity="0.8" />
                            <stop offset="100%" stopColor="#a855f7" stopOpacity="0.8" />
                        </linearGradient>
                    </defs>
                </svg>
            </div>

            {/* Holographic 3D Text "SIPADA" */}
            {!isIconOnly && (
                <div className={`holo-text-container ${textSize}`}>
                    {/* Base 3D Extrusion Layer */}
                    <div className="holo-text-base">SIPADA</div>
                    
                    {/* Glowing Moving Gradient Overlay */}
                    <div className="holo-text-overlay" aria-hidden="true">SIPADA</div>

                    {/* CRT Scanline Simulation Overlay */}
                    <div className="hologram-grid-overlay" aria-hidden="true">SIPADA</div>
                </div>
            )}
        </div>
    );
}
