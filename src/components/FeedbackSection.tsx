"use client";

import { useState } from "react";
import { Star, MessageSquare, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

interface FeedbackSectionProps {
  eventId: string;
  bibNumber: string;
  eventName: string;
}

export function FeedbackSection({
  eventId,
  bibNumber,
  eventName,
}: FeedbackSectionProps) {
  const [rating, setRating] = useState<number>(0);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rating) return;

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventId,
          bibNumber,
          rating,
          comment: comment.trim() || undefined,
        }),
      });

      if (response.ok) {
        toast.success("Thank you for your feedback!", {
          description: "Your feedback helps us improve our service.",
        });
        setRating(0);
        setComment("");
      } else {
        toast.error("Failed to submit feedback", {
          description: "Please try again later.",
        });
      }
    } catch (error) {
      console.error("Failed to submit feedback:", error);
      toast.error("Failed to submit feedback", {
        description: "Please check your connection and try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="border-muted">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <MessageSquare className="text-primary h-5 w-5 bg-white" />
          How was your SnapRace experience?
        </CardTitle>
        <p className="text-muted-foreground text-sm">
          Help us improve our service for {eventName}
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Star Rating */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Rate your experience</label>
            <div className="mt-1 flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="p-1 transition-colors hover:scale-110"
                >
                  <Star
                    className={`h-6 w-6 transition-colors ${
                      star <= (hoverRating || rating)
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-gray-300 hover:text-yellow-300"
                    }`}
                  />
                </button>
              ))}
              {rating > 0 && (
                <span className="text-muted-foreground ml-2 text-sm">
                  {rating === 1 && "Poor"}
                  {rating === 2 && "Fair"}
                  {rating === 3 && "Good"}
                  {rating === 4 && "Very Good"}
                  {rating === 5 && "Excellent"}
                </span>
              )}
            </div>
          </div>

          {/* Optional Comment */}
          <div className="space-y-2">
            <label htmlFor="comment" className="text-sm font-medium">
              Additional comments (optional)
            </label>
            <Textarea
              id="comment"
              placeholder="Tell us what you loved or what we could improve..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="mt-1 min-h-[80px] resize-none bg-white"
              maxLength={500}
            />
            <div className="text-muted-foreground text-right text-xs">
              {comment.length}/500
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex items-center justify-between">
            <p className="text-muted-foreground text-xs">
              Your feedback helps us improve our service
            </p>
            <Button
              type="submit"
              disabled={!rating || isSubmitting}
              className="gap-2"
              size="sm"
            >
              {isSubmitting ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  Send Feedback
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
