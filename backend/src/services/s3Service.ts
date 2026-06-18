import { Request, Response } from "express";
import {
  PutObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

import { s3Client } from "../config/aws";
import { env } from "../config/env";

const PRESIGN_EXPIRY = 300; // 5 minutes

export const getMediaUploadUrl = async (
  fileName: string,
  fileType: string
): Promise<string> => {
  const key = `properties/${Date.now()}-${fileName}`;

  const command = new PutObjectCommand({
    Bucket: env.S3_MEDIA_BUCKET,
    Key: key,
    ContentType: fileType,
  });

  return getSignedUrl(s3Client, command, {
    expiresIn: PRESIGN_EXPIRY,
  });
};

export const getDocumentUploadUrl = async (
  userId: string,
  fileName: string,
  fileType: string,
  docType: string
): Promise<string> => {
  const key = `documents/${userId}/${docType}/${Date.now()}-${fileName}`;

  const command = new PutObjectCommand({
    Bucket: env.S3_DOCUMENTS_BUCKET,
    Key: key,
    ContentType: fileType,
  });

  return getSignedUrl(s3Client, command, {
    expiresIn: PRESIGN_EXPIRY,
  });
};

export const getDocumentReadUrl = async (
  key: string
): Promise<string> => {
  const command = new GetObjectCommand({
    Bucket: env.S3_DOCUMENTS_BUCKET,
    Key: key,
  });

  return getSignedUrl(s3Client, command, {
    expiresIn: PRESIGN_EXPIRY,
  });
};

export const uploadImage = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({
        success: false,
        message: "No file uploaded",
      });
      return;
    }

    const key = `properties/${Date.now()}-${req.file.originalname}`;

    await s3Client.send(
      new PutObjectCommand({
        Bucket: env.S3_MEDIA_BUCKET,
        Key: key,
        Body: req.file.buffer,
        ContentType: req.file.mimetype,
      })
    );

    const url = `https://${env.S3_MEDIA_BUCKET}.s3.${env.AWS_REGION}.amazonaws.com/${key}`;

    res.status(200).json({
      success: true,
      url,
      key,
    });
  } catch (error) {
    console.error("Image upload error:", error);

    res.status(500).json({
      success: false,
      message: "Image upload failed",
    });
  }
};

export const getUploadUrl = async (
  fileName: string,
  contentType: string
) => {
  const response = await api.post(
    "/properties/upload-url",
    {
      fileName,
      contentType,
    }
  );

  return response.data;
};