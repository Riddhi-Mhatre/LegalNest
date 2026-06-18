import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createProperty } from '../services/propertyService';
import {
  saveDocumentsToProperty,
  uploadDocumentToS3,
  uploadFileToS3,
  payPlatformFee,
} from '../services/sellerService';
import {
  Building2, MapPin, DollarSign, Info, Check,
  Upload, ChevronRight, ChevronLeft, Loader2, X, FileText,
  AlertCircle, CreditCard, ShieldCheck,
} from 'lucide-react';

// ─── Document definitions ────────────────────────────────────────────────────
interface DocDef {
  key: string;
  label: string;
  required: boolean;
  hint: string;
}

const LEGAL_DOCS: DocDef[] = [
  { key: 'saleDeed',     label: 'Sale Deed',                     required: true,  hint: 'Original / Certified copy' },
  { key: 'propertyCard', label: 'Property Card / 7-12 Extract',  required: true,  hint: 'Latest extract' },
  { key: 'taxReceipt',   label: 'Property Tax Receipt',          required: true,  hint: 'Current year receipt' },
  { key: 'ownerAadhar',  label: 'Owner Aadhaar Card',            required: true,  hint: 'Front & back scan' },
  { key: 'ownerPan',     label: 'Owner PAN Card',                required: true,  hint: 'Clear scan' },
  { key: 'noc',          label: 'NOC (Society / Bank)',           required: false, hint: 'Optional but recommended' },
];

type UploadStatus = 'idle' | 'uploading' | 'done' | 'error';
interface DocState {
  status: UploadStatus;
  fileName?: string;
  s3Key?: string;
  error?: string;
}

type DocMap = Record<string, DocState>;

// ─── Step definitions ────────────────────────────────────────────────────────
const STEPS = [
  { id: 1, label: 'Basic Info',        icon: Info },
  { id: 2, label: 'Pricing',           icon: DollarSign },
  { id: 3, label: 'Location',          icon: MapPin },
  { id: 4, label: 'Media & Amenities', icon: Building2 },
];

const AMENITY_OPTIONS = [
  'Lift', 'Parking', 'Gym', 'Garden',
  'Security', 'Power Backup', 'Swimming Pool', 'Club House',
];

const inputClass =
  'w-full bg-black border border-dark-border rounded-lg px-4 py-3 text-white placeholder-muted focus:border-secondary focus:outline-none focus:ring-1 focus:ring-secondary transition-all';
const labelClass = 'block text-xs text-muted font-bold uppercase tracking-wider mb-2';

