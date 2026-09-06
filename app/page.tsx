'use client';

import { useEffect, useState } from 'react';
import { CareRail } from './care-rail';
import { CompanionPanel, type PanelName } from './companion-panel';
import { useAttentionCompanion } from './use-attention-companion';

const VIDEO_URL = 'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260831_232706_43757be4-2250-4f09-8cd7-23aebbf147ad.mp4';
const POSTER_URL = 'https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260831_223518_f11bfa03-4e65-47e1-a4a7-30e42a7a8c2f.png&w=1920&q=85';

function formatClock(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  return `${String(minutes).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
}

export default function Home() {
  const companion = useAttentionCompanion();
  const [menuOpen, setMenuOpen] = useState(false);
  const [panel, setPanel] = useState<PanelName>(null);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') { setMenuOpen(false); setPanel(null); }
    }
    function onResize() {
      if (window.innerWidth >= 900) setMenuOpen(false);
    }
    document.body.classList.toggle('menu-open', menuOpen || panel !== null);
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('resize', onResize);
      document.body.classList.remove('menu-open');
    };
  }, [menuOpen, panel]);

  if (!companion.hydrated) return <main className="loading-shell">正在唤醒你的专注伙伴…</main>;

  const startFocus = (minutes: number) => {
    companion.prepareFocus(minutes);
    setMenuOpen(false);
  };

  const openPanel = (name: Exclude<PanelName, null>) => {
    setPanel(name);
    setMenuOpen(false);
  };

  return (
    <main className="hero">
      <div className="hero-bg" aria-hidden="true">
        <video autoPlay muted loop playsInline preload="auto" poster={POSTER_URL}>
          <source src={VIDEO_URL} type="video/mp4" />
        </video>
      </div>

      <div className="hero-inner">
        <header className="nav">
          <a className="brand" href="#top" aria-label="Focus Nest 首页">
            <span className="brand-gem rise" style={{ '--i': 0 } as React.CSSProperties}><i /></span>
            <span className="rise" style={{ '--i': 1 } as React.CSSProperties}>Focus Nest</span>
          </a>

          <nav className={`nav-menu ${menuOpen ? 'is-open' : ''}`} id="site-menu">
            <ul className="nav-links">
              <li><button onClick={() => openPanel('care')}>今日照顾</button></li>
              <li><button onClick={() => openPanel('rest')}>休息方法</button></li>
              <li><button onClick={() => openPanel('companion')}>猫咪伙伴</button></li>
              <li><button onClick={() => openPanel('settings')}>提醒设置</button></li>
            </ul>
            <button className="dark-button menu-cta" onClick={companion.requestNotifications}>开启系统提醒</button>
          </nav>

          <div className="nav-cta rise" style={{ '--i': 6 } as React.CSSProperties}>
            <button className="dark-button" onClick={companion.requestNotifications}>
              {companion.notificationPermission === 'granted' ? '提醒已开启' : '开启系统提醒'}
            </button>
          </div>

          <button className="menu-toggle rise" style={{ '--i': 6 } as React.CSSProperties} type="button" aria-label={menuOpen ? '关闭菜单' : '打开菜单'} aria-expanded={menuOpen} aria-controls="site-menu" onClick={() => setMenuOpen((open) => !open)}>
            <span className="toggle-box" aria-hidden="true"><span className="bar bar-top" /><span className="bar bar-bottom" /></span>
          </button>
        </header>

        {companion.dueItems.length > 0 && (
          <div className="due-toast" role="status">
            <span><b>{companion.dueItems[0].title}</b>{companion.dueItems[0].detail}</span>
            <button onClick={companion.dueItems[0].action}>{companion.dueItems[0].actionLabel}</button>
          </div>
        )}

        <section className="stage" id="top">
          <div className="badge rise" style={{ '--i': 8 } as React.CSSProperties}>
            <span className="badge-tag">今天</span>
            <span>喝水 {companion.state.waterCount} 杯 · 护眼 {companion.state.eyeCount} 次</span>
          </div>

          <h1 className="headline rise" style={{ '--i': 10 } as React.CSSProperties}>
            把注意力放回<br className="wide-break" />真正重要的事。
          </h1>
          <p className="sub rise" style={{ '--i': 12 } as React.CSSProperties}>
            帮你开始、维持和恢复注意力，也提醒你喝水、护眼和照顾身体。
          </p>

          <form className="focus-card rise" style={{ '--i': 14 } as React.CSSProperties} onSubmit={(event) => { event.preventDefault(); startFocus(5); }}>
            <label className="sr-only" htmlFor="focus-task">现在要开始做什么？</label>
            <textarea id="focus-task" rows={2} value={companion.state.task} onChange={(event) => companion.setTask(event.target.value)} placeholder="现在要开始做什么？先写下一个最小动作。" />
            <div className="focus-bar">
              <button className="round-button" type="button" aria-label="打开提醒设置" onClick={() => openPanel('settings')}>＋</button>
              <div className="focus-controls">
                <button className="duration-button" type="button" onClick={() => startFocus(5)}>5 分钟</button>
                <button className="duration-button" type="button" onClick={() => startFocus(25)}>25 分钟</button>
                <span className={`timer ${companion.focusRunning ? 'is-running' : ''}`}>{formatClock(companion.focusRemaining)}</span>
                <button className="send-button" type="button" aria-label={companion.focusRunning ? '暂停专注' : '开始专注'} onClick={companion.focusRunning ? companion.toggleFocus : () => startFocus(5)}>
                  {companion.focusRunning ? 'Ⅱ' : '→'}
                </button>
              </div>
            </div>
            {companion.focusRunning && (
              <div className="session-line"><span>正在陪你做：{companion.state.task || '这一个最小动作'}</span><button type="button" onClick={companion.finishFocus}>结束并记录</button></div>
            )}
          </form>
        </section>

        <CareRail companion={companion} onOpen={openPanel} />
      </div>

      <CompanionPanel active={panel} companion={companion} onClose={() => setPanel(null)} />

      {companion.eyeBreakRemaining > 0 && (
        <div className="eye-overlay" role="dialog" aria-modal="true" aria-label="20 秒护眼休息">
          <div><p>看向 6 米以外</p><strong>{companion.eyeBreakRemaining}</strong><h2>慢慢眨眼，放松肩膀。</h2><span>让眼睛真正离开屏幕，不需要盯住任何东西。</span><button onClick={companion.stopEyeBreak}>提前结束</button></div>
        </div>
      )}
    </main>
  );
}
