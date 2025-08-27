"use client";

import { Camera, Calendar, User } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  message: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function EmptyState({ 
  icon,
  title, 
  message, 
  action 
}: EmptyStateProps) {
  return (
    <div className="py-16 text-center">
      {icon && (
        <div className="mb-6 flex justify-center">
          <div className="bg-muted p-4 rounded-full">
            {icon}
          </div>
        </div>
      )}
      <h3 className="mb-2 text-xl font-semibold text-foreground">
        {title}
      </h3>
      <p className="text-muted-foreground mb-6 max-w-md mx-auto">
        {message}
      </p>
      {action && (
        <Button variant="outline" onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </div>
  );
}

export function NoEventsState() {
  return (
    <EmptyState
      icon={<Calendar className="h-10 w-10 text-muted-foreground" />}
      title="No Events Available"
      message="There are no events available at the moment. Please check back later."
    />
  );
}

export function NoPhotosState({ 
  isAllPhotos = false, 
  bibNumber = "",
  onViewAllPhotos
}: { 
  isAllPhotos?: boolean; 
  bibNumber?: string;
  onViewAllPhotos?: () => void;
}) {
  if (isAllPhotos) {
    return (
      <EmptyState
        icon={<Camera className="h-10 w-10 text-muted-foreground" />}
        title="No Photos Available"
        message="Photos for this event haven't been uploaded yet. Please check back later."
      />
    );
  }

  return (
    <EmptyState
      icon={<User className="h-10 w-10 text-muted-foreground" />}
      title="No Photos Found"
      message={`No photos found for bib number #${bibNumber}. Please try a different bib number.`}
      action={onViewAllPhotos ? {
        label: "View All Event Photos",
        onClick: onViewAllPhotos
      } : undefined}
    />
  );
}