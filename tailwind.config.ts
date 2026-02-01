import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                cyber: {
                    bg: "#050505",
                    panel: "#0a0a0a",
                    primary: "#00ff41", // Matrix Green
                    secondary: "#008F11",
                    accent: "#003b00",
                    text: "#e0e0e0",
                    muted: "#666666",
                    danger: "#ff3333"
                }
            },
            backgroundImage: {
                "grid-pattern": "linear-gradient(to right, #111 1px, transparent 1px), linear-gradient(to bottom, #111 1px, transparent 1px)",
            },
            animation: {
                "scan-line": "scan 2s linear infinite",
                "pulse-fast": "pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite",
            },
            keyframes: {
                scan: {
                    "0%": { top: "0%" },
                    "100%": { top: "100%" },
                }
            }
        },
    },
    plugins: [],
};
export default config;
