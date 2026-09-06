import Image from 'next/image';
import type { AttentionCompanion } from './use-attention-companion';
import { getCatGrowth } from './cat-growth';

export type PanelName = 'care' | 'rest' | 'companion' | 'settings' | null;

type CompanionPanelProps = {
  active: PanelName;
  companion: AttentionCompanion;
  onClose: () => void;
};

export function CompanionPanel({ active, companion, onClose }: CompanionPanelProps) {
  if (!active) return null;
  const { state } = companion;
  const cat = getCatGrowth(state.catXp);

  return (
    <div className="panel-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <section className="side-panel" role="dialog" aria-modal="true" aria-labelledby="panel-title">
        <header><span className="panel-kicker">Focus Nest</span><button onClick={onClose} aria-label="关闭">×</button></header>

        {active === 'care' && (
          <div className="panel-content">
            <h2 id="panel-title">今天照顾好自己</h2><p className="panel-intro">完成后点一下，提醒会留在今天的记录里。</p>
            <div className="care-actions">
              <article><span className="action-icon blue">水</span><div><b>喝一杯水</b><small>今天 {state.waterCount} / {state.waterGoal} 杯</small></div><button onClick={companion.logWater}>喝完了</button></article>
              <article><span className="action-icon green">眼</span><div><b>20 秒看远处</b><small>今天完成 {state.eyeCount} 次</small></div><button onClick={companion.startEyeBreak}>开始</button></article>
              <article><span className="action-icon green">早</span><div><b>早间眼部按摩</b><small>{state.massageMorningTime} · 轻触眼眶周围</small></div><button disabled={state.eyeMassages.morning} onClick={() => companion.logEyeMassage('morning')}>{state.eyeMassages.morning ? '已记录' : '完成'}</button></article>
              <article><span className="action-icon green">睡</span><div><b>睡前眼部按摩</b><small>{state.massageBedtimeTime} · 温热手掌轻敷</small></div><button disabled={state.eyeMassages.bedtime} onClick={() => companion.logEyeMassage('bedtime')}>{state.eyeMassages.bedtime ? '已记录' : '完成'}</button></article>
              <article><span className="action-icon amber">晨</span><div><b>{state.morningSupplement}</b><small>{state.morningTime} · 早餐后</small></div><button disabled={state.supplements.morning} onClick={() => companion.logSupplement('morning')}>{state.supplements.morning ? '已记录' : '完成'}</button></article>
              <article><span className="action-icon rose">晚</span><div><b>{state.eveningSupplement}</b><small>{state.eveningTime} · 晚餐后</small></div><button disabled={state.supplements.evening} onClick={() => companion.logSupplement('evening')}>{state.supplements.evening ? '已记录' : '完成'}</button></article>
              <article><span className="action-icon violet">力</span><div><b>本周力量训练</b><small>{state.strengthCount >= 3 ? '3 / 2 次 · 已超额完成' : `${state.strengthCount} / 2 次 · 第 3 次算超额`}</small></div><button disabled={state.strengthCount >= 3} onClick={companion.logStrength}>{state.strengthCount >= 3 ? '超额完成' : '完成一次'}</button></article>
            </div>
          </div>
        )}

        {active === 'rest' && (
          <div className="panel-content">
            <h2 id="panel-title">两分钟恢复注意力</h2><p className="panel-intro">休息不是刷手机。让视线、姿势和呼吸真正离开刚才的工作。</p>
            <ol className="rest-list">
              <li><span>20 秒</span><div><b>看向 6 米外</b><p>慢慢眨眼 10 次，让眼睛离开屏幕。</p></div></li>
              <li><span>30 秒</span><div><b>温热手掌轻敷</b><p>闭眼轻敷眼眶，不按压眼球；不舒服就停止。</p></div></li>
              <li><span>60 秒</span><div><b>起身伸展和呼吸</b><p>放松肩颈、走几步，做 3 次缓慢深呼吸。</p></div></li>
            </ol>
            <button className="panel-primary" onClick={companion.startEyeBreak}>开始 20 秒护眼</button>
          </div>
        )}

        {active === 'companion' && (
          <div className="panel-content companion-content">
            <h2 id="panel-title">小满正在一点点长大</h2><p className="panel-intro">喝水、护眼、按摩、力量训练和完成专注都会获得成长值。</p>
            <div className="cat-room" aria-label={`3D 猫咪小满，${cat.stage}`}><Image className="cat-3d" src={cat.image} alt={`小满的${cat.stage}形态`} width={285} height={286} style={{ '--cat-scale': cat.scale } as React.CSSProperties} /><span className="room-plant">♧</span></div>
            <div className="level-row"><span>{cat.stage}</span><b>累计 {state.catXp} 点</b></div>
            <div className="xp-track"><span style={{ width: `${cat.progress}%` }} /></div>
            <p className="unlock-copy">{cat.remaining > 0 ? `再积累 ${cat.remaining} 点成长值，进入${cat.nextStage}。` : '已经长成健康的成年猫，继续积累可以布置完整房间。'}</p>
          </div>
        )}

        {active === 'settings' && (
          <div className="panel-content">
            <h2 id="panel-title">设置你的提醒节奏</h2><p className="panel-intro">保健品名称和时间由你填写；这里不提供剂量或医疗建议。</p>
            <div className="setting-list">
              <label>喝水间隔（分钟）<input type="number" min="15" max="240" value={state.waterInterval} onChange={(event) => companion.updateInterval('water', Number(event.target.value))} /></label>
              <label>护眼间隔（分钟）<input type="number" min="10" max="120" value={state.eyeInterval} onChange={(event) => companion.updateInterval('eye', Number(event.target.value))} /></label>
              <label>早间眼部按摩<input type="time" value={state.massageMorningTime} onChange={(event) => companion.updateMassageTime('morning', event.target.value)} /></label>
              <label>睡前眼部按摩<input type="time" value={state.massageBedtimeTime} onChange={(event) => companion.updateMassageTime('bedtime', event.target.value)} /></label>
              <label>早餐后保健品<input value={state.morningSupplement} onChange={(event) => companion.updateSupplement('morning', event.target.value)} /></label>
              <label>早间提醒时间<input type="time" value={state.morningTime} onChange={(event) => companion.updateSupplementTime('morning', event.target.value)} /></label>
              <label>晚餐后保健品<input value={state.eveningSupplement} onChange={(event) => companion.updateSupplement('evening', event.target.value)} /></label>
              <label>晚间提醒时间<input type="time" value={state.eveningTime} onChange={(event) => companion.updateSupplementTime('evening', event.target.value)} /></label>
            </div>
            <button className="panel-primary" onClick={companion.requestNotifications}>{companion.notificationPermission === 'granted' ? '系统提醒已开启' : '开启系统提醒'}</button>
          </div>
        )}
      </section>
    </div>
  );
}
