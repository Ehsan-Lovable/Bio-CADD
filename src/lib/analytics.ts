interface AnalyticsEvent {
  event: string;
  properties?: Record<string, any>;
  userId?: string;
}

interface AnalyticsProvider {
  track: (event: string, properties?: Record<string, any>) => void;
  identify: (userId: string, traits?: Record<string, any>) => void;
  page: (name?: string, properties?: Record<string, any>) => void;
}

class Analytics implements AnalyticsProvider {
  private isEnabled: boolean;
  private userId: string | null = null;

  constructor() {
    this.isEnabled = typeof window !== 'undefined' && !window.location.hostname.includes('localhost');
  }

  track(event: string, properties: Record<string, any> = {}) {
    if (!this.isEnabled) {
      console.log('Analytics (dev):', event, properties);
      return;
    }

    const payload: AnalyticsEvent = {
      event,
      properties: {
        ...properties,
        timestamp: new Date().toISOString(),
        url: window.location.href,
        referrer: document.referrer,
        user_agent: navigator.userAgent,
      },
      userId: this.userId || undefined,
    };

    // Send to Google Analytics if available
    if (window.gtag) {
      window.gtag('event', event, {
        custom_parameter_1: JSON.stringify(properties),
        user_id: this.userId,
      });
    }

    // Send to custom analytics endpoint (future implementation)
    this.sendToAnalytics(payload);
  }

  identify(userId: string, traits: Record<string, any> = {}) {
    this.userId = userId;
    
    if (!this.isEnabled) {
      console.log('Analytics identify (dev):', userId, traits);
      return;
    }

    // Send to Google Analytics
    if (window.gtag) {
      window.gtag('config', 'GA_MEASUREMENT_ID', {
        user_id: userId,
        custom_map: traits,
      });
    }

    this.track('user_identified', traits);
  }

  page(name?: string, properties: Record<string, any> = {}) {
    if (!this.isEnabled) {
      console.log('Analytics page (dev):', name, properties);
      return;
    }

    const payload = {
      page: name || document.title,
      url: window.location.href,
      ...properties,
    };

    // Send to Google Analytics
    if (window.gtag) {
      window.gtag('config', 'GA_MEASUREMENT_ID', {
        page_title: payload.page,
        page_location: payload.url,
      });
    }

    this.track('page_view', payload);
  }

  private async sendToAnalytics(payload: AnalyticsEvent) {
    try {
      // This would send to your custom analytics endpoint
      // For now, we'll just log it
      console.log('Analytics payload:', payload);
      
      // Example of sending to a custom endpoint:
      // await fetch('/api/analytics', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(payload),
      // });
    } catch (error) {
      console.error('Analytics error:', error);
    }
  }

  // Learning-specific tracking methods
  trackCourseView(courseId: string, courseTitle: string) {
    this.track('course_viewed', {
      course_id: courseId,
      course_title: courseTitle,
    });
  }

  trackCourseEnrollment(courseId: string, courseTitle: string, price?: number) {
    this.track('course_enrolled', {
      course_id: courseId,
      course_title: courseTitle,
      price: price || 0,
    });
  }

  trackLessonStart(lessonId: string, courseId: string, lessonTitle: string) {
    this.track('lesson_started', {
      lesson_id: lessonId,
      course_id: courseId,
      lesson_title: lessonTitle,
    });
  }

  trackLessonProgress(lessonId: string, courseId: string, progress: number, duration: number) {
    this.track('lesson_progress', {
      lesson_id: lessonId,
      course_id: courseId,
      progress_seconds: progress,
      total_duration: duration,
      completion_rate: duration > 0 ? (progress / duration) * 100 : 0,
    });
  }

  trackLessonCompleted(lessonId: string, courseId: string, totalTime: number) {
    this.track('lesson_completed', {
      lesson_id: lessonId,
      course_id: courseId,
      total_time_seconds: totalTime,
    });
  }

  trackSearchQuery(query: string, resultsCount: number) {
    this.track('search_performed', {
      query,
      results_count: resultsCount,
    });
  }

  trackContactForm(formType: 'contact' | 'career') {
    this.track('form_submitted', {
      form_type: formType,
    });
  }
}

// Global analytics instance
export const analytics = new Analytics();

// React hook for analytics
export const useAnalytics = () => {
  return {
    track: analytics.track.bind(analytics),
    identify: analytics.identify.bind(analytics),
    page: analytics.page.bind(analytics),
    trackCourseView: analytics.trackCourseView.bind(analytics),
    trackCourseEnrollment: analytics.trackCourseEnrollment.bind(analytics),
    trackLessonStart: analytics.trackLessonStart.bind(analytics),
    trackLessonProgress: analytics.trackLessonProgress.bind(analytics),
    trackLessonCompleted: analytics.trackLessonCompleted.bind(analytics),
    trackSearchQuery: analytics.trackSearchQuery.bind(analytics),
    trackContactForm: analytics.trackContactForm.bind(analytics),
  };
};

// Types for window.gtag
declare global {
  interface Window {
    gtag: (...args: any[]) => void;
  }
}