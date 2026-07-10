import React, { useEffect, useRef } from 'react';

export default function HologramData() {
    const containerRef = useRef(null);
    const canvasRef = useRef(null);
    const cardsWrapperRef = useRef(null);
    const canvasWrapperRef = useRef(null);

    // Mouse interactive values (normalized -1 to 1)
    const mouseX = useRef(0);
    const mouseY = useRef(0);
    const targetMouseX = useRef(0);
    const targetMouseY = useRef(0);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationFrameId;
        
        // Handle resizing for high-DPI displays (retina)
        const resizeCanvas = () => {
            const rect = canvas.parentElement.getBoundingClientRect();
            const dpr = window.devicePixelRatio || 1;
            canvas.width = rect.width * dpr;
            canvas.height = rect.height * dpr;
            ctx.scale(dpr, dpr);
            canvas.style.width = `${rect.width}px`;
            canvas.style.height = `${rect.height}px`;
        };

        window.addEventListener('resize', resizeCanvas);
        resizeCanvas();

        // 3D Projection variables
        const centerX = 250;
        const centerY = 220;
        const perspective = 350;

        // 3D rotation angles
        let angleX = 0.5; // initial tilt
        let angleY = 0.8;
        let angleZ = 0.2;

        // Generate Fibonacci sphere particles
        const particles = [];
        const particleCount = 130;
        const sphereRadius = 110;

        for (let i = 0; i < particleCount; i++) {
            const y = 1 - (i / (particleCount - 1)) * 2; // y: 1 to -1
            const rAtY = Math.sqrt(1 - y * y); // radius at y slice
            const theta = 2.39996 * i; // golden spiral angle
            
            const px = Math.cos(theta) * rAtY * sphereRadius;
            const py = y * sphereRadius;
            const pz = Math.sin(theta) * rAtY * sphereRadius;

            particles.push({
                x: px,
                y: py,
                z: pz,
                baseSize: Math.random() * 1.5 + 0.8,
                // Assign a color group for nice variations
                colorGroup: i % 3 // 0: Indigo, 1: Cyan, 2: Violet
            });
        }

        // Concentric base projection circles
        const baseCircles = [
            { r: 160, opacity: 0.15, speed: 0.005 },
            { r: 120, opacity: 0.25, speed: -0.008 },
            { r: 80, opacity: 0.35, speed: 0.01 }
        ];

        // Rising data stream packets
        const dataPackets = [];
        const packetCount = 20;
        for (let i = 0; i < packetCount; i++) {
            dataPackets.push({
                x: (Math.random() - 0.5) * 100,
                y: Math.random() * 300 - 150, // from bottom to top
                z: (Math.random() - 0.5) * 100,
                speed: Math.random() * 1.2 + 0.6,
                size: Math.random() * 1.5 + 0.5,
                hue: Math.random() > 0.4 ? 180 : 260 // 180: Cyan, 260: Violet
            });
        }

        // Helper: Rotate point around X, Y, Z axes
        const rotate3D = (x, y, z, ax, ay, az) => {
            // Rotate around Z
            const cosZ = Math.cos(az);
            const sinZ = Math.sin(az);
            let x1 = x * cosZ - y * sinZ;
            let y1 = x * sinZ + y * cosZ;

            // Rotate around X
            const cosX = Math.cos(ax);
            const sinX = Math.sin(ax);
            let y2 = y1 * cosX - z * sinX;
            let z2 = y1 * sinX + z * cosX;

            // Rotate around Y
            const cosY = Math.cos(ay);
            const sinY = Math.sin(ay);
            let x3 = x1 * cosY + z2 * sinY;
            let z3 = -x1 * sinY + z2 * cosY;

            return { x: x3, y: y2, z: z3 };
        };

        // Helper: Project 3D point to 2D screen
        const project = (x, y, z, cX = centerX, cY = centerY) => {
            const scale = perspective / (perspective + z);
            return {
                x: cX + x * scale,
                y: cY + y * scale,
                scale
            };
        };

        // Mouse move handler on parent container
        const handleMouseMove = (e) => {
            const container = containerRef.current;
            if (!container) return;
            const rect = container.getBoundingClientRect();
            // Get coordinates relative to center (-1 to 1)
            const x = (e.clientX - rect.left - rect.width / 2) / (rect.width / 2);
            const y = (e.clientY - rect.top - rect.height / 2) / (rect.height / 2);
            
            targetMouseX.current = x;
            targetMouseY.current = y;
        };

        const handleMouseLeave = () => {
            targetMouseX.current = 0;
            targetMouseY.current = 0;
        };

        const container = containerRef.current;
        if (container) {
            container.addEventListener('mousemove', handleMouseMove);
            container.addEventListener('mouseleave', handleMouseLeave);
        }

        let time = 0;

        // Render Loop
        const render = () => {
            time += 0.5;

            // Clear with a very slight tail to make movement smooth (optional, but clean clear is sharper)
            ctx.clearRect(0, 0, 500, 500);

            // Interpolate mouse coordinates (lerp) for smooth parallax
            mouseX.current += (targetMouseX.current - mouseX.current) * 0.08;
            mouseY.current += (targetMouseY.current - mouseY.current) * 0.08;

            // Apply tilt to the wrappers
            if (cardsWrapperRef.current) {
                cardsWrapperRef.current.style.transform = `perspective(1000px) rotateX(${mouseY.current * -12}deg) rotateY(${mouseX.current * 12}deg)`;
            }
            if (canvasWrapperRef.current) {
                canvasWrapperRef.current.style.transform = `perspective(1000px) rotateX(${mouseY.current * -18}deg) rotateY(${mouseX.current * 18}deg) translateZ(10px)`;
            }

            // Update rotation angles with time + mouse tilt offsets
            const currentAngleX = angleX + time * 0.002 + mouseY.current * 0.2;
            const currentAngleY = angleY + time * 0.004 + mouseX.current * 0.2;
            const currentAngleZ = angleZ + time * 0.001;

            // 1. Draw projection base grid (concentric rings at bottom: y = 140)
            baseCircles.forEach((circle) => {
                ctx.beginPath();
                const segmentCount = 64;
                for (let j = 0; j <= segmentCount; j++) {
                    const angle = (j / segmentCount) * Math.PI * 2 + time * circle.speed;
                    const bx = circle.r * Math.cos(angle);
                    const bz = circle.r * Math.sin(angle);
                    const by = 130; // Projector plane height

                    const pt = rotate3D(bx, by, bz, currentAngleX * 0.2, currentAngleY * 0.5, 0);
                    const screen = project(pt.x, pt.y, pt.z);

                    if (j === 0) ctx.moveTo(screen.x, screen.y);
                    else ctx.lineTo(screen.x, screen.y);
                }
                ctx.strokeStyle = `rgba(6, 182, 212, ${circle.opacity * (0.8 + Math.sin(time * 0.05) * 0.2)})`;
                ctx.lineWidth = 1;
                // Add some dash styling to one of the rings
                if (circle.r === 120) {
                    ctx.setLineDash([8, 8]);
                } else {
                    ctx.setLineDash([]);
                }
                ctx.stroke();
            });
            ctx.setLineDash([]); // Reset line dash

            // 2. Draw rising data stream columns
            dataPackets.forEach((p) => {
                // Update position
                p.y -= p.speed;
                if (p.y < -130) {
                    p.y = 130; // reset to bottom
                    p.x = (Math.random() - 0.5) * 90;
                    p.z = (Math.random() - 0.5) * 90;
                }

                // Project and draw
                const pt = rotate3D(p.x, p.y, p.z, currentAngleX * 0.3, currentAngleY * 0.6, 0);
                
                // Only render if within sphere area
                const screen = project(pt.x, pt.y, pt.z);
                
                // Fade out at ends
                const fadeFactor = Math.min(1, (130 - Math.abs(p.y)) / 40);
                const alpha = 0.45 * screen.scale * fadeFactor;
                
                ctx.beginPath();
                ctx.arc(screen.x, screen.y, p.size * screen.scale, 0, Math.PI * 2);
                ctx.fillStyle = p.hue === 180 
                    ? `rgba(6, 182, 212, ${alpha})` 
                    : `rgba(168, 85, 247, ${alpha})`;
                ctx.fill();

                // Draw tiny vertical connection trails
                ctx.beginPath();
                ctx.moveTo(screen.x, screen.y);
                const trailPt = rotate3D(p.x, p.y + 12, p.z, currentAngleX * 0.3, currentAngleY * 0.6, 0);
                const trailScreen = project(trailPt.x, trailPt.y, trailPt.z);
                ctx.lineTo(trailScreen.x, trailScreen.y);
                ctx.strokeStyle = p.hue === 180 
                    ? `rgba(6, 182, 212, ${alpha * 0.3})` 
                    : `rgba(168, 85, 247, ${alpha * 0.3})`;
                ctx.lineWidth = p.size * 0.5;
                ctx.stroke();
            });

            // 3. Project sphere particles
            const projectedParticles = particles.map((p) => {
                const pt = rotate3D(p.x, p.y, p.z, currentAngleX, currentAngleY, currentAngleZ);
                const screen = project(pt.x, pt.y, pt.z);
                return {
                    x: screen.x,
                    y: screen.y,
                    z: pt.z, // rotated Z depth
                    scale: screen.scale,
                    baseSize: p.baseSize,
                    colorGroup: p.colorGroup
                };
            });

            // Sort particles by depth (Z) so back-to-front rendering creates 3D depth
            projectedParticles.sort((a, b) => b.z - a.z);

            // 4. Draw network connection lines for particles close in 3D space
            // To be efficient, check a fixed window of neighbors in the sorted array
            for (let i = 0; i < projectedParticles.length; i++) {
                const p1 = projectedParticles[i];
                let connections = 0;
                
                for (let j = i + 1; j < projectedParticles.length; j++) {
                    if (connections >= 3) break; // Limit connections per node to look neat
                    
                    const p2 = projectedParticles[j];
                    
                    // Simple distance check in screen space (approximation) or 3D coordinate delta
                    const dx = p1.x - p2.x;
                    const dy = p1.y - p2.y;
                    const dz = p1.z - p2.z;
                    const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

                    if (dist < 55) {
                        ctx.beginPath();
                        ctx.moveTo(p1.x, p1.y);
                        ctx.lineTo(p2.x, p2.y);
                        
                        // Calculate opacity based on distance and depth (closer to front = brighter)
                        const depthAlpha = Math.min(1, Math.max(0, (200 - p1.z) / 300));
                        const alpha = (1 - dist / 55) * 0.18 * depthAlpha;
                        
                        // Mix colors based on node groups
                        ctx.strokeStyle = p1.colorGroup === 1 
                            ? `rgba(6, 182, 212, ${alpha})` 
                            : `rgba(99, 102, 241, ${alpha})`;
                        ctx.lineWidth = 0.8;
                        ctx.stroke();
                        connections++;
                    }
                }
            }

            // 5. Draw particles
            projectedParticles.forEach((p) => {
                const size = p.baseSize * p.scale * (1.2 + Math.sin(time * 0.03 + p.z * 0.05) * 0.2);
                
                // Color map
                let color;
                const alpha = Math.min(1, Math.max(0.15, (220 - p.z) / 300)) * 0.85;

                if (p.colorGroup === 0) {
                    color = `rgba(99, 102, 241, ${alpha})`; // Indigo
                } else if (p.colorGroup === 1) {
                    color = `rgba(6, 182, 212, ${alpha})`; // Cyan
                } else {
                    color = `rgba(168, 85, 247, ${alpha})`; // Violet
                }

                ctx.beginPath();
                ctx.arc(p.x, p.y, size, 0, Math.PI * 2);
                ctx.fillStyle = color;
                
                // Glow effect for front particles
                if (p.z < 0) {
                    ctx.shadowBlur = 8;
                    ctx.shadowColor = p.colorGroup === 1 ? '#06b6d4' : '#6366f1';
                } else {
                    ctx.shadowBlur = 0;
                }
                
                ctx.fill();
            });
            ctx.shadowBlur = 0; // Reset shadow blur

            // 6. Draw orbiting glowing data rings (large telemetry loops)
            // Ring 1 (Tilted X, slow spin)
            ctx.beginPath();
            const ringCount = 50;
            const orbitRadius = 150;
            for (let j = 0; j <= ringCount; j++) {
                const angle = (j / ringCount) * Math.PI * 2;
                const ox = orbitRadius * Math.cos(angle);
                const oz = orbitRadius * Math.sin(angle);
                const oy = Math.sin(time * 0.01) * 20; // slow wobble

                const pt = rotate3D(ox, oy, oz, currentAngleX * 0.8, currentAngleY * 0.6, time * 0.001);
                const screen = project(pt.x, pt.y, pt.z);

                if (j === 0) ctx.moveTo(screen.x, screen.y);
                else ctx.lineTo(screen.x, screen.y);
            }
            ctx.strokeStyle = `rgba(99, 102, 241, 0.18)`;
            ctx.lineWidth = 1.2;
            ctx.stroke();

            // Draw a glowing data "node" traversing this ring
            const orbitAngle = time * 0.008;
            const nodeX = orbitRadius * Math.cos(orbitAngle);
            const nodeZ = orbitRadius * Math.sin(orbitAngle);
            const nodeY = Math.sin(time * 0.01) * 20;
            const nodePt = rotate3D(nodeX, nodeY, nodeZ, currentAngleX * 0.8, currentAngleY * 0.6, time * 0.001);
            const nodeScreen = project(nodePt.x, nodePt.y, nodePt.z);
            
            // Draw node glow core
            ctx.beginPath();
            ctx.arc(nodeScreen.x, nodeScreen.y, 4 * nodeScreen.scale, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(6, 182, 212, ${0.9 * nodeScreen.scale})`;
            ctx.shadowBlur = 12;
            ctx.shadowColor = '#06b6d4';
            ctx.fill();
            ctx.shadowBlur = 0; // Reset

            // Draw connecting light beam to core occasionally
            if (Math.sin(time * 0.05) > 0.8) {
                ctx.beginPath();
                ctx.moveTo(nodeScreen.x, nodeScreen.y);
                ctx.lineTo(centerX, centerY);
                ctx.strokeStyle = `rgba(6, 182, 212, 0.07)`;
                ctx.lineWidth = 1;
                ctx.stroke();
            }

            animationFrameId = requestAnimationFrame(render);
        };

        render();

        return () => {
            window.removeEventListener('resize', resizeCanvas);
            if (container) {
                container.removeEventListener('mousemove', handleMouseMove);
                container.removeEventListener('mouseleave', handleMouseLeave);
            }
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    return (
        <div 
            ref={containerRef}
            className="w-full relative h-[440px] flex items-center justify-center cursor-default select-none overflow-visible"
        >
            {/* Projector Glow Base */}
            <div className="absolute bottom-[40px] w-[140px] h-[30px] rounded-full bg-cyan-500/10 blur-xl dark:bg-cyan-500/5"></div>
            
            {/* Canvas with Parallax */}
            <div 
                ref={canvasWrapperRef} 
                className="relative z-10 transition-transform duration-300 ease-out will-change-transform"
                style={{ transformStyle: 'preserve-3d' }}
            >
                <canvas 
                    ref={canvasRef} 
                    className="w-[500px] h-[440px]" 
                />
            </div>

            {/* Floating Glassmorphic HUD Panels (3D Parallax layered) */}
            <div 
                ref={cardsWrapperRef}
                className="absolute inset-0 w-full h-full pointer-events-none transition-transform duration-300 ease-out will-change-transform"
                style={{ transformStyle: 'preserve-3d' }}
            >
                {/* HUD 1: Core status (Top-Left) */}
                <div 
                    className="absolute top-[20px] left-[10px] sm:left-[30px] px-3.5 py-2.5 rounded-xl bg-indigo-950/40 dark:bg-slate-900/60 backdrop-blur-md border border-indigo-500/30 dark:border-indigo-500/20 shadow-[0_0_20px_rgba(99,102,241,0.15)] flex flex-col gap-1 transition-all duration-300 transform"
                    style={{ transform: 'translateZ(40px)' }}
                >
                    <div className="flex items-center gap-2">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                        </span>
                        <span className="text-[10px] font-bold tracking-widest text-indigo-200 uppercase">DATABASE CORE</span>
                    </div>
                    <span className="text-xs font-semibold text-emerald-400 font-mono">STATUS: ACTIVE</span>
                </div>

                {/* HUD 2: Data rate (Top-Right) */}
                <div 
                    className="absolute top-[50px] right-[10px] sm:right-[30px] px-3.5 py-2.5 rounded-xl bg-indigo-950/40 dark:bg-slate-900/60 backdrop-blur-md border border-indigo-500/30 dark:border-indigo-500/20 shadow-[0_0_20px_rgba(99,102,241,0.15)] flex flex-col gap-1 transition-all duration-300 transform"
                    style={{ transform: 'translateZ(30px)' }}
                >
                    <span className="text-[10px] font-bold tracking-widest text-cyan-400 uppercase">SYS TELEMETRY</span>
                    <div className="flex items-baseline gap-1.5">
                        <span className="text-sm font-black text-indigo-100 font-mono animate-pulse">1.48</span>
                        <span className="text-[10px] text-indigo-300 font-semibold">GB/s</span>
                    </div>
                    {/* Tiny animated signal bar */}
                    <div className="flex gap-0.5 mt-1 h-1.5 w-16">
                        <div className="bg-cyan-500/80 rounded-[1px] flex-1 animate-[bounce_1.2s_infinite_100ms]"></div>
                        <div className="bg-indigo-500/80 rounded-[1px] flex-1 animate-[bounce_1.2s_infinite_300ms]"></div>
                        <div className="bg-cyan-500/80 rounded-[1px] flex-1 animate-[bounce_1.2s_infinite_200ms]"></div>
                        <div className="bg-indigo-500/80 rounded-[1px] flex-1 animate-[bounce_1.2s_infinite_500ms]"></div>
                        <div className="bg-cyan-500/80 rounded-[1px] flex-1 animate-[bounce_1.2s_infinite_400ms]"></div>
                    </div>
                </div>

                {/* HUD 3: Node details (Bottom-Left) */}
                <div 
                    className="absolute bottom-[50px] left-[15px] sm:left-[45px] px-3.5 py-2.5 rounded-xl bg-indigo-950/40 dark:bg-slate-900/60 backdrop-blur-md border border-indigo-500/30 dark:border-indigo-500/20 shadow-[0_0_20px_rgba(99,102,241,0.15)] flex flex-col gap-1 transition-all duration-300 transform"
                    style={{ transform: 'translateZ(35px)' }}
                >
                    <span className="text-[10px] font-bold tracking-widest text-indigo-300 uppercase">SECURE NETWORK</span>
                    <span className="text-xs font-semibold text-cyan-400 font-mono">NODE: AES-256 / SHA</span>
                    <span className="text-[9px] text-indigo-400 font-mono">PORT // TLS-1.3</span>
                </div>

                {/* HUD 4: Node stats (Bottom-Right) */}
                <div 
                    className="absolute bottom-[20px] right-[15px] sm:right-[45px] px-3.5 py-2.5 rounded-xl bg-indigo-950/40 dark:bg-slate-900/60 backdrop-blur-md border border-indigo-500/30 dark:border-indigo-500/20 shadow-[0_0_20px_rgba(99,102,241,0.15)] flex flex-col gap-1 transition-all duration-300 transform"
                    style={{ transform: 'translateZ(45px)' }}
                >
                    <span className="text-[10px] font-bold tracking-widest text-indigo-300 uppercase">INTEGRITY</span>
                    <span className="text-xs font-bold text-indigo-100 font-mono">99.98% OK</span>
                </div>
            </div>
        </div>
    );
}
