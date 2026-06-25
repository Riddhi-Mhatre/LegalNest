import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { createProperty } from '../../../services/propertyService';
import { uploadFileToS3 } from '../../../services/sellerService';
import {
  Building2, MapPin, DollarSign, Info, Check,
  Upload, ChevronRight, ChevronLeft, Loader2, X, AlertCircle
} from 'lucide-react';


const AMENITY_OPTIONS = [
  'Lift', 'Parking', 'Gym', 'Garden',
  'Security', 'Power Backup', 'Swimming Pool', 'Club House',
];

const STEPS = [
  { id: 1, label: 'Basic Info', icon: Info },
  { id: 2, label: 'Pricing', icon: DollarSign },
  { id: 3, label: 'Location', icon: MapPin },
  { id: 4, label: 'Media & Amenities', icon: Building2 },
];

const inputClass =
  'w-full bg-black border border-dark-border rounded-lg px-4 py-3 text-white placeholder-muted focus:border-secondary focus:outline-none focus:ring-1 focus:ring-secondary transition-all';
const labelClass = 'block text-xs text-muted font-bold uppercase tracking-wider mb-2';

type PincodeStatus = 'idle' | 'loading' | 'success' | 'error';

export default function AddPropertyPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [pincodeStatus, setPincodeStatus] = useState<PincodeStatus>('idle');
  const [pincodePostOfficeName, setPincodePostOfficeName] = useState('');
  const [locationAutoFilled, setLocationAutoFilled] = useState(false);


  const [form, setForm] = useState({
    title: '',
    description: '',
    type: 'apartment',
    salePrice: '',
    bedrooms: '',
    bathrooms: '',
    area: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    amenities: [] as string[],
    images: [] as string[],
  });

  const set = (field: string, value: any) =>
    setForm(prev => ({ ...prev, [field]: value }));

  const fetchLocationByPincode = useCallback(async (pincode: string) => {
    if (pincode.length !== 6 || !/^\d{6}$/.test(pincode)) {
      // Reset if pincode is cleared/invalid
      if (locationAutoFilled) {
        setForm(prev => ({ ...prev, city: '', state: '' }));
        setLocationAutoFilled(false);
        setPincodePostOfficeName('');
      }
      setPincodeStatus('idle');
      return;
    }

    setPincodeStatus('loading');
    try {
      const res = await fetch(`https://api.postalpincode.in/pincode/${pincode}`);
      const data = await res.json();
      const result = data[0];

      if (result.Status === 'Success' && result.PostOffice?.length > 0) {
        const postOffice = result.PostOffice[0];
        setForm(prev => ({
          ...prev,
          city: postOffice.District || postOffice.Block || '',
          state: postOffice.State || '',
        }));
        setPincodePostOfficeName(postOffice.Name);
        setLocationAutoFilled(true);
        setPincodeStatus('success');
      } else {
        setForm(prev => ({ ...prev, city: '', state: '' }));
        setLocationAutoFilled(false);
        setPincodePostOfficeName('');
        setPincodeStatus('error');
      }
    } catch {
      setForm(prev => ({ ...prev, city: '', state: '' }));
      setLocationAutoFilled(false);
      setPincodePostOfficeName('');
      setPincodeStatus('error');
    }
  }, [locationAutoFilled]);

  const handlePincodeChange = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 6);
    set('pincode', digits);
    fetchLocationByPincode(digits);
  };

  const toggleAmenity = (a: string) =>
    set(
      'amenities',
      form.amenities.includes(a)
        ? form.amenities.filter(x => x !== a)
        : [...form.amenities, a]
    );  

 const handleImageUpload = async (
  e: React.ChangeEvent<HTMLInputElement>
) => {
  if (!e.target.files?.length) return;

  setUploadingImages(true);

  try {
    const files = Array.from(e.target.files);

    
    const urls = await Promise.all(
      files.map(uploadFileToS3)
    );

    console.log("Uploaded URLs:", urls); // Debugging

    
    set('images', [...form.images, ...urls]);
    

  } catch (error) {
    console.error("Image upload error:", error);
    alert('Image upload failed. Please try again.');
  } finally {
    setUploadingImages(false);
  }
};

  const removeImage = (idx: number) =>
    set('images', form.images.filter((_, i) => i !== idx));

  const { mutate: submitProperty, isPending } = useMutation({
  mutationFn: () =>
  createProperty({
    title: form.title,
    description: form.description,
    type: form.type,
    listingType: 'sale',
    salePrice: Number(form.salePrice),
    price: Number(form.salePrice),
    bedrooms: (form.type === 'plot' || form.type === 'commercial') ? 0 : Number(form.bedrooms),
    bathrooms: (form.type === 'plot' || form.type === 'commercial') ? 0 : Number(form.bathrooms),
    area: Number(form.area),
    address: form.address,
    city: form.city,
    state: form.state,
    pincode: form.pincode,
    amenities: form.amenities,
    images: form.images,
  }),

  onSuccess: (data) => {
    // Redirect to the dedicated document upload page with the new property ID
    navigate(`/seller/documents?propertyId=${data.propertyId}`);
  },

  onError: () => {
    alert('Failed to add property. Please try again.');
  },
});

  const isStepValid = () => {
    if (step === 1) return form.title.trim() && form.description.trim();
    if (step === 2) return !!form.salePrice;
    if (step === 3) return form.city.trim() && form.state.trim() && form.address.trim();
    return true;
  };


  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-3xl mx-auto">

        {/* Header */}
        <div className="mb-10">
          <h1 className="text-4xl font-display font-bold text-white mb-2">
            Add New <span className="text-transparent bg-clip-text bg-gradient-to-r from-secondary to-primary">Property</span>
          </h1>
          <p className="text-muted">Fill in the details to list your property on GharBid.</p>
        </div>

        {/* Progress */}
        <div className="flex items-center gap-0 mb-10">
          {STEPS.map((s, i) => (
            <div key={s.id} className="flex items-center flex-1">
              <div className="flex flex-col items-center w-full">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                    step > s.id
                      ? 'bg-secondary border-secondary text-black'
                      : step === s.id
                      ? 'border-secondary text-secondary bg-secondary/10'
                      : 'border-dark-border text-muted'
                  }`}
                >
                  {step > s.id ? <Check size={18} /> : <s.icon size={16} />}
                </div>
                <span className={`text-xs mt-1 font-bold hidden sm:block ${step >= s.id ? 'text-white' : 'text-muted'}`}>
                  {s.label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`h-0.5 flex-1 transition-all duration-500 mx-2 ${step > s.id ? 'bg-secondary' : 'bg-dark-border'}`} />
              )}
            </div>
          ))}
        </div>

        {/* Form Card */}
        <div className="bg-dark-card border border-dark-border rounded-2xl p-8">

          {/* Step 1: Basic Info */}
          {step === 1 && (
            <div className="space-y-6">
              <h2 className="text-xl font-display font-bold">Basic Information</h2>

              <div>
                <label className={labelClass}>Property Title</label>
                <input className={inputClass} placeholder="e.g. Spacious 3BHK in Bandra West" value={form.title} onChange={e => set('title', e.target.value)} />
              </div>

              <div>
                <label className={labelClass}>Description</label>
                <textarea className={`${inputClass} h-32 resize-none`} placeholder="Describe the property, its features, neighbourhood..." value={form.description} onChange={e => set('description', e.target.value)} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Property Type</label>
                  <select className={inputClass} value={form.type} onChange={e => set('type', e.target.value)}>
                    <option value="apartment">Apartment</option>
                    <option value="house">House</option>
                    <option value="villa">Villa</option>
                    <option value="plot">Plot / Land</option>
                    <option value="commercial">Commercial</option>
                  </select>
                </div>
              </div>

              {form.type !== 'plot' && form.type !== 'commercial' ? (
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className={labelClass}>Bedrooms</label>
                    <input className={inputClass} type="number" min="0" placeholder="0" value={form.bedrooms} onChange={e => set('bedrooms', e.target.value)} />
                  </div>
                  <div>
                    <label className={labelClass}>Bathrooms</label>
                    <input className={inputClass} type="number" min="0" placeholder="0" value={form.bathrooms} onChange={e => set('bathrooms', e.target.value)} />
                  </div>
                  <div>
                    <label className={labelClass}>Area (sq ft)</label>
                    <input className={inputClass} type="number" min="0" placeholder="1200" value={form.area} onChange={e => set('area', e.target.value)} />
                  </div>
                </div>
              ) : (
                <div>
                  <label className={labelClass}>Area (sq ft)</label>
                  <input className={inputClass} type="number" min="0" placeholder="1200" value={form.area} onChange={e => set('area', e.target.value)} />
                </div>
              )}
            </div>
          )}

          {/* Step 2: Pricing */}
          {step === 2 && (
            <div className="space-y-6">
              <h2 className="text-xl font-display font-bold">Pricing Details</h2>

              <div>
                <label className={labelClass}>Sale Price (₹)</label>
                <input className={inputClass} type="number" min="0" placeholder="e.g. 8500000" value={form.salePrice} onChange={e => set('salePrice', e.target.value)} />
                <p className="text-xs text-muted mt-1">Enter in rupees (e.g. 85,00,000 = 8500000)</p>
              </div>

              <div className="bg-secondary/5 border border-secondary/20 rounded-xl p-5">
                <p className="text-sm text-secondary font-bold mb-1">Platform Listing Fee</p>
                <p className="text-2xl font-display font-black text-white">₹999</p>
                <p className="text-xs text-muted mt-1">One-time fee to publish your listing immediately.</p>
              </div>
            </div>
          )}

          {/* Step 3: Location */}
          {step === 3 && (
            <div className="space-y-6">
              <h2 className="text-xl font-display font-bold">Location</h2>

              <div>
                <label className={labelClass}>Full Address</label>
                <input className={inputClass} placeholder="Street address, building name, floor..." value={form.address} onChange={e => set('address', e.target.value)} />
              </div>

              {/* Pincode with auto-fill */}
              <div>
                <label className={labelClass}>Pincode</label>
                <div className="relative">
                  <input
                    className={`${inputClass} pr-12 ${
                      pincodeStatus === 'error' ? 'border-red-500 focus:border-red-500 focus:ring-red-500' :
                      pincodeStatus === 'success' ? 'border-green-500 focus:border-green-500 focus:ring-green-500' : ''
                    }`}
                    placeholder="e.g. 400050"
                    maxLength={6}
                    value={form.pincode}
                    onChange={e => handlePincodeChange(e.target.value)}
                    inputMode="numeric"
                  />
                  <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                    {pincodeStatus === 'loading' && (
                      <Loader2 size={18} className="text-secondary animate-spin" />
                    )}
                    {pincodeStatus === 'success' && (
                      <Check size={18} className="text-green-400" />
                    )}
                    {pincodeStatus === 'error' && (
                      <AlertCircle size={18} className="text-red-400" />
                    )}
                  </div>
                </div>
                {pincodeStatus === 'success' && pincodePostOfficeName && (
                  <p className="text-xs text-green-400 mt-1 flex items-center gap-1">
                    <Check size={12} />
                    Auto-filled from <span className="font-semibold">{pincodePostOfficeName}</span> post office
                  </p>
                )}
                {pincodeStatus === 'error' && (
                  <p className="text-xs text-red-400 mt-1 flex items-center gap-1">
                    <AlertCircle size={12} />
                    Invalid pincode. Please check and try again.
                  </p>
                )}
                {pincodeStatus === 'loading' && (
                  <p className="text-xs text-muted mt-1">Looking up location...</p>
                )}
              </div>

              {/* City & State - auto-filled from pincode */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>
                    City
                    {locationAutoFilled && (
                      <span className="ml-2 text-green-400 normal-case font-normal tracking-normal">• auto-filled</span>
                    )}
                  </label>
                  <input
                    className={`${inputClass} ${
                      locationAutoFilled ? 'border-green-500/40 bg-green-900/10 text-green-300' : ''
                    }`}
                    placeholder="e.g. Mumbai"
                    value={form.city}
                    onChange={e => { set('city', e.target.value); setLocationAutoFilled(false); }}
                  />
                </div>
                <div>
                  <label className={labelClass}>
                    State
                    {locationAutoFilled && (
                      <span className="ml-2 text-green-400 normal-case font-normal tracking-normal">• auto-filled</span>
                    )}
                  </label>
                  <input
                    className={`${inputClass} ${
                      locationAutoFilled ? 'border-green-500/40 bg-green-900/10 text-green-300' : ''
                    }`}
                    placeholder="e.g. Maharashtra"
                    value={form.state}
                    onChange={e => { set('state', e.target.value); setLocationAutoFilled(false); }}
                  />
                </div>
              </div>

            </div>
          )}

          {/* Step 4: Media & Amenities */}
{step === 4 && (
  <div className="space-y-8">
    <h2 className="text-xl font-display font-bold">
      Photos & Amenities
    </h2>

    {/* Image Upload */}
    <div>
      <label className={labelClass}>Property Photos</label>

      <label
        className={`flex flex-col items-center justify-center gap-3 border-2 border-dashed border-dark-border rounded-xl h-36 cursor-pointer hover:border-secondary transition-colors ${
          uploadingImages
            ? 'opacity-50 pointer-events-none'
            : ''
        }`}
      >
        {uploadingImages ? (
          <>
            <Loader2
              size={28}
              className="text-secondary animate-spin"
            />
            <span className="text-muted text-sm">
              Uploading...
            </span>
          </>
        ) : (
          <>
            <Upload
              size={28}
              className="text-muted"
            />
            <span className="text-muted text-sm">
              Click to upload photos (multiple)
            </span>
          </>
        )}

        <input
          type="file"
          multiple
          accept="image/*"
          className="hidden"
          onChange={handleImageUpload}
        />
      </label>

      {form.images.length > 0 && (
        <div className="flex flex-wrap gap-3 mt-4">
          {form.images.map((url, i) => (
            <div
              key={i}
              className="relative w-20 h-20 rounded-lg overflow-hidden border border-dark-border group"
            >
              <img
                src={url}
                alt=""
                className="w-full h-full object-cover"
              />

              <button
                onClick={() => removeImage(i)}
                className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
              >
                <X
                  size={18}
                  className="text-red-400"
                />
              </button>

              {i === 0 && (
                <span className="absolute bottom-1 left-1 text-[9px] bg-primary text-black font-bold px-1 rounded">
                  Cover
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>

    {/* Amenities */}
    <div>
      <label className={labelClass}>
        Amenities
      </label>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {AMENITY_OPTIONS.map((a) => (
          <button
            key={a}
            onClick={() => toggleAmenity(a)}
            className={`py-2 px-3 rounded-lg border text-sm font-medium transition-all ${
              form.amenities.includes(a)
                ? 'bg-secondary/20 border-secondary text-secondary'
                : 'border-dark-border text-muted hover:text-white hover:border-white/30'
            }`}
          >
            {form.amenities.includes(a) && (
              <Check
                size={12}
                className="inline mr-1"
              />
            )}
            {a}
          </button>
        ))}
      </div>
    </div>

  </div>
)}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-10 pt-6 border-t border-dark-border">
            <button
              onClick={() => setStep(s => s - 1)}
              disabled={step === 1}
              className="flex items-center gap-2 px-6 py-3 rounded-lg border border-dark-border text-muted hover:text-white hover:border-white/30 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={18} /> Back
            </button>

            {step < 4 ? (
              <button
                onClick={() => setStep(s => s + 1)}
                disabled={!isStepValid()}
                className="flex items-center gap-2 px-8 py-3 rounded-lg bg-secondary text-black font-bold hover:bg-teal-400 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Continue <ChevronRight size={18} />
              </button>
            ) : (
              <button
                onClick={() => submitProperty()}
                disabled={isPending}
                className="flex items-center gap-2 px-8 py-3 rounded-lg bg-primary text-black font-bold hover:bg-yellow-400 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {isPending
                  ? <><Loader2 size={18} className="animate-spin" /> Submitting...</>
                  : <><Check size={18} /> Submit Listing</>
                }
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}