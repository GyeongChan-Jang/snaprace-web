"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Camera, Shield, Eye, Lock, Trash2 } from "lucide-react";
import Link from "next/link";

interface FacialRecognitionConsentModalProps {
  /** Whether the modal is open */
  isOpen: boolean;
  /** Callback when modal should close */
  onClose: () => void;
  /** Callback when user agrees to facial recognition */
  onAgree: () => void;
  /** Callback when user denies consent */
  onDeny?: () => void;
  /** Event name for context */
  eventName?: string;
  /** Whether this is a required consent (affects button text) */
  isRequired?: boolean;
}

export function FacialRecognitionConsentModal({
  isOpen,
  onClose,
  onAgree,
  onDeny,
  eventName,
  isRequired = false,
}: FacialRecognitionConsentModalProps) {
  const [isProcessing, setIsProcessing] = useState(false);

  const handleAgree = async () => {
    setIsProcessing(true);
    try {
      onAgree();
      onClose();
    } catch (error) {
      console.error("Failed to process consent:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeny = () => {
    onDeny?.();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="max-h-[85vh] w-[95vw] max-w-2xl overflow-y-auto sm:w-full lg:min-w-[600px]"
        style={{
          scrollbarWidth: "thin",
        }}
      >
        <DialogHeader className="space-y-3 sm:space-y-4">
          <DialogTitle className="flex flex-col gap-2 text-lg sm:flex-row sm:items-center sm:gap-2 sm:text-xl">
            <div className="flex items-center gap-2">
              <Camera className="h-5 w-5 text-blue-600 sm:h-6 sm:w-6" />
              <span>Facial Recognition Consent</span>
            </div>
            <Badge
              variant="outline"
              className="self-start border-orange-600 text-orange-600 sm:self-auto"
            >
              Biometric Data
            </Badge>
          </DialogTitle>
          <DialogDescription className="text-sm leading-relaxed sm:text-base">
            {eventName ? (
              <>
                To find your photos from <strong>{eventName}</strong>, SnapRace
                will scan the geometry of the face in your selfie.
              </>
            ) : (
              <>
                To find your photos, SnapRace will scan the geometry of the face
                in your selfie.
              </>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-3 sm:space-y-6 sm:py-4">
          {/* How It Works */}
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 sm:p-4">
            <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-blue-900 sm:mb-3 sm:text-base">
              <Eye className="h-3 w-3 sm:h-4 sm:w-4" />
              How It Works
            </h3>
            <div className="space-y-1 text-xs text-blue-800 sm:space-y-2 sm:text-sm">
              <p>1. You upload a selfie photo of yourself</p>
              <p>2. Our technology analyzes the geometry of your face</p>
              <p>3. We compare this to faces in official event photos</p>
              <p>
                4. All your photos are automatically grouped into a personal
                gallery
              </p>
            </div>
          </div>

          {/* Privacy Protection */}
          <div className="rounded-lg border border-green-200 bg-green-50 p-3 sm:p-4">
            <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-green-900 sm:mb-3 sm:text-base">
              <Shield className="h-3 w-3 sm:h-4 sm:w-4" />
              Your Privacy is Protected
            </h3>
            <div className="grid gap-1 text-xs text-green-800 sm:gap-2 sm:text-sm">
              <div className="flex items-start gap-2">
                <Lock className="mt-0.5 h-3 w-3 flex-shrink-0 sm:h-4 sm:w-4" />
                <span>
                  We only create a numeric representation of your facial
                  geometry
                </span>
              </div>
              <div className="flex items-start gap-2">
                <Shield className="mt-0.5 h-3 w-3 flex-shrink-0 sm:h-4 sm:w-4" />
                <span>
                  Used exclusively for photo identification - nothing else
                </span>
              </div>
              <div className="flex items-start gap-2">
                <Trash2 className="mt-0.5 h-3 w-3 flex-shrink-0 sm:h-4 sm:w-4" />
                <span>Automatically deleted after 3 years maximum</span>
              </div>
            </div>
          </div>

          {/* Your Rights */}
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 sm:p-4">
            <h3 className="mb-2 text-sm font-semibold text-amber-900 sm:mb-3 sm:text-base">
              Your Rights
            </h3>
            <div className="space-y-0.5 text-xs text-amber-800 sm:space-y-1 sm:text-sm">
              <p>• Request deletion of your data at any time</p>
              <p>
                • We will never sell or profit from your biometric information
              </p>
              <p>• Full transparency about how your data is used</p>
              <p>• Secure, encrypted storage with restricted access</p>
            </div>
          </div>

          {/* Legal Compliance */}
          <Alert className="p-3 sm:p-4">
            <Shield className="h-3 w-3 sm:h-4 sm:w-4" />
            <AlertDescription className="inline text-xs sm:text-sm">
              This consent meets the requirements of biometric privacy laws
              including Illinois BIPA. For complete details, please review our{" "}
              <Link
                href="/privacy-policy"
                className="font-medium whitespace-nowrap text-blue-600 hover:underline"
              >
                Privacy Policy
              </Link>
              .
            </AlertDescription>
          </Alert>
        </div>

        <DialogFooter className="flex flex-col gap-2 pt-3 sm:flex-row sm:gap-3 sm:pt-4 lg:justify-center">
          <Button
            variant="outline"
            onClick={handleDeny}
            disabled={isProcessing}
            className="order-2 h-10 text-sm sm:order-1 sm:h-11 sm:text-base"
          >
            {isRequired ? "Cancel" : "No Thanks"}
          </Button>
          <Button
            onClick={handleAgree}
            disabled={isProcessing}
            className="order-1 h-10 min-w-[120px] text-sm sm:order-2 sm:h-11 sm:min-w-[140px] sm:text-base"
          >
            {isProcessing ? (
              <div className="flex items-center gap-2">
                <div className="border-background h-3 w-3 animate-spin rounded-full border-2 border-t-transparent sm:h-4 sm:w-4" />
                <span className="text-xs sm:text-sm">Processing...</span>
              </div>
            ) : (
              "I Agree & Upload"
            )}
          </Button>
        </DialogFooter>

        {isRequired && (
          <Alert className="mt-3 border-orange-200 bg-orange-50 p-3 sm:mt-4 sm:p-4">
            <AlertDescription className="text-xs text-orange-700 sm:text-sm">
              Facial recognition consent is required to use our selfie search
              feature and find your photos automatically.
            </AlertDescription>
          </Alert>
        )}
      </DialogContent>
    </Dialog>
  );
}
