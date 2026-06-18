import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { createProperty } from '../services/propertyService';
import { saveDocumentsToProperty, uploadDocumentToS3, uploadFileToS3 } from '../services/sellerService';
import {
  Building2, MapPin, DollarSign, Info, Check,
  Upload, ChevronRight, ChevronLeft, Loader2, X, FileText, AlertCircle
} from 'lucide-react';

type DocStatus = 'pending' | 'uploading' | 'done' | 'error';
interface DocEntry { name: string; status: DocStatus; error?: string; }


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

export default function AddPropertyPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [propertyId, setPropertyId] = useState<string | null>(null);
  const [uploadingDocs, setUploadingDocs] = useState(false);
  const [docEntries, setDocEntries] = useState<DocEntry[]>([]);
  const [docsComplete, setDocsComplete] = useState(false);


  const [form, setForm] = useState({
    title: '',
    description: '',
    type: 'apartment',
    listingType: 'sale' as 'sale' | 'rent',
    salePrice: '',
    rentPrice: '',
    securityDeposit: '',
    rentPeriod: 'monthly' as 'monthly' | 'yearly',
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
    listingType: form.listingType,

    salePrice: form.salePrice
      ? Number(form.salePrice)
      : null,

    rentPrice: form.rentPrice
      ? Number(form.rentPrice)
      : null,

    securityDeposit: form.securityDeposit
      ? Number(form.securityDeposit)
      : null,

    rentPeriod: form.rentPeriod,

    bedrooms: Number(form.bedrooms),
    bathrooms: Number(form.bathrooms),
    area: Number(form.area),

    address: form.address,
    city: form.city,
    state: form.state,
    pincode: form.pincode,

    amenities: form.amenities,
    images: form.images,
  }),

  onSuccess: (data) => {

    // Save property ID returned by backend
    setPropertyId(data.propertyId);

    alert(
      "Property created successfully! Now upload legal documents."
    );

    // Remove this for now:
    // navigate('/seller');
  },

  onError: () => {
    alert(
      'Failed to add property. Please try again.'
    );
  },
});

  const handleDocumentUpload = async (
  e: React.ChangeEvent<HTMLInputElement>
) => {
  if (!propertyId || !e.target.files?.length) return;

  const files = Array.from(e.target.files);

  // Initialise entry list shown in UI
  const initial: DocEntry[] = files.map(f => ({ name: f.name, status: 'pending' }));
  setDocEntries(initial);
  setUploadingDocs(true);
  setDocsComplete(false);

  const setStatus = (i: number, status: DocStatus, error?: string) =>
    setDocEntries(prev => prev.map((d, idx) => idx === i ? { ...d, status, error } : d));

  try {
    const documentsRecord: Record<string, string> = {};

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      setStatus(i, 'uploading');
      try {
        const s3Key = await uploadDocumentToS3(file, `doc_${i}`);
        documentsRecord[`doc_${i}`] = s3Key;
        setStatus(i, 'done');
      } catch (err: any) {
        setStatus(i, 'error', err?.message ?? 'Upload failed');
      }
    }

    if (Object.keys(documentsRecord).length > 0) {
      await saveDocumentsToProperty(propertyId, documentsRecord);
    }

    if (Object.keys(documentsRecord).length === files.length) {
    setDocsComplete(true);
  }

  } catch (error) {
    console.error(error);
  } finally {
    setUploadingDocs(false);
  }
};

  const isStepValid = () => {
    if (step === 1) return form.title.trim() && form.description.trim();
    if (step === 2)
      return form.listingType === 'sale'
        ? !!form.salePrice
        : !!form.rentPrice;
    if (step === 3) return form.city.trim() && form.state.trim() && form.address.trim();
    return true;
  };

  const handleDemoPayment = async () => {
  try {
    alert("Demo payment successful!");

    // Later this will become Razorpay

    navigate("/seller/my-properties");
  } catch (error) {
    console.error(error);
    alert("Payment failed");
  }
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
                <div>
                  <label className={labelClass}>Listing Type</label>
                  <div className="flex bg-black border border-dark-border rounded-lg overflow-hidden">
                    {(['sale', 'rent'] as const).map(t => (
                      <button key={t} onClick={() => set('listingType', t)}
                        className={`flex-1 py-3 font-bold capitalize transition-all ${form.listingType === t ? 'bg-secondary text-black' : 'text-muted hover:text-white'}`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

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
            </div>
          )}

          {/* Step 2: Pricing */}
          {step === 2 && (
            <div className="space-y-6">
              <h2 className="text-xl font-display font-bold">Pricing Details</h2>

              {form.listingType === 'sale' ? (
                <div>
                  <label className={labelClass}>Sale Price (₹)</label>
                  <input className={inputClass} type="number" min="0" placeholder="e.g. 8500000" value={form.salePrice} onChange={e => set('salePrice', e.target.value)} />
                  <p className="text-xs text-muted mt-1">Enter in rupees (e.g. 85,00,000 = 8500000)</p>
                </div>
              ) : (
                <>
                  <div>
                    <label className={labelClass}>Monthly Rent (₹)</label>
                    <input className={inputClass} type="number" min="0" placeholder="e.g. 35000" value={form.rentPrice} onChange={e => set('rentPrice', e.target.value)} />
                  </div>
                  <div>
                    <label className={labelClass}>Security Deposit (₹)</label>
                    <input className={inputClass} type="number" min="0" placeholder="e.g. 100000" value={form.securityDeposit} onChange={e => set('securityDeposit', e.target.value)} />
                  </div>
                  <div>
                    <label className={labelClass}>Rent Period</label>
                    <div className="flex gap-4">
                      {(['monthly', 'yearly'] as const).map(p => (
                        <button key={p} onClick={() => set('rentPeriod', p)}
                          className={`flex-1 py-3 rounded-lg border font-bold capitalize transition-all ${form.rentPeriod === p ? 'bg-secondary/20 border-secondary text-secondary' : 'border-dark-border text-muted hover:text-white'}`}
                        >
                          {p}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}

              <div className="bg-secondary/5 border border-secondary/20 rounded-xl p-5">
                <p className="text-sm text-secondary font-bold mb-1">Platform Listing Fee</p>
                <p className="text-2xl font-display font-black text-white">
                  ₹{form.listingType === 'sale' ? '999' : '299'}
                </p>
                <p className="text-xs text-muted mt-1">
                  One-time fee to publish your listing after admin verification.
                </p>
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

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>City</label>
                  <input className={inputClass} placeholder="e.g. Mumbai" value={form.city} onChange={e => set('city', e.target.value)} />
                </div>
                <div>
                  <label className={labelClass}>State</label>
                  <input className={inputClass} placeholder="e.g. Maharashtra" value={form.state} onChange={e => set('state', e.target.value)} />
                </div>
              </div>

              <div>
                <label className={labelClass}>Pincode</label>
                <input className={inputClass} placeholder="e.g. 400050" maxLength={6} value={form.pincode} onChange={e => set('pincode', e.target.value)} />
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

    {/* Legal Documents */}
    {propertyId && (
      <div className="mt-8 p-6 border border-dark-border rounded-xl bg-dark-card">
        <h3 className="text-lg font-bold mb-1 flex items-center gap-2">
          <FileText size={18} className="text-secondary" />
          Upload Legal Documents
        </h3>
        <p className="text-muted text-sm mb-5">
          Accepted: PDF, DOCX, JPG, PNG. Upload sale deed, ownership proof, NOC, etc.
        </p>

        {/* File picker — hidden when uploading */}
        {!uploadingDocs && !docsComplete && (
          <label className="flex flex-col items-center justify-center gap-3 border-2 border-dashed border-dark-border rounded-xl h-28 cursor-pointer hover:border-secondary transition-colors">
            <Upload size={24} className="text-muted" />
            <span className="text-muted text-sm">Click to select documents (multiple)</span>
            <input
              type="file"
              multiple
              accept=".pdf,.docx,.doc,.jpg,.jpeg,.png"
              onChange={handleDocumentUpload}
              className="hidden"
            />
          </label>
        )}

        {/* Per-file progress list */}
        {docEntries.length > 0 && (
          <ul className="mt-5 space-y-3">
            {docEntries.map((doc, i) => (
              <li key={i} className="flex items-center gap-3 bg-black/30 rounded-lg px-4 py-3 border border-dark-border">
                <FileText size={16} className="text-secondary shrink-0" />
                <span className="flex-1 text-sm text-white truncate">{doc.name}</span>
                {doc.status === 'pending' && (
                  <span className="text-xs text-muted">Pending…</span>
                )}
                {doc.status === 'uploading' && (
                  <Loader2 size={16} className="text-secondary animate-spin shrink-0" />
                )}
                {doc.status === 'done' && (
                  <Check size={16} className="text-green-400 shrink-0" />
                )}
                {doc.status === 'error' && (
                  <span className="flex items-center gap-1 text-xs text-red-400">
                    <AlertCircle size={14} />{doc.error ?? 'Error'}
                  </span>
                )}
              </li>
            ))}
          </ul>
        )}

        {/* All-done banner + navigate */}
        {docsComplete && (
          <div className="mt-5 flex flex-col items-center gap-4">
            <div className="flex items-center gap-2 text-green-400 font-bold">
              <Check size={20} /> All documents uploaded successfully!
            </div>
            <button
              onClick={handleDemoPayment}
              className="px-8 py-3 rounded-lg bg-secondary text-black font-bold hover:bg-teal-400 transition-all"
            >
              Pay ₹999
            </button>
          </div>
        )}
      </div>
    )}
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