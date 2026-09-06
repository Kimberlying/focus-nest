import type { AttentionCompanion } from './use-attention-companion';
import type { PanelName } from './companion-panel';

type CareRailProps = {
  companion: AttentionCompanion;
  onOpen: (name: Exclude<PanelName, null>) => void;
};

function dueText(timestamp: number, now: number) {
  const minutes = Math.ceil((timestamp - now) / 60000);
  if (minutes <= 0) return '现在该做了';
  if (minutes < 60) return `${minutes} 分钟后`;
  return `${Math.floor(minutes / 60)} 小时后`;
}

export function CareRail({ companion, onOpen }: CareRailProps) {
  const { state, now } = companion;
  const supplementDone = Number(state.supplements.morning) + Number(state.supplements.evening);
  const catLevel = Math.floor(state.catXp / 40) + 1;

  return (
    <section className="care-rail" aria-label="今天的身体照顾">
      <article className="care-chip blue">
        <span className="chip-icon">水</span>
        <span><b>{state.waterCount} / {state.waterGoal} 杯水</b><small>{dueText(state.nextWaterAt, now)}</small></span>
        <button onClick={companion.logWater}>喝完了</button>
      </article>
      <article className="care-chip green">
        <span className="chip-icon">眼</span>
        <span><b>20-20-20 护眼</b><small>{dueText(state.nextEyeAt, now)}</small></span>
        <button onClick={companion.startEyeBreak}>休息</button>
      </article>
      <article className="care-chip amber">
        <span className="chip-icon">补</span>
        <span><b>保健品 {supplementDone} / 2</b><small>按你的时间提醒</small></span>
        <button onClick={() => onOpen('care')}>查看</button>
      </article>
      <article className="care-chip rose">
        <span className="chip-icon">猫</span>
        <span><b>小满 · 等级 {catLevel}</b><small>{state.catXp % 40} / 40 成长值</small></span>
        <button onClick={() => onOpen('companion')}>陪伴</button>
      </article>
    </section>
  );
}
