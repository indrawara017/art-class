import { ScrollViewStyleReset } from 'expo-router/html';
import { type PropsWithChildren } from 'react';

// This file is web-only and used to configure the root HTML for every
// web page during static rendering in Expo Router.
export default function Root({ children }: PropsWithChildren) {
  return (
    <html lang="id">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no, viewport-fit=cover" />
        
        <title>Art Class - Pembelajaran Interaktif Seni Budaya</title>
        <meta name="description" content="Media pembelajaran interaktif Seni Budaya dan Prakarya (SBdP) dengan petualangan pixel art, eksplorasi materi kreatif, kuis seru, dan galeri karya seni siswa." />

        {/* PWA Manifest */}
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#5bc9ff" />

        {/* iOS PWA Support */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Art Class" />
        <link rel="apple-touch-icon" href="/logo.png" />
        <link rel="apple-touch-icon" sizes="152x152" href="/icons/icon-152x152.png" />
        <link rel="apple-touch-icon" sizes="192x192" href="/icons/icon-192x192.png" />

        {/* Favicons */}
        <link rel="icon" type="image/png" href="/logo.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/icons/icon-48x48.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/icons/icon-48x48.png" />

        {/* Disable body scrolling on web for app-like feeling */}
        <ScrollViewStyleReset />

        {/* Service Worker Registration */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js').then(
                    function(registration) {
                      console.log('[PWA] Service Worker registered with scope:', registration.scope);
                    },
                    function(err) {
                      console.log('[PWA] Service Worker registration failed:', err);
                    }
                  );
                });
              }
            `,
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
