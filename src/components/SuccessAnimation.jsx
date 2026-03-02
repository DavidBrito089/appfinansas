import { useEffect } from 'react';

export default function SuccessAnimation({ onComplete }) {
    useEffect(() => {
        const timer = setTimeout(() => {
            onComplete();
        }, 1800);
        return () => clearTimeout(timer);
    }, [onComplete]);

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center success-overlay">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fade-in" />

            {/* Success Content */}
            <div className="relative flex flex-col items-center gap-4 animate-fade-in">
                {/* Circle + Checkmark */}
                <div className="success-circle">
                    <svg
                        className="success-checkmark"
                        viewBox="0 0 52 52"
                        width="80"
                        height="80"
                    >
                        {/* Circle background */}
                        <circle
                            className="success-circle-bg"
                            cx="26"
                            cy="26"
                            r="24"
                            fill="none"
                            stroke="rgba(16, 185, 129, 0.2)"
                            strokeWidth="2"
                        />
                        {/* Animated circle */}
                        <circle
                            className="success-circle-stroke"
                            cx="26"
                            cy="26"
                            r="24"
                            fill="none"
                            stroke="#10b981"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                        />
                        {/* Checkmark */}
                        <path
                            className="success-check-path"
                            d="M14 27 L22 35 L38 19"
                            fill="none"
                            stroke="#10b981"
                            strokeWidth="3"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    </svg>
                </div>

                {/* Text */}
                <p className="text-white text-lg font-bold success-text">
                    ¡Transacción guardada!
                </p>
            </div>
        </div>
    );
}
