export default function PrivacyTips() {
    return (
        <main className="min-h-screen bg-white text-gray-900 font-sans p-8">
            <div className="max-w-2xl mx-auto space-y-6">
                <h1 className="text-3xl font-bold text-blue-600">5 Essential Tips for Digital Privacy</h1>
                <p className="text-lg text-gray-700">In today's interconnected world, securing your digital footprint is more important than ever. Here are standard recommendations from security experts.</p>

                <section>
                    <h2 className="text-xl font-semibold mb-2">1. Use Strong, Unique Passwords</h2>
                    <p className="text-gray-600">Never reuse passwords across different sites. Use a password manager to generate complex keys.</p>
                </section>

                <section>
                    <h2 className="text-xl font-semibold mb-2">2. Enable Two-Factor Authentication (2FA)</h2>
                    <p className="text-gray-600">Adding a second layer of security drastically reduces the risk of unauthorized access.</p>
                </section>

                <section>
                    <h2 className="text-xl font-semibold mb-2">3. Be Wary of Public Wi-Fi</h2>
                    <p className="text-gray-600">Public networks are often unsecured. Avoid accessing sensitive financial data while connected to them.</p>
                </section>

                <section>
                    <h2 className="text-xl font-semibold mb-2">4. Keep Software Updated</h2>
                    <p className="text-gray-600">Updates often contain critical security patches that protect against known vulnerabilities.</p>
                </section>

                <div className="pt-8 border-t text-sm text-gray-500">
                    © 2024 NetShield Privacy Blog. All rights reserved.
                </div>
            </div>
        </main>
    );
}