// ─── Component ───────────────────────────────────────────────────────────────
export default function AddPropertyPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Multi-step state
  const [step, setStep] = useState(1);

  // Property creation
  const [uploadingImages, setUploadingImages] = useState(false);
  const [propertyId, setPropertyId] = useState<string | null>(null);

  // Documents — one state entry per doc
  const [docMap, setDocMap] = useState<DocMap>(() =>
    Object.fromEntries(LEGAL_DOCS.map(d => [d.key, { status: 'idle' as UploadStatus }]))
  );

  // Payment
  const [paymentPending, setPaymentPending] = useState(false);

  // Form state
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

  // ─── Derived state ────────────────────────────────────────────────────────
  const requiredDocs = LEGAL_DOCS.filter(d => d.required);
  const allRequiredDone = requiredDocs.every(d => docMap[d.key]?.status === 'done');
  const anyDocUploading = LEGAL_DOCS.some(d => docMap[d.key]?.status === 'uploading');

  // ─── Image upload ─────────────────────────────────────────────────────────
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    setUploadingImages(true);
    try {
      const files = Array.from(e.target.files);
      const urls = await Promise.all(files.map(uploadFileToS3));
      set('images', [...form.images, ...urls]);
    } catch (error) {
      console.error('Image upload error:', error);
      alert('Image upload failed. Please try again.');
    } finally {
      setUploadingImages(false);
    }
  };

  const removeImage = (idx: number) =>
    set('images', form.images.filter((_, i) => i !== idx));

  // ─── Property submit ──────────────────────────────────────────────────────
  const { mutate: submitProperty, isPending } = useMutation({
    mutationFn: () =>
      createProperty({
        title: form.title,
        description: form.description,
        type: form.type,
        listingType: form.listingType,
        salePrice: form.salePrice ? Number(form.salePrice) : null,
        rentPrice: form.rentPrice ? Number(form.rentPrice) : null,
        securityDeposit: form.securityDeposit ? Number(form.securityDeposit) : null,
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
      const id = data?.propertyId ?? data?.data?.propertyId;
      setPropertyId(id ?? null);
    },
    onError: () => {
      alert('Failed to add property. Please try again.');
    },
  });

  // ─── Single-document upload ───────────────────────────────────────────────
  const handleDocUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    docKey: string
  ) => {
    if (!propertyId || !e.target.files?.length) return;
    const file = e.target.files[0];

    // Mark as uploading
    setDocMap(prev => ({
      ...prev,
      [docKey]: { status: 'uploading', fileName: file.name },
    }));

    try {
      const s3Key = await uploadDocumentToS3(file, docKey);

      // Update state to done
      setDocMap(prev => ({
        ...prev,
        [docKey]: { status: 'done', fileName: file.name, s3Key },
      }));

      // Save this single doc immediately to DynamoDB
      await saveDocumentsToProperty(propertyId, { [docKey]: s3Key });
    } catch (err: any) {
      setDocMap(prev => ({
        ...prev,
        [docKey]: { status: 'error', fileName: file.name, error: err?.message ?? 'Upload failed' },
      }));
    }
  };

  // ─── Payment ──────────────────────────────────────────────────────────────
  const handlePayNow = async () => {
    if (!propertyId) return;
    setPaymentPending(true);
    try {
      await payPlatformFee(propertyId);
      // Invalidate cached seller properties so the new one shows immediately
      await queryClient.invalidateQueries({ queryKey: ['seller', 'properties'] });
      navigate('/seller/my-properties');
    } catch (err) {
      console.error('Payment failed:', err);
      alert('Payment failed. Please try again.');
    } finally {
      setPaymentPending(false);
    }
  };

  // ─── Step validation ──────────────────────────────────────────────────────
  const isStepValid = () => {
    if (step === 1) return form.title.trim() && form.description.trim();
    if (step === 2)
      return form.listingType === 'sale' ? !!form.salePrice : !!form.rentPrice;
    if (step === 3) return form.city.trim() && form.state.trim() && form.address.trim();
    return true;
  };

  // ─── Render ───────────────────────────────────────────────────────────────
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

        {/* Progress Steps */}
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

          {/* ── Step 1: Basic Info ── */}
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

          {/* ── Step 2: Pricing ── */}
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

          {/* ── Step 3: Location ── */}
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

          {/* ── Step 4: Media, Amenities, Documents & Payment ── */}
          {step === 4 && (
            <div className="space-y-8">
              <h2 className="text-xl font-display font-bold">Photos & Amenities</h2>

              {/* Image Upload */}
              <div>
                <label className={labelClass}>Property Photos</label>
                <label
                  className={`flex flex-col items-center justify-center gap-3 border-2 border-dashed border-dark-border rounded-xl h-36 cursor-pointer hover:border-secondary transition-colors ${uploadingImages ? 'opacity-50 pointer-events-none' : ''}`}
                >
                  {uploadingImages ? (
                    <>
                      <Loader2 size={28} className="text-secondary animate-spin" />
                      <span className="text-muted text-sm">Uploading...</span>
                    </>
                  ) : (
                    <>
                      <Upload size={28} className="text-muted" />
                      <span className="text-muted text-sm">Click to upload photos (multiple)</span>
                    </>
                  )}
                  <input type="file" multiple accept="image/*" className="hidden" onChange={handleImageUpload} />
                </label>

                {form.images.length > 0 && (
                  <div className="flex flex-wrap gap-3 mt-4">
                    {form.images.map((url, i) => (
                      <div key={i} className="relative w-20 h-20 rounded-lg overflow-hidden border border-dark-border group">
                        <img src={url} alt="" className="w-full h-full object-cover" />
                        <button
                          onClick={() => removeImage(i)}
                          className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                        >
                          <X size={18} className="text-red-400" />
                        </button>
                        {i === 0 && (
                          <span className="absolute bottom-1 left-1 text-[9px] bg-primary text-black font-bold px-1 rounded">Cover</span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Amenities */}
              <div>
                <label className={labelClass}>Amenities</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {AMENITY_OPTIONS.map(a => (
                    <button
                      key={a}
                      onClick={() => toggleAmenity(a)}
                      className={`py-2 px-3 rounded-lg border text-sm font-medium transition-all ${
                        form.amenities.includes(a)
                          ? 'bg-secondary/20 border-secondary text-secondary'
                          : 'border-dark-border text-muted hover:text-white hover:border-white/30'
                      }`}
                    >
                      {form.amenities.includes(a) && <Check size={12} className="inline mr-1" />}
                      {a}
                    </button>
                  ))}
                </div>
              </div>

              {/* ── Legal Documents section — only shown after property is created ── */}
              {propertyId && (
                <div className="mt-4 p-6 border border-dark-border rounded-xl bg-black/30 space-y-5">
                  <div className="flex items-center gap-3 mb-2">
                    <ShieldCheck size={20} className="text-secondary" />
                    <div>
                      <h3 className="text-lg font-bold text-white">Legal Documents</h3>
                      <p className="text-xs text-muted">Upload required documents for verification. Accepted: PDF, JPG, PNG, DOCX.</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {LEGAL_DOCS.map(doc => {
                      const state = docMap[doc.key];
                      const isDone = state.status === 'done';
                      const isUploading = state.status === 'uploading';
                      const isError = state.status === 'error';

                      return (
                        <div
                          key={doc.key}
                          className={`flex items-center gap-4 p-4 rounded-lg border transition-colors ${
                            isDone
                              ? 'border-emerald-500/40 bg-emerald-500/5'
                              : isError
                              ? 'border-red-500/40 bg-red-500/5'
                              : 'border-dark-border bg-black/20'
                          }`}
                        >
                          {/* Status icon */}
                          <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
                            isDone ? 'bg-emerald-500/20' : isError ? 'bg-red-500/20' : 'bg-dark-border/50'
                          }`}>
                            {isDone ? (
                              <Check size={16} className="text-emerald-400" />
                            ) : isUploading ? (
                              <Loader2 size={16} className="text-secondary animate-spin" />
                            ) : isError ? (
                              <AlertCircle size={16} className="text-red-400" />
                            ) : (
                              <FileText size={16} className="text-muted" />
                            )}
                          </div>

                          {/* Label */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-semibold text-white">{doc.label}</span>
                              {doc.required ? (
                                <span className="text-[10px] font-bold text-red-400 bg-red-500/10 px-1.5 py-0.5 rounded">Required</span>
                              ) : (
                                <span className="text-[10px] font-bold text-muted bg-dark-border/50 px-1.5 py-0.5 rounded">Optional</span>
                              )}
                            </div>
                            <p className="text-xs text-muted mt-0.5">
                              {isDone
                                ? <span className="text-emerald-400">✓ {state.fileName}</span>
                                : isError
                                ? <span className="text-red-400">{state.error}</span>
                                : isUploading
                                ? <span className="text-secondary">Uploading {state.fileName}…</span>
                                : doc.hint}
                            </p>
                          </div>

                          {/* Upload button */}
                          {!isUploading && (
                            <label className={`shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold cursor-pointer transition-all ${
                              isDone
                                ? 'border border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/10'
                                : 'bg-dark-hover border border-dark-border text-muted hover:text-white hover:border-white/30'
                            }`}>
                              <Upload size={12} />
                              {isDone ? 'Replace' : 'Upload'}
                              <input
                                type="file"
                                accept=".pdf,.docx,.doc,.jpg,.jpeg,.png"
                                className="hidden"
                                onChange={e => handleDocUpload(e, doc.key)}
                              />
                            </label>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Progress indicator */}
                  <div className="flex items-center gap-2 text-xs text-muted">
                    <span>{requiredDocs.filter(d => docMap[d.key]?.status === 'done').length} / {requiredDocs.length} required documents uploaded</span>
                    {anyDocUploading && <Loader2 size={12} className="animate-spin text-secondary" />}
                  </div>
                </div>
              )}

              {/* ── Payment Section — only shown when all required docs are done ── */}
              {propertyId && allRequiredDone && (
                <div className="mt-2 p-6 border border-secondary/30 rounded-xl bg-secondary/5">
                  <div className="flex items-center gap-3 mb-4">
                    <CreditCard size={20} className="text-secondary" />
                    <h3 className="text-lg font-bold text-white">Listing Payment</h3>
                  </div>

                  <div className="flex items-center justify-between mb-5">
                    <div>
                      <p className="text-sm text-muted">Platform Listing Fee</p>
                      <p className="text-3xl font-display font-black text-white">₹999</p>
                      <p className="text-xs text-muted mt-1">One-time fee · Property goes live after admin review</p>
                    </div>
                    <div className="flex items-center gap-1 text-emerald-400 text-sm font-bold">
                      <Check size={16} />
                      All docs verified
                    </div>
                  </div>

                  <button
                    id="pay-now-btn"
                    onClick={handlePayNow}
                    disabled={paymentPending}
                    className="w-full flex items-center justify-center gap-2 py-4 rounded-lg bg-secondary text-black font-bold text-base hover:bg-teal-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {paymentPending ? (
                      <><Loader2 size={18} className="animate-spin" /> Processing...</>
                    ) : (
                      <><CreditCard size={18} /> Pay Now — ₹999</>
                    )}
                  </button>

                  <p className="text-center text-xs text-muted mt-3">
                    Demo payment · No real money charged
                  </p>
                </div>
              )}
            </div>
          )}

          {/* ── Navigation Buttons ── */}
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
              !propertyId && (
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
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
}