import { LucideIcon } from 'lucide-react';

interface SummaryCardProps {
  label: string;
  count: string | number;
  icon: LucideIcon;
  trend?: string;
  trendUp?: boolean;
  color?: string;
}

export function SummaryCard({ label, count, icon: Icon, trend, trendUp, color = 'text-primary' }: SummaryCardProps) {
  return (
    <div className="bg-dark-card border border-dark-border p-6 rounded-xl hover:border-primary/50 transition-all duration-300 group">
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-lg bg-white/5 ${color} group-hover:bg-white/10 transition-colors`}>
          <Icon size={24} />
        </div>
        {trend && (
          <span className={`text-xs font-bold px-2 py-1 rounded-full ${trendUp ? 'bg-secondary/10 text-secondary' : 'bg-destructive/10 text-destructive'}`}>
            {trendUp ? '+' : ''}{trend}
          </span>
        )}
      </div>
      <div>
        <p className="text-3xl font-display font-bold text-white mb-1">{count}</p>
        <p className="text-xs text-muted font-medium uppercase tracking-widest">{label}</p>
      </div>
    </div>
  );
}
