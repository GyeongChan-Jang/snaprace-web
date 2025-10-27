"use client";

import { useState, useMemo } from "react";
import { AlertCircle, Play } from "lucide-react";

import type { Event } from "@/server/api/routers/events";
import type { BibDetailResponse } from "@/server/services/timing-service";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

// YouTube iframe component
function YouTubeIframe({
  url,
  startTime,
  thumbnail,
  onReady,
  onError,
}: {
  url: string;
  startTime: number;
  thumbnail: string;
  onReady: () => void;
  onError: () => void;
}) {
  const [iframeLoaded, setIframeLoaded] = useState(false);

  // Extract YouTube video ID
  const getYouTubeId = (url: string) => {
    const regex =
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/;
    const match = regex.exec(url);
    return match ? match[1] : "";
  };

  const videoId = getYouTubeId(url);
  const embedUrl = `https://www.youtube.com/embed/${videoId}?start=${Math.floor(startTime)}&rel=0&modestbranding=1`;

  return (
    <div className="relative h-full w-full">
      {!iframeLoaded && (
        <div
          className="absolute inset-0 rounded-lg bg-cover bg-center"
          style={{ backgroundImage: `url(${thumbnail})` }}
        >
          <div className="absolute inset-0 flex items-center justify-center bg-black/20">
            <Play className="h-16 w-16 text-white/80" />
          </div>
        </div>
      )}
      <iframe
        src={embedUrl}
        className="h-full w-full rounded-lg"
        onLoad={() => {
          setIframeLoaded(true);
          onReady();
        }}
        onError={onError}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        style={{ display: iframeLoaded ? "block" : "none" }}
      />
    </div>
  );
}

interface FinishlineVideoProps {
  event: Event;
  timingDetail: BibDetailResponse | null;
  isAllPhotos: boolean;
}

/**
 * 비디오 시작 시간을 계산하는 함수
 * @param videoInfo 비디오 정보
 * @param timingDetail 참가자 타이밍 정보
 * @param isAllPhotos 모든 사진 보기 모드 여부
 * @returns 비디오 시작 시간 (초)
 */
function calculateVideoStartTime(
  videoInfo: NonNullable<Event["finishline_video_info"]>,
  timingDetail: BibDetailResponse | null,
  isAllPhotos: boolean,
): number {
  // 모든 사진 보기 모드이거나 타이밍 정보가 없으면 0초부터 시작
  if (isAllPhotos || !timingDetail) {
    return 0;
  }

  const participantGunTime = getRowNumber(timingDetail.row, "clock_time");
  const firstParticipantGunTime = videoInfo.firstParticipantGunTime;
  const firstParticipantVideoTime = videoInfo.firstParticipantVideoTime;

  // gunTime이 없으면 0초부터 시작
  if (participantGunTime === undefined || participantGunTime === 0) {
    return 0;
  }

  // 시작 시간 계산: 첫 참가자 비디오 시간 + (참가자 GunTime - 첫 참가자 GunTime) - rewindSeconds(8초)
  const startTime =
    firstParticipantVideoTime +
    (participantGunTime - firstParticipantGunTime) -
    videoInfo.rewindSeconds;

  // 음수 방지
  return Math.max(0, startTime);
}

/**
 * 타이밍 데이터에서 숫자 값 추출
 */
function getRowNumber(
  row: BibDetailResponse["row"] | undefined,
  key: string,
): number | undefined {
  if (!row) return undefined;
  const value = row[key];
  if (typeof value === "number") {
    return value;
  }
  if (typeof value === "string") {
    return mmssToSeconds(value);
  }
  return undefined;
}

function mmssToSeconds(timeStr: string): number {
  const [min, sec] = timeStr.split(":");

  if (!min || !sec) return 0;

  return Number(min) * 60 + parseFloat(sec);
}

function VideoError({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="bg-muted flex aspect-video w-full flex-col items-center justify-center rounded-lg p-6 text-center">
      <AlertCircle className="text-muted-foreground mb-4 h-12 w-12" />
      <h3 className="text-foreground mb-2 font-semibold">
        Unable to load video
      </h3>
      <p className="text-muted-foreground mb-4 text-sm">
        Please try again later
      </p>
      <Button onClick={onRetry} variant="outline" size="sm">
        Retry
      </Button>
    </div>
  );
}

export function FinishlineVideo({
  event,
  timingDetail,
  isAllPhotos,
}: FinishlineVideoProps) {
  const [hasError, setHasError] = useState(false);

  const videoInfo = event.finishline_video_info;

  // Calculate video start time (Hook order issue prevention)
  const startTime = useMemo(() => {
    if (!videoInfo || videoInfo.status !== "enabled") {
      return 0;
    }
    return calculateVideoStartTime(videoInfo, timingDetail, isAllPhotos);
  }, [videoInfo, timingDetail, isAllPhotos]);

  // Don't render if video info doesn't exist or is disabled
  if (!videoInfo || videoInfo.status !== "enabled") {
    return null;
  }

  const handleError = () => {
    setHasError(true);
    console.error("Failed to load video");
  };

  const handleRetry = () => {
    setHasError(false);
  };

  const handleReady = () => {
    setHasError(false);
  };

  // Participant information
  const participantName = timingDetail?.meta.name;
  const participantBib = timingDetail?.meta.bib;

  return (
    <article className="border-border/60 bg-background/95 overflow-hidden rounded-2xl border shadow-sm">
      <Accordion type="single" collapsible>
        <AccordionItem value="finishline-video" className="border-0">
          <AccordionTrigger className="px-3 hover:no-underline">
            <div className="flex items-center gap-1.5 md:gap-2">
              <Play className="text-primary h-4 w-4 md:h-5 md:w-5" />
              <h2 className="text-sm font-semibold md:text-lg">Video Finish</h2>
              {!isAllPhotos && participantName && (
                <Badge variant="outline" className="text-xs">
                  Bib #{participantBib}
                </Badge>
              )}
            </div>
          </AccordionTrigger>
          <AccordionContent className="overflow-hidden">
            <div className="w-full max-w-full space-y-4 px-3 pb-4 md:px-6 md:pb-6">
              {!isAllPhotos && participantName && (
                <p className="text-muted-foreground text-sm">
                  {participantName}&apos;s finish moment
                </p>
              )}

              {/* Video Player */}
              <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-black">
                {hasError ? (
                  <VideoError onRetry={handleRetry} />
                ) : (
                  <YouTubeIframe
                    url={videoInfo.url}
                    startTime={startTime}
                    thumbnail={videoInfo.thumbnail}
                    onReady={handleReady}
                    onError={handleError}
                  />
                )}

                {/* Start time overlay */}
                {/* {startTime > 0 && (
                  <div className="absolute bottom-2 left-2 rounded bg-black/70 px-2 py-1 text-xs text-white">
                    Starts at {Math.floor(startTime / 60)}:
                    {(Math.floor(startTime) % 60).toString().padStart(2, "0")}
                  </div>
                )} */}
              </div>

              {/* Video Information */}
              <div className="text-muted-foreground flex items-center justify-between text-sm">
                <div>
                  {!isAllPhotos && timingDetail ? (
                    <span className="text-xs md:text-sm">
                      Personal finish video (starts at {Math.floor(startTime)}s)
                    </span>
                  ) : (
                    <span className="text-xs md:text-sm">
                      Full finish line video
                    </span>
                  )}
                </div>
                <div className="text-xs md:text-sm">
                  Duration: {Math.floor(videoInfo.duration / 60)}:
                  {(Math.floor(videoInfo.duration) % 60)
                    .toString()
                    .padStart(2, "0")}
                </div>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </article>
  );
}
