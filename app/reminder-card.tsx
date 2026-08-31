type ReminderCardProps = {
  icon: string;
  tone: 'blue' | 'green' | 'amber' | 'lavender';
  title: string;
  status: string;
  detail: string;
  progress?: number;
  actionLabel: string;
  disabled?: boolean;
  onAction: () => void;
};

export function ReminderCard({ icon, tone, title, status, detail, progress, actionLabel, disabled, onAction }: ReminderCardProps) {
  return (
    <article className={`reminder-card ${tone}`}>
      <div className="reminder-icon" aria-hidden="true">{icon}</div>
      <div className="reminder-copy"><h3>{title}</h3><strong>{status}</strong><p>{detail}</p></div>
      {typeof progress === 'number' && <div className="progress-track" aria-label={`完成进度 ${Math.round(progress)}%`}><span style={{ width: `${progress}%` }} /></div>}
      <button disabled={disabled} onClick={onAction}>{actionLabel}</button>
    </article>
  );
}
