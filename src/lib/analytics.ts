// Analytics utility functions

// Type definitions
interface EventParameters extends Record<string, unknown> {
  event_category?: string
  event_label?: string
  value?: number
}

interface PhotoViewEvent extends EventParameters {
  event_id: string
  bib_number: string
  photo_url: string
  photo_index?: number
}

interface PhotoDownloadEvent extends EventParameters {
  event_id: string
  bib_number: string
  download_type: 'single' | 'bulk'
  photo_count?: number
}

interface SelfieUploadEvent extends EventParameters {
  event_id: string
  bib_number: string
  success: boolean
  matched_photos?: number
}

interface FeedbackEvent extends EventParameters {
  event_id: string
  bib_number: string
  rating: number
  has_comment?: boolean
}


interface PerformanceEvent extends EventParameters {
  name: string
  value: number
}

// Core tracking function
export const trackEvent = (eventName: string, parameters?: EventParameters) => {
  if (typeof window !== 'undefined') {
    try {
      // Skip tracking in development environment
      if (process.env.NODE_ENV === 'development') {
        console.log('Analytics Event (dev):', eventName, parameters)
        return
      }

      // Use gtag function if available (from Google Analytics)
      if (window.gtag) {
        window.gtag('event', eventName, {
          custom_parameter: true,
          ...parameters
        })
      }
    } catch (error) {
      console.warn('Analytics tracking error:', error)
    }
  }
}

// Declare gtag function for TypeScript
declare global {
  interface Window {
    gtag?: (command: string, targetId: string, config?: Record<string, unknown>) => void
  }
}

// Photo-related events
export const trackPhotoView = (params: PhotoViewEvent) => {
  trackEvent('photo_view', {
    event_category: 'engagement',
    event_label: `${params.event_id}_${params.bib_number}`,
    ...params
  })
}

export const trackPhotoDownload = (params: PhotoDownloadEvent) => {
  trackEvent('photo_download', {
    event_category: 'conversion',
    event_label: `${params.event_id}_${params.bib_number}`,
    value: params.photo_count || 1,
    ...params
  })
}

export const trackBulkDownloadStart = (eventId: string, bibNumber: string, photoCount: number) => {
  trackEvent('bulk_download_start', {
    event_category: 'conversion',
    event_label: `${eventId}_${bibNumber}`,
    event_id: eventId,
    bib_number: bibNumber,
    photo_count: photoCount,
    download_type: 'bulk'
  })
}


// SNS 공유 관련 상세 추적
export const trackSocialShareClick = (eventId: string, bibNumber: string, platform: string) => {
  trackEvent('social_share_click', {
    event_category: 'engagement',
    event_label: platform,
    event_id: eventId,
    bib_number: bibNumber,
    share_platform: platform
  })
}


export const trackShareComplete = (eventId: string, bibNumber: string, platform: string, success: boolean) => {
  trackEvent('share_complete', {
    event_category: 'conversion',
    event_label: `${eventId}_${bibNumber}_${platform}`,
    event_id: eventId,
    bib_number: bibNumber,
    share_platform: platform,
    success: success
  })
}

export const trackShareLinkCopy = (eventId: string, bibNumber: string, success: boolean) => {
  trackEvent('share_link_copy', {
    event_category: 'engagement',
    event_label: `${eventId}_${bibNumber}`,
    event_id: eventId,
    bib_number: bibNumber,
    success: success
  })
}

// Selfie upload tracking
export const trackSelfieUpload = (params: SelfieUploadEvent) => {
  trackEvent('selfie_upload', {
    event_category: 'engagement',
    event_label: `${params.event_id}_${params.bib_number}`,
    ...params
  })
}


export const trackSelfieResults = (eventId: string, bibNumber: string, matchedCount: number) => {
  trackEvent('selfie_results', {
    event_category: 'engagement',
    event_label: `${eventId}_${bibNumber}`,
    event_id: eventId,
    bib_number: bibNumber,
    matched_photos: matchedCount,
    success: matchedCount > 0
  })
}

// Feedback tracking
export const trackFeedbackSubmit = (params: FeedbackEvent) => {
  trackEvent('feedback_submit', {
    event_category: 'engagement',
    event_label: `${params.event_id}_${params.bib_number}`,
    ...params
  })
}



export const trackEventPageVisit = (eventId: string, bibNumber?: string, isAllPhotos = false) => {
  trackEvent('event_page_visit', {
    event_category: 'engagement',
    event_label: eventId,
    event_id: eventId,
    bib_number: bibNumber || undefined,
    is_all_photos: isAllPhotos
  })
}

// Campaign tracking
export const trackCampaignVisit = (
  utmSource: string,
  utmMedium?: string,
  utmCampaign?: string,
  landingPage?: string
) => {
  trackEvent('campaign_visit', {
    event_category: 'acquisition',
    event_label: utmSource,
    utm_source: utmSource,
    utm_medium: utmMedium,
    utm_campaign: utmCampaign,
    landing_page: landingPage
  })
}

// Performance tracking
export const trackPerformance = (metric: PerformanceEvent) => {
  trackEvent('web_vital', {
    event_category: 'performance',
    event_label: metric.name,
    ...metric
  })
}


// Time tracking
export const trackTimeSpent = (page: string, timeSeconds: number) => {
  trackEvent('time_on_page', {
    event_category: 'engagement',
    event_label: page,
    page_name: page,
    time_spent: timeSeconds
  })
}