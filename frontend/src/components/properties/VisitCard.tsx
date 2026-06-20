import { Calendar, Clock, MapPin, User, Phone } from 'lucide-react';

interface VisitCardProps {
  visit: {
    id: string;
    propertyTitle: string;
    image: string;
    location: string;
    date: string;
    time: string;
    sellerName: string;
    status: 'upcoming' | 'completed' | 'cancelled';
  };
}

export function VisitCard({ visit }: VisitCardProps) {
  return (
    <div className="bg-dark-card border border-dark-border rounded-xl p-5 hover:border-primary/30 transition-all duration-300 flex flex-col md:flex-row gap-5">
      <div className="w-full md:w-32 h-32 shrink-0 rounded-lg overflow-hidden relative">
        <img src={visit.image} alt={visit.propertyTitle} className="w-full h-full object-cover" />
        {visit.status !== 'upcoming' && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-[2px]">
            <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded border ${visit.status === 'completed' ? 'border-secondary text-secondary bg-secondary/20' : 'border-destructive text-destructive bg-destructive/20'}`}>
              {visit.status}
            </span>
          </div>
        )}
      </div>

      <div className="flex-1 flex flex-col justify-between">
        <div>
          <h3 className="text-white font-bold text-lg mb-1">{visit.propertyTitle}</h3>
          <div className="flex items-center gap-1 text-muted text-xs mb-4">
            <MapPin size={12} />
            <span>{visit.location}</span>
          </div>

          <div className="flex flex-wrap gap-4 mb-4">
            <div className="flex items-center gap-2 text-sm text-white bg-white/5 px-3 py-1.5 rounded-lg border border-dark-border">
              <Calendar size={14} className="text-primary" />
              <span>{visit.date}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-white bg-white/5 px-3 py-1.5 rounded-lg border border-dark-border">
              <Clock size={14} className="text-primary" />
              <span>{visit.time}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between mt-auto border-t border-dark-border pt-4">
          <div className="flex items-center gap-2 text-xs text-muted">
            <User size={14} />
            <span>{visit.sellerName} (Seller)</span>
          </div>

          {visit.status === 'upcoming' && (
            <div className="flex gap-2">
              <button className="p-2 bg-white/5 hover:bg-white/10 text-white rounded transition-colors border border-dark-border" title="Contact Seller">
                <Phone size={14} />
              </button>
              <button className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-white rounded text-[10px] font-bold uppercase tracking-widest transition-colors border border-dark-border">
                Reschedule
              </button>
              <button className="px-3 py-1.5 bg-destructive/10 hover:bg-destructive/20 text-destructive rounded text-[10px] font-bold uppercase tracking-widest transition-colors border border-destructive/20">
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
