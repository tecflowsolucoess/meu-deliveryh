import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'MEU DELIVERYH',
  description: 'Gestão ágil para delivery individual',
  manifest: '/manifest.json', // <-- Linha que ativa o PWA
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <head>
        {/* Isso ajuda o celular a entender que é um app */}
        <meta name="theme-color" content="#2563eb" />
        <link rel="apple-touch-icon" href="/window.svg" />
      </head>
      <body className={inter.className} suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
