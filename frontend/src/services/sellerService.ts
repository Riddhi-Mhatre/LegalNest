import { api } from './api';

export interface SellerDashboardData {
  totalProperties: number;
  pendingApproval: number;
  approved: number;
  rejected: number;
  totalViews: number;
}

export const getSellerDashboard = (): Promise<SellerDashboardData> =>
  api.get('/seller/dashboard').then(r => r.data.data);

export const getSellerProperties = () =>
  api.get('/seller/properties').then(r => r.data.data);

export const getSellerPayments = () =>
  api.get('/seller/payments').then(r => r.data.data);

// ─── Image Upload (Media Bucket) ────────────────────────────────────────────
export const getImageUploadUrl = (
  fileName: string,
  fileType: string
): Promise<{ uploadUrl: string }> =>
  api.get('/properties/upload-url', { params: { fileName, fileType } }).then(r => r.data.data);

export const uploadImageToS3 = async (file: File): Promise<string> => {
  const { uploadUrl } = await getImageUploadUrl(file.name, file.type);
  const res = await fetch(uploadUrl, {
    method: 'PUT',
    body: file,
    headers: { 'Content-Type': file.type },
  });
  if (!res.ok) throw new Error(`S3 upload failed: ${res.status}`);
  // Return the public S3 URL (without presign query params)
  return uploadUrl.split('?')[0];
};

// ─── Document Upload (Documents Bucket) ─────────────────────────────────────
export const getDocumentUploadUrl = (
  fileName: string,
  fileType: string,
  docType: string
): Promise<{ uploadUrl: string; s3Key: string }> =>
  api
    .get('/seller/document-upload-url', { params: { fileName, fileType, docType } })
    .then(r => r.data.data);

export const uploadDocumentToS3 = async (
  file: File,
  docType: string
): Promise<{ s3Key: string; fileName: string }> => {
  const { uploadUrl, s3Key } = await getDocumentUploadUrl(file.name, file.type, docType);
  const res = await fetch(uploadUrl, {
    method: 'PUT',
    body: file,
    headers: { 'Content-Type': file.type },
  });
  if (!res.ok) throw new Error(`Document upload failed: ${res.status}`);
  return { s3Key, fileName: file.name };
};

// ─── Save documents to property ─────────────────────────────────────────────
export const saveDocumentsToProperty = (
  propertyId: string,
  documents: string[]
): Promise<any> =>
  api.patch(`/seller/properties/${propertyId}/documents`, { documents }).then(r => r.data.data);

// ─── Platform fee payment ────────────────────────────────────────────────────
export const payPlatformFee = (propertyId: string): Promise<any> =>
  api.post(`/seller/properties/${propertyId}/pay-fee`).then(r => r.data.data);

// ─── Delete a property ───────────────────────────────────────────────────────
export const deleteSellerProperty = (propertyId: string): Promise<any> =>
  api.delete(`/properties/${propertyId}`).then(r => r.data.data);
