'use client';

import { ReminderCard } from './reminder-card';
import { useAttentionCompanion } from './use-attention-companion';

function formatClock(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  return `${String(minutes).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
}

function formatDue(timestamp: number, now: number) {
  if (!timestamp || !now) return '正在准备提醒';
  const minutes = Math.ceil((timestamp - now) / 60000);
  if (minutes <= 0) return '现在该做了';
  if (minutes < 60) return `${minutes} 分钟后`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest ? `${hours} 小时 ${rest} 分钟后` : `${hours} 小时后`;
}

export default function Home() {
  const companion = useAttentionCompanion();
  const { state, now, hydrated, focusRemaining, focusRunning, dueItems, notificationPermission } = companion;
  const today = new Intl.DateTimeFormat('zh-CN', {
    month: 'long', day: 'numeric', weekday: 'long',
  }).format(now);
  const waterPercent = Math.min(100, (state.waterCount / state.waterGoal) * 100);
  const catLevel = Math.floor(state.catXp / 40) + 1;
  const catProgress = state.catXp % 40;

  if (!hydrated) return <main className="loading-shell">正在唤醒你的专注伙伴…</main>;

  return (
    <main className="app-shell">
      <aside className="sidebar" aria-label="主导航">
        <a className="brand" href="#today" aria-label="Focus Nest 首页">
          <span className="brand-mark">芽</span><span>Focus Nest</span>
        </a>
        <nav>
          <a className="nav-item active" href="#today"><span>⌂</span>今天</a>
          <a className="nav-item" href="#care"><span>♡</span>身体照顾</a>
          <a className="nav-item" href="#rest"><span>◉</span>休息方法</a>
          <a className="nav-item" href="#companion"><span>♧</span>猫咪伙伴</a>
          <a className="nav-item" href="#settings"><span>⚙</span>提醒设置</a>
        </nav>
        <div className="sidebar-note"><span className="tiny-leaf">叶</span><p>照顾身体不是打断工作，而是让注意力走得更远。</p></div>
      </aside>

      <div className="main-column">
        <header className="topbar">
          <div><p className="eyebrow">{today}</p><h1>早上好，先照顾好下一步。</h1></div>
          <button className="notification-button" onClick={companion.requestNotifications}>
            <span aria-hidden="true">◌</span> {notificationPermission === 'granted' ? '系统提醒已开启' : '开启系统提醒'}
          </button>
        </header>

        {dueItems.length > 0 && (
          <section className="due-banner" aria-live="polite">
            <div><p className="eyebrow">温柔提醒</p><strong>{dueItems[0].title}</strong><span>{dueItems[0].detail}</span></div>
            <button onClick={dueItems[0].action}>{dueItems[0].actionLabel}</button>
          </section>
        )}

        <section className="focus-panel" id="today">
          <div className="focus-copy">
            <p className="eyebrow">现在，只做这一件事</p>
            <input aria-label="今天要专注的任务" value={state.task} onChange={(event) => companion.setTask(event.target.value)} placeholder="例如：先写下文章的三个小标题" />
            <p>不要求马上完成。先开始 5 分钟，进入状态后再决定是否继续。</p>
            <div className="focus-actions">
              <button className="primary-button" onClick={() => companion.prepareFocus(5)}>5 分钟，先开始</button>
              <button className="secondary-button" onClick={() => companion.prepareFocus(25)}>进入 25 分钟专注</button>
            </div>
          </div>
          <div className={`timer-card ${focusRunning ? 'timer-active' : ''}`}>
            <span className="timer-label">{focusRunning ? '正在专注' : '准备好了'}</span>
            <strong>{formatClock(focusRemaining)}</strong>
            <p>{state.task || '给这一段时间一个明确的小目标'}</p>
            <div className="timer-actions"><button onClick={companion.toggleFocus}>{focusRunning ? '暂停' : '开始'}</button><button onClick={companion.finishFocus}>结束并记录</button></div>
          </div>
        </section>

        <section className="section-block" id="care">
          <div className="section-heading"><div><p className="eyebrow">身体照顾</p><h2>今天的小提醒</h2></div><p>每一次记录，都会让猫咪获得一点成长值。</p></div>
          <div className="care-grid">
            <ReminderCard icon="水" tone="blue" title="喝一杯水" status={`${state.waterCount} / ${state.waterGoal} 杯`} detail={formatDue(state.nextWaterAt, now)} progress={waterPercent} actionLabel="我喝完了" onAction={companion.logWater} />
            <ReminderCard icon="眼" tone="green" title="让眼睛看远处" status={`今天完成 ${state.eyeCount} 次`} detail={formatDue(state.nextEyeAt, now)} actionLabel="开始 20 秒" onAction={companion.startEyeBreak} />
            <ReminderCard icon="晨" tone="amber" title="早餐后保健品" status={state.supplements.morning ? '今天已记录' : state.morningSupplement} detail={`提醒时间 ${state.morningTime}`} actionLabel={state.supplements.morning ? '已完成' : '记录完成'} disabled={state.supplements.morning} onAction={() => companion.logSupplement('morning')} />
            <ReminderCard icon="晚" tone="lavender" title="晚餐后保健品" status={state.supplements.evening ? '今天已记录' : state.eveningSupplement} detail={`提醒时间 ${state.eveningTime}`} actionLabel={state.supplements.evening ? '已完成' : '记录完成'} disabled={state.supplements.evening} onAction={() => companion.logSupplement('evening')} />
          </div>
        </section>

        <section className="rest-layout" id="rest">
          <div className="rest-guide">
            <div className="section-heading compact"><div><p className="eyebrow">恢复注意力</p><h2>坐久了，就按这个顺序休息</h2></div></div>
            <ol className="rest-steps">
              <li><span>20 秒</span><div><strong>看向 6 米外</strong><p>让眼睛离开屏幕，慢慢眨眼 10 次。</p></div></li>
              <li><span>30 秒</span><div><strong>温热手掌敷眼</strong><p>闭眼轻敷眼眶，不按压眼球；有不适就停止。</p></div></li>
              <li><span>60 秒</span><div><strong>起身伸展和呼吸</strong><p>放松肩颈，走几步，做 3 次缓慢深呼吸。</p></div></li>
            </ol>
            <button className="secondary-button wide" onClick={companion.startEyeBreak}>开始 20 秒护眼</button>
          </div>

          <div className="companion-card" id="companion">
            <div className="cat-scene" aria-label="一只正在陪你工作的猫"><span className="cat-ear left" /><span className="cat-ear right" /><span className="cat-face"><i /><i /><b /></span><span className="cat-body" /><span className="plant">♧</span></div>
            <p className="eyebrow">你的专注伙伴 · 等级 {catLevel}</p><h2>小满正在慢慢长大</h2><p>今天照顾自己，也是在照顾它。</p>
            <div className="xp-row"><span style={{ width: `${(catProgress / 40) * 100}%` }} /></div><small>{catProgress} / 40 成长值，解锁下一件房间物品</small>
          </div>
        </section>

        <section className="settings-panel" id="settings">
          <div className="section-heading compact"><div><p className="eyebrow">提醒设置</p><h2>按你的生活节奏调整</h2></div><p>保健品名称和时间由你自己设置；本产品不提供剂量或医疗建议。</p></div>
          <div className="settings-grid">
            <label>喝水间隔（分钟）<input type="number" min="15" max="240" value={state.waterInterval} onChange={(e) => companion.updateInterval('water', Number(e.target.value))} /></label>
            <label>护眼间隔（分钟）<input type="number" min="10" max="120" value={state.eyeInterval} onChange={(e) => companion.updateInterval('eye', Number(e.target.value))} /></label>
            <label>早餐后保健品<input value={state.morningSupplement} onChange={(e) => companion.updateSupplement('morning', e.target.value)} /></label>
            <label>早间提醒时间<input type="time" value={state.morningTime} onChange={(e) => companion.updateSupplementTime('morning', e.target.value)} /></label>
            <label>晚餐后保健品<input value={state.eveningSupplement} onChange={(e) => companion.updateSupplement('evening', e.target.value)} /></label>
            <label>晚间提醒时间<input type="time" value={state.eveningTime} onChange={(e) => companion.updateSupplementTime('evening', e.target.value)} /></label>
          </div>
        </section>

        <footer>Focus Nest · 帮你开始、维持、恢复注意力，也不忘记照顾自己。</footer>
      </div>

      {companion.eyeBreakRemaining > 0 && (
        <div className="eye-overlay" role="dialog" aria-modal="true" aria-label="护眼休息计时"><div><p className="eyebrow">把视线移到 6 米以外</p><strong>{companion.eyeBreakRemaining}</strong><h2>慢慢眨眼，肩膀放松。</h2><p>不需要盯住任何东西，让眼睛真正离开屏幕。</p><button onClick={companion.stopEyeBreak}>提前结束</button></div></div>
      )}
    </main>
  );
}
