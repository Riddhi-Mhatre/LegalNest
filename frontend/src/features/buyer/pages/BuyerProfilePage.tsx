import { Settings, User, MapPin, Bell, Shield } from 'lucide-react';
import { useAuthStore } from '../../../store/authStore';

export default function BuyerProfilePage() {
  const { user } = useAuthStore();

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      <div className="flex items-center gap-4 border-b border-dark-border pb-6">
        <div className="p-3 bg-white/10 rounded-lg">
          <Settings size={28} className="text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-display font-black uppercase tracking-widest text-white">Profile Settings</h1>
          <p className="text-muted text-sm mt-1">Manage your personal information and preferences.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Sidebar Tabs */}
        <div className="space-y-2">
           <button className="w-full flex items-center gap-3 p-4 bg-primary/10 text-primary rounded-lg border border-primary/20 font-medium">
             <User size={18} /> Personal Information
           </button>
           <button className="w-full flex items-center gap-3 p-4 bg-transparent hover:bg-white/5 text-muted hover:text-white rounded-lg transition-colors">
             <MapPin size={18} /> Property Preferences
           </button>
           <button className="w-full flex items-center gap-3 p-4 bg-transparent hover:bg-white/5 text-muted hover:text-white rounded-lg transition-colors">
             <Bell size={18} /> Notifications
           </button>
           <button className="w-full flex items-center gap-3 p-4 bg-transparent hover:bg-white/5 text-muted hover:text-white rounded-lg transition-colors">
             <Shield size={18} /> Security
           </button>
        </div>

        {/* Form Content */}
        <div className="lg:col-span-2 bg-dark-card border border-dark-border rounded-xl p-6 lg:p-8">
           <h2 className="text-xl font-bold text-white mb-6 uppercase tracking-widest border-b border-dark-border pb-4">Personal Information</h2>
           
           <div className="flex items-center gap-6 mb-8">
              <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-primary to-accent p-1">
                 <div className="w-full h-full bg-black rounded-full flex items-center justify-center">
                    <span className="text-3xl font-bold text-primary">{user?.name?.charAt(0) || 'B'}</span>
                 </div>
              </div>
              <div>
                 <button className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded font-bold uppercase tracking-widest text-xs transition-colors border border-dark-border mb-2">
                    Change Avatar
                 </button>
                 <p className="text-xs text-muted">JPG, GIF or PNG. Max size of 800K</p>
              </div>
           </div>

           <form className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="space-y-2">
                    <label className="text-xs font-bold text-muted uppercase tracking-widest">Full Name</label>
                    <input type="text" defaultValue={user?.name} className="w-full bg-black border border-dark-border rounded p-3 text-white focus:border-primary outline-none transition-colors" />
                 </div>
                 <div className="space-y-2">
                    <label className="text-xs font-bold text-muted uppercase tracking-widest">Email Address</label>
                    <input type="email" defaultValue={user?.email} disabled className="w-full bg-black/50 border border-dark-border rounded p-3 text-muted outline-none cursor-not-allowed" />
                 </div>
                 <div className="space-y-2">
                    <label className="text-xs font-bold text-muted uppercase tracking-widest">Phone Number</label>
                    <input type="tel" placeholder="+1 (555) 000-0000" className="w-full bg-black border border-dark-border rounded p-3 text-white focus:border-primary outline-none transition-colors" />
                 </div>
                 <div className="space-y-2">
                    <label className="text-xs font-bold text-muted uppercase tracking-widest">Location</label>
                    <input type="text" placeholder="Los Angeles, CA" className="w-full bg-black border border-dark-border rounded p-3 text-white focus:border-primary outline-none transition-colors" />
                 </div>
              </div>

              <div className="space-y-2">
                 <label className="text-xs font-bold text-muted uppercase tracking-widest">Bio</label>
                 <textarea rows={4} placeholder="Tell us a bit about what kind of properties you are looking for..." className="w-full bg-black border border-dark-border rounded p-3 text-white focus:border-primary outline-none transition-colors custom-scrollbar"></textarea>
              </div>

              <div className="pt-6 border-t border-dark-border flex justify-end gap-4">
                 <button type="button" className="px-6 py-3 bg-transparent hover:bg-white/5 text-white rounded font-bold uppercase tracking-widest text-xs transition-colors">
                    Cancel
                 </button>
                 <button type="button" className="px-6 py-3 bg-primary hover:bg-white text-black rounded font-bold uppercase tracking-widest text-xs transition-colors">
                    Save Changes
                 </button>
              </div>
           </form>
        </div>

      </div>
    </div>
  );
}
