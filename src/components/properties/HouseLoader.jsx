import React from "react";

/**
 * HouseLoader
 * Un cargador temático premium que dibuja una casa minimalista
 * y anima sus ventanas para una experiencia original.
 */
export default function HouseLoader() {
    return (
        <div className="d-flex flex-column align-items-center justify-content-center py-4">
            <style>{`
                @keyframes house-draw {
                    0% { stroke-dashoffset: 150; opacity: 0; }
                    20% { opacity: 1; }
                    70% { stroke-dashoffset: 0; }
                    100% { stroke-dashoffset: 0; opacity: 1; }
                }
                @keyframes window-glow {
                    0%, 100% { fill: transparent; }
                    50% { fill: #f59e0b; opacity: 0.6; }
                }
                @keyframes pulse-container {
                    0%, 100% { transform: scale(1); }
                    50% { transform: scale(1.02); }
                }
                .house-loader-svg {
                    animation: pulse-container 2s ease-in-out infinite;
                }
                .house-outline {
                    stroke-dasharray: 150;
                    stroke-dashoffset: 150;
                    animation: house-draw 2.5s cubic-bezier(0.4, 0, 0.2, 1) infinite;
                }
                .window-1 { animation: window-glow 2.5s infinite 0.5s; }
                .window-2 { animation: window-glow 2.5s infinite 1s; }
                .door-glow { animation: window-glow 2.5s infinite 1.5s; }
            `}</style>
            
            <svg 
                width="100" 
                height="100" 
                viewBox="0 0 60 60" 
                fill="none" 
                className="house-loader-svg"
                xmlns="http://www.w3.org/2000/svg"
            >
                {/* House Structure */}
                <path 
                    d="M10 25 L30 10 L50 25 V50 H10 V25 Z" 
                    stroke="#2563eb" 
                    strokeWidth="1.5" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                    className="house-outline"
                />
                
                {/* Windows */}
                <rect x="18" y="28" width="8" height="8" rx="1" stroke="#2563eb" strokeWidth="1" className="window-1" />
                <rect x="34" y="28" width="8" height="8" rx="1" stroke="#2563eb" strokeWidth="1" className="window-2" />
                
                {/* Door */}
                <path d="M26 50 V38 H34 V50" stroke="#2563eb" strokeWidth="1.5" className="door-glow" />
                
                {/* Ground Line */}
                <line x1="5" y1="50" x2="55" y2="50" stroke="#e2e8f0" strokeWidth="1" strokeLinecap="round" />
            </svg>
            
            <p 
                className="mt-3 fw-bold text-primary text-uppercase" 
                style={{ fontSize: "0.75rem", letterSpacing: "0.15em", opacity: 0.8 }}
            >
                Cargando propiedades...
            </p>
        </div>
    );
}
