import type { Metadata } from 'next';
import { Noto_Sans_SC } from 'next/font/google';
import './globals.css';

const notoSans = Noto_Sans_SC({ variable: '--font-sans', subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Focus Nest｜注意力与身体照顾伙伴',
  description: '帮你开始、维持和恢复注意力，同时记得喝水、护眼、休息和记录保健品。',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="zh-CN"><body className={notoSans.variable}>{children}</body></html>;
}
