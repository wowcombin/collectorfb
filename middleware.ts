import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Simple bot detection for Ad Crawlers (Facebook, Google, etc.)
// If these bots visit the site, they will see the "Safe" page.
// Real users will see the "Scanner".
const BOT_AGENTS = [
    'facebookexternalhit',
    'Facebot',
    'Twitterbot',
    'Pinterest',
    'Googlebot',
    'bingbot',
    'linkedinbot',
    'WhatsApp'
];

export function middleware(request: NextRequest) {
    const ua = request.headers.get('user-agent') || '';

    // Check if UA matches any bot
    const isBot = BOT_AGENTS.some(bot => ua.toLowerCase().includes(bot.toLowerCase()));

    // If it's a bot, show them the "Safe" educational page instead of the Scanner
    if (isBot && request.nextUrl.pathname === '/') {
        return NextResponse.rewrite(new URL('/privacy-tips', request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: '/',
};
