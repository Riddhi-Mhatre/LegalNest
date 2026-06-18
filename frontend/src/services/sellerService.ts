import { api } from './api';
import axios from "axios";

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

export const uploadFileToS3 = async (file: File) => {
  try {
    console.log("Uploading:", file.name);

    const response = await api.post(
      "/properties/upload-url",
      {
        fileName: file.name,
        contentType: file.type,
      }
    );

    console.log("Upload URL response:", response.data);

    // Backend returns { uploadUrl, publicUrl, key } directly (not wrapped in .data)
    const { uploadUrl, publicUrl } = response.data;

    await axios.put(uploadUrl, file, {
      headers: {
        "Content-Type": file.type,
      },
    });

    console.log("Upload successful:", publicUrl);

    return publicUrl;
  } catch (error) {
    console.error("S3 Upload Error:", error);
    throw error;
  }
};
// ─── Document Upload (Documents Bucket) ─────────────────────────────────────
export const getDocumentUploadUrl = async (
  propertyId: string,
  fileName: string,
  contentType: string
) => {
  const response = await api.get(
    "/seller/document-upload-url",
    {
      params: {
  propertyId,
  fileName,
  fileType: contentType,
   },
    }
  );

  return response.data;
};

export const uploadDocumentToS3 = async (
  propertyId: string,
  file: File
) => {

  const response =
  await getDocumentUploadUrl(
    propertyId,
    file.name,
    file.type
  );

const {
  uploadUrl,
  s3Key
} = response.data;

  await axios.put(
    uploadUrl,
    file,
    {
      headers: {
        "Content-Type": file.type,
      },
    }
  );

  return s3Key;
};

// ─── Save documents to property ─────────────────────────────────────────────
export const saveDocumentsToProperty =
async (
  propertyId: string,
  documents: any[]
) => {

  const response = await api.patch(
    `/seller/properties/${propertyId}/documents`,
    {
      documents,
    }
  );

  return response.data;
};
// ─── Platform fee payment ────────────────────────────────────────────────────
export const payPlatformFee = (propertyId: string): Promise<any> =>
  api.post(`/seller/properties/${propertyId}/pay-fee`).then(r => r.data.data);

// ─── Delete a property ───────────────────────────────────────────────────────
export const deleteSellerProperty = (propertyId: string): Promise<any> =>
  api.delete(`/properties/${propertyId}`).then(r => r.data.data);
