"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { PhotoSingleView } from "@/components/PhotoSingleView";
import { Skeleton } from "@/components/ui/skeleton";

interface PhotoShareClientProps {
  photoId: string;
  photoUrl: string;
}

export function PhotoShareClient({ photoId, photoUrl }: PhotoShareClientProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading for smooth transition
    const timer = setTimeout(() => setIsLoading(false), 100);
    return () => clearTimeout(timer);
  }, []);

  const handleIndexChange = () => {
    // Single photo view doesn't need index changes
    return;
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="text-center">
          <Skeleton className="mx-auto mb-4 h-96 w-96" />
          <Skeleton className="mx-auto mb-2 h-4 w-48" />
          <Skeleton className="mx-auto h-4 w-32" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <PhotoSingleView
        isOpen={true}
        onClose={() => router.push("/")}
        photos={[photoUrl]}
        currentIndex={0}
        onIndexChange={handleIndexChange}
        event=""
        bibNumber=""
      />
    </div>
  );
}
