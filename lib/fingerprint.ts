// Advanced Fingerprinting Logic (CreepJS Level)

export interface FingerprintData {
    collectedAt: string;
    // Basic
    userAgent: string;
    language: string;
    platform: string;
    hardwareConcurrency: number;
    deviceMemory?: number;
    // Screen & Window
    screen: Record<string, any>;
    window: Record<string, any>;
    // Graphics
    canvas: {
        dataUrl?: string;
        hash?: number;
        geometryHash?: number; // Winding rule test
        textHash?: number;
    };
    webgl: {
        vendor?: string;
        renderer?: string;
        version?: string;
        extensions?: string[];
        aliasedLineWidthRange?: number[];
        aliasedPointSizeRange?: number[];
    };
    // Audio
    audio: {
        hash?: number;
        dynamicsCompressor?: number;
        oscillator?: number;
    };
    // Font Enumeration
    fonts: string[];
    // Worker Scope (Consistency Check)
    worker?: Record<string, any>;
    // Network / IP
    timezone: string;
    timezoneOffset: number;
}

export async function collectFingerprint(): Promise<FingerprintData> {
    const fp: any = {
        collectedAt: new Date().toISOString(),
        userAgent: navigator.userAgent,
        language: navigator.language,
        platform: navigator.platform,
        hardwareConcurrency: navigator.hardwareConcurrency,
        deviceMemory: (navigator as any).deviceMemory,
        screen: {},
        window: {},
        canvas: {},
        webgl: {},
        audio: {},
        fonts: [],
        worker: {}
    };

    // 1. Screen & Window Depth
    fp.screen = {
        width: screen.width,
        height: screen.height,
        availWidth: screen.availWidth,
        availHeight: screen.availHeight,
        colorDepth: screen.colorDepth,
        pixelDepth: screen.pixelDepth,
        devicePixelRatio: window.devicePixelRatio,
    };
    fp.window = {
        innerWidth: window.innerWidth,
        innerHeight: window.innerHeight,
        outerWidth: window.outerWidth,
        outerHeight: window.outerHeight,
        screenX: window.screenX,
        screenY: window.screenY,
    };

    // 2. Timezone
    try {
        fp.timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        fp.timezoneOffset = new Date().getTimezoneOffset();
    } catch (e) { }

    // 3. Canvas Geometry & Text
    try {
        const doc = document;
        const canvas = doc.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (ctx) {
            // Text Hash
            canvas.width = 280;
            canvas.height = 60;
            ctx.textBaseline = "alphabetic";
            ctx.fillStyle = "#f60";
            ctx.fillRect(125, 1, 62, 20);
            ctx.fillStyle = "#069";
            ctx.font = "11pt no-real-font-123";
            ctx.fillText("Cwm fjordbank glyphs vext quiz, \ud83d\ude03", 2, 15);
            ctx.fillStyle = "rgba(102, 204, 0, 0.7)";
            ctx.font = "18pt Arial";
            ctx.fillText("Cwm fjordbank glyphs vext quiz, \ud83d\ude03", 4, 45);
            fp.canvas.textHash = xMurmurHash3(canvas.toDataURL());

            // Geometry (Winding) Hash
            const cvs2 = doc.createElement('canvas');
            const ctx2 = cvs2.getContext('2d');
            if (ctx2) {
                cvs2.width = 100;
                cvs2.height = 100;
                ctx2.beginPath();
                ctx2.arc(50, 50, 50, 0, Math.PI * 2, true);
                ctx2.arc(50, 50, 25, 0, Math.PI * 2, true);
                ctx2.fillStyle = '#ff00ff';
                ctx2.fill('evenodd');
                fp.canvas.geometryHash = xMurmurHash3(cvs2.toDataURL());
            }
        }
    } catch (e) { }

    // 4. WebGL Deep
    try {
        const gl = document.createElement('canvas').getContext('webgl');
        if (gl) {
            const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
            fp.webgl = {
                vendor: gl.getParameter(debugInfo?.UNMASKED_VENDOR_WEBGL || 0),
                renderer: gl.getParameter(debugInfo?.UNMASKED_RENDERER_WEBGL || 0),
                version: gl.getParameter(gl.VERSION),
                shadingLanguageVersion: gl.getParameter(gl.SHADING_LANGUAGE_VERSION),
                extensions: gl.getSupportedExtensions() || [],
                aliasedLineWidthRange: gl.getParameter(gl.ALIASED_LINE_WIDTH_RANGE),
                aliasedPointSizeRange: gl.getParameter(gl.ALIASED_POINT_SIZE_RANGE)
            };
        }
    } catch (e) { }

    // 5. Audio Dynamics
    try {
        const audioCtx = new (window.OfflineAudioContext || (window as any).webkitOfflineAudioContext)(1, 44100, 44100);

        // Oscillator Node
        const oscillator = audioCtx.createOscillator();
        oscillator.type = 'triangle';
        oscillator.frequency.value = 10000;

        // Compressor Node
        const compressor = audioCtx.createDynamicsCompressor();
        compressor.threshold.value = -50;
        compressor.knee.value = 40;
        compressor.ratio.value = 12;
        compressor.reduction.value = -20;
        compressor.attack.value = 0;
        compressor.release.value = 0.25;

        oscillator.connect(compressor);
        compressor.connect(audioCtx.destination);
        oscillator.start(0);

        const buffer = await audioCtx.startRendering();
        fp.audio.hash = xMurmurHash3(buffer.getChannelData(0).toString());
        fp.audio.dynamicsCompressor = compressor.reduction.value; // Snapshot value
    } catch (e) { fp.audio.error = String(e); }

    // 6. Font Enumeration (Expanded)
    try {
        // Common + Mac/Win specific fonts to detect OS truth
        const fontBase = [
            'Arial', 'Helvetica', 'Times New Roman', 'Courier New', 'Verdana', 'Georgia', 'Palatino', 'Garamond',
            'Bookman', 'Comic Sans MS', 'Trebuchet MS', 'Arial Black', 'Impact', 'Tahoma', 'Geneva', 'Lucida Console',
            // Mac Specific
            'San Francisco', 'Helvetica Neue', 'Monaco', 'Menlo', 'Chalkboard', 'PingFang SC', 'Hiragino Sans',
            // Windows Specific
            'Segoe UI', 'Consolas', 'Cambria', 'Calibri', 'Roboto', 'Ubuntu', 'Segoe Script', 'Microsoft Sans Serif'
        ];
        fp.fonts = await detectFonts(fontBase);
    } catch (e) { }

    // 7. Worker Scope (Detecting JS Environment Inconsistencies)
    try {
        fp.worker = await getWorkerData();
    } catch (e) { }

    return fp;
}

