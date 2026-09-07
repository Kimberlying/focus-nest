import type { Metadata } from 'next';
import { Noto_Sans_SC } from 'next/font/google';
import './globals.css';

const notoSans = Noto_Sans_SC({ variable: '--font-sans', subsets: ['latin'] });

export const metadata: Metadata = {
  metadataBase: new URL('https://focus-nest.king-1-5387.chatgpt.site'),
  title: 'Focus Nest｜注意力与身体照顾伙伴',
  description: '帮你开始、维持和恢复注意力，同时记得喝水、护眼、休息和记录保健品。',
  openGraph: {
    title: 'Focus Nest｜把注意力放回真正重要的事',
    description: '专注、喝水、护眼，也记得照顾自己。',
    url: '/',
    siteName: 'Focus Nest',
    locale: 'zh_CN',
    type: 'website',
    images: [{ url: '/og.png', width: 1731, height: 909, alt: 'Focus Nest 与橘色猫咪伙伴' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Focus Nest｜把注意力放回真正重要的事',
    description: '专注、喝水、护眼，也记得照顾自己。',
    images: ['/og.png'],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="zh-CN"><body className={notoSans.variable}>{children}</body></html>;
}
