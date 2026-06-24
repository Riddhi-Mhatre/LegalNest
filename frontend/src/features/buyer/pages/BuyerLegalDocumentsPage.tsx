import { FileText, Download, Eye, ShieldCheck, AlertCircle } from 'lucide-react';

const documents = [
  {
    id: '1',
    propertyTitle: 'Oceanfront Estate',
    type: 'Ownership Documents',
    status: 'verified',
    date: '2026-06-15',
    size: '2.4 MB'
  },
  {
    id: '2',
    propertyTitle: 'Oceanfront Estate',
    type: 'Tax Documents',
    status: 'verified',
    date: '2026-06-15',
    size: '1.1 MB'
  },
  {
    id: '3',
    propertyTitle: 'Sunset Boulevard Apartment',
    type: 'Encumbrance Certificate',
    status: 'pending review',
    date: '2026-06-18',
    size: '3.5 MB'
  },
  {
    id: '4',
    propertyTitle: 'Modern Glass Villa',
    type: 'Property Verification Report',
    status: 'verified',
    date: '2026-06-10',
    size: '5.2 MB'
  }
];

export default function BuyerLegalDocumentsPage() {
  return (
    <div className="space-y-8 animate-fade-in pb-12">
      <div className="flex items-center gap-4 border-b border-dark-border pb-6">
        <div className="p-3 bg-accent/10 rounded-lg">
          <FileText size={28} className="text-accent" />
        </div>
        <div>
          <h1 className="text-3xl font-display font-black uppercase tracking-widest text-white">Legal Documents</h1>
          <p className="text-muted text-sm mt-1">Access verified legal documents and reports for properties.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {documents.map((doc) => (
          <div key={doc.id} className="bg-dark-card border border-dark-border rounded-xl p-6 hover:border-accent/50 transition-all duration-300 group">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-white/5 rounded-lg text-white group-hover:bg-accent/20 group-hover:text-accent transition-colors">
                <FileText size={24} />
              </div>
              {doc.status === 'verified' ? (
                <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded bg-secondary/10 text-secondary border border-secondary/20">
                  <ShieldCheck size={12} /> Verified
                </span>
              ) : (
                <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded bg-primary/10 text-primary border border-primary/20">
                  <AlertCircle size={12} /> Pending Review
                </span>
              )}
            </div>
            
            <h3 className="font-bold text-lg text-white mb-1">{doc.type}</h3>
            <p className="text-sm text-muted mb-6">{doc.propertyTitle}</p>
            
            <div className="flex items-center justify-between border-t border-dark-border pt-4">
              <div className="text-xs text-muted">
                {doc.date} • {doc.size}
              </div>
              <div className="flex gap-2">
                <button className="p-2 hover:bg-white/10 rounded text-white transition-colors" title="View Document">
                  <Eye size={18} />
                </button>
                <button className="p-2 hover:bg-white/10 rounded text-white transition-colors" title="Download">
                  <Download size={18} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
