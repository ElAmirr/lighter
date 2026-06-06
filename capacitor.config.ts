import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
    appId: 'tn.davay.lighter',
    appName: 'Davay Lighter',
    webDir: 'public',
    server: {
        // Note: Since this is a full-stack Next.js app with /api endpoints, 
        // it cannot be fully statically exported into an APK without server logic.
        // The most efficient and bullet-proof method to "turn it into an android app" 
        // is to point Capacitor directly to your live production Render URL.
        url: 'https://lighter-vchq.onrender.com',
        cleartext: true
    }
};

export default config;
