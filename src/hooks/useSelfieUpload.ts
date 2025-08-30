import { useState } from "react";
import { toast } from "sonner";

interface SelfieUploadParams {
  eventId: string;
  bibNumber: string;
  organizerId: string;
}

interface LambdaResponse {
  message: string;
  images_by_selfie?: string[];
}

const LAMBDA_ENDPOINT_URL =
  "https://p52zmaxn1h.execute-api.us-east-1.amazonaws.com/prd/selfie";
const LAMBDA_TIMEOUT_MS = 30000;

export function useSelfieUpload({
  eventId,
  bibNumber,
  organizerId,
}: SelfieUploadParams) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  // if (!organizerId || !eventId || !bibNumber) {
  //   toast.error("Organizer ID or Event ID or Bib Number is not available");
  //   return {
  //     uploadSelfie: () => Promise.resolve([]),
  //     isProcessing: false,
  //     uploadedFile: null,
  //   };
  // }

  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        const base64String = result.split(",")[1];
        if (base64String) {
          resolve(base64String);
        } else {
          reject(new Error("Failed to extract base64"));
        }
      };
      reader.onerror = () => reject(new Error("Failed to read file"));
    });
  };

  const callLambdaFunction = async (base64Image: string): Promise<string[]> => {
    const payload = {
      image: base64Image,
      bib_number: bibNumber,
      organizer_id: organizerId,
      event_id: eventId,
    };

    const response = await fetch(LAMBDA_ENDPOINT_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(LAMBDA_TIMEOUT_MS),
    });

    if (!response.ok) {
      throw new Error(`Server responded with ${response.status}`);
    }

    const result = (await response.json()) as LambdaResponse;
    return result.images_by_selfie ?? [];
  };

  const validateFile = (file: File): boolean => {
    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/heic"];
    const maxSize = 10 * 1024 * 1024; // 10MB

    if (!validTypes.includes(file.type.toLowerCase())) {
      toast.error("Please upload a valid image file (JPG, PNG, or HEIC)");
      return false;
    }

    if (file.size > maxSize) {
      toast.error("File size must be less than 10MB");
      return false;
    }

    return true;
  };

  const uploadSelfie = async (file: File): Promise<boolean> => {
    // Check if all required params are available
    if (!bibNumber || !eventId) {
      toast.error("Please enter a bib number first");
      return false;
    }

    if (!validateFile(file)) {
      return false;
    }

    setUploadedFile(file);
    setIsProcessing(true);

    try {
      const base64Image = await convertToBase64(file);
      const matchedPhotos = await callLambdaFunction(base64Image);
      // if (matchedPhotos.length > 0) {
      //   toast.success(
      //     `Found ${matchedPhotos.length} additional photo${matchedPhotos.length > 1 ? "s" : ""} using face matching!`,
      //   );
      // } else {
      //   toast.info(
      //     "No additional photos found. Try a different photo with clearer face visibility.",
      //   );
      // }
      return matchedPhotos.length > 0;
    } catch (error) {
      console.error("Selfie upload error:", error);
      const message = error instanceof Error ? error.message : "Unknown error";
      toast.error(`Failed to process selfie: ${message}`);
      return false;
    } finally {
      setIsProcessing(false);
    }
  };

  const reset = () => {
    setUploadedFile(null);
    setIsProcessing(false);
  };

  return {
    uploadSelfie,
    isProcessing,
    uploadedFile,
    reset,
  };
}
