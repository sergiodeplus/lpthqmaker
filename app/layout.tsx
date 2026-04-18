import type {Metadata} from 'next';
import { Bangers, Comic_Neue, Permanent_Marker, Special_Elite } from 'next/font/google';
import './globals.css';

const bangers = Bangers({ weight: '400', subsets: ['latin'], variable: '--font-bangers' });
const comicNeue = Comic_Neue({ weight: ['400', '700'], subsets: ['latin'], variable: '--font-comic-neue' });
const permanentMarker = Permanent_Marker({ weight: '400', subsets: ['latin'], variable: '--font-permanent-marker' });
const specialElite = Special_Elite({ weight: '400', subsets: ['latin'], variable: '--font-special-elite' });

export const metadata: Metadata = {
  title: 'Comic Maker ✦ HQ Studio',
  description: 'Create your own comic books!',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en">
      <body className={`${bangers.variable} ${comicNeue.variable} ${permanentMarker.variable} ${specialElite.variable} font-comic`} suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
