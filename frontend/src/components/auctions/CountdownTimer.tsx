import { useEffect } from 'react';
import { useAuctionStore } from '../../store/auctionStore';
import { formatCountdown } from '../../utils/formatters';
import { Clock } from 'lucide-react';

export const CountdownTimer = () => {
  const { timeLeft, setTimeLeft, currentAuction } = useAuctionStore();
  const isUrgent = timeLeft < 120_000 && timeLeft > 0;
  const isEnded = timeLeft <= 0;

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(Math.max(0, timeLeft - 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [timeLeft]);

  if (!currentAuction) return null;

  return (
    <div
      className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border ${
        isEnded
          ? 'border-dark-border text-muted'
          : isUrgent
          ? 'border-red-500/50 bg-red-500/10 text-red-400 animate-pulse'
          : 'border-primary/30 bg-primary/5 text-primary'
      }`}
      role="timer"
      aria-label={`Auction countdown: ${formatCountdown(timeLeft)}`}
    >
      <Clock size={14} />
      <span className="font-mono font-bold text-lg">{formatCountdown(timeLeft)}</span>
      {isUrgent && !isEnded && <span className="text-xs font-medium">ENDING SOON!</span>}
      {isEnded && <span className="text-xs font-medium">AUCTION ENDED</span>}
    </div>
  );
};