// --- HELPERS ---

function xMurmurHash3(key: string, seed = 0) {
    let h1 = 0xdeadbeef ^ seed, h2 = 0x41c6ce57 ^ seed;
    for (let i = 0, ch; i < key.length; i++) {
        ch = key.charCodeAt(i);
        h1 = Math.imul(h1 ^ ch, 2654435761);
        h2 = Math.imul(h2 ^ ch, 1597334677);
    }
    h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
    h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
    return 4294967296 * (2097151 & h2) + (h1 >>> 0);
}

async function detectFonts(fonts: string[]) {
    await document.fonts.ready;
    const available: string[] = [];
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return [];

    // Use a large monospace font fallback to detect width variance
    const text = "mmmmmmmmmmlli";
    ctx.font = "72px monospace";
    const baselineWidth = ctx.measureText(text).width;

    for (const font of fonts) {
        ctx.font = "72px '" + font + "', monospace";
        if (ctx.measureText(text).width !== baselineWidth) {
            available.push(font);
        }
    }
    return available;
}

// Spawns a worker to collect data from a different thread
async function getWorkerData(): Promise<any> {
    return new Promise((resolve) => {
        const script = `
            self.onmessage = () => {
                const data = {
                    userAgent: navigator.userAgent,
                    platform: navigator.platform,
                    hardwareConcurrency: navigator.hardwareConcurrency,
                    deviceMemory: navigator.deviceMemory,
                    languages: navigator.languages,
                    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
                };
                self.postMessage(data);
            };
        `;
        const blob = new Blob([script], { type: 'application/javascript' });
        const worker = new Worker(URL.createObjectURL(blob));

        worker.onmessage = (e) => {
            resolve(e.data);
            worker.terminate();
        };

        // Timeout check
        setTimeout(() => {
            resolve({ error: "Worker timed out" });
            worker.terminate();
        }, 1000);

        worker.postMessage('start');
    });
}
