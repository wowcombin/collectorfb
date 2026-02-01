'use client';
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { ShieldCheck, Search, Database, Lock, Globe } from "lucide-react";

export default function Scanner({ onComplete }: { onComplete: () => void }) {
    const [step, setStep] = useState(0);
    const steps = [
        { text: "Initializing Secure Connection...", icon: Lock },
        { text: "Analyzing TCP/IP Stack...", icon: Globe },
        { text: "Fingerprinting Browser Hardware...", icon: Search },
        { text: "Checking Database Leaks...", icon: Database },
        { text: "Calculating Safety Score...", icon: ShieldCheck },
    ];

    useEffect(() => {
        const interval = setInterval(() => {
            setStep((s) => {
                if (s >= steps.length - 1) {
                    clearInterval(interval);
                    setTimeout(onComplete, 1000);
                    return s;
                }
                return s + 1;
            });
        }, 1500); // 1.5 seconds per step
        return () => clearInterval(interval);
    }, [onComplete]);

    const CurrentIcon = steps[step].icon;

    return (
        <div className="w-full max-w-md mx-auto p-8 bg-cyber-panel border border-cyber-primary/30 rounded-lg shadow-[0_0_50px_rgba(0,255,65,0.1)] relative overflow-hidden">
            {/* Scan Line Animation */}
            <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-transparent via-cyber-primary/10 to-transparent h-[20%] w-full animate-scan-line" />

            <div className="flex flex-col items-center gap-6">
                <motion.div
                    key={step}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="p-4 rounded-full bg-cyber-primary/10 border border-cyber-primary text-cyber-primary"
                >
                    <CurrentIcon size={48} className="animate-pulse-fast" />
                </motion.div>

                <div className="text-center space-y-2">
                    <motion.h2
                        key={step + "text"}
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        className="text-xl font-mono text-cyber-primary font-bold"
                    >
                        {steps[step].text}
                    </motion.h2>
                    <div className="h-2 w-full bg-gray-800 rounded-full overflow-hidden">
                        <motion.div
                            className="h-full bg-cyber-primary"
                            initial={{ width: `${(step / steps.length) * 100}%` }}
                            animate={{ width: `${((step + 1) / steps.length) * 100}%` }}
                            transition={{ duration: 1.5, ease: "linear" }}
                        />
                    </div>
                    <p className="text-xs text-cyber-muted font-mono mt-2">
                        Module: {["NET_STACK", "CANVAS_FP", "AUDIO_CTX", "DB_CHECK", "FINAL_CALC"][step]}
                    </p>
                </div>
            </div>
        </div>
    );
}
