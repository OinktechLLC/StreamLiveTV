import { useState, useEffect, useCallback } from "react";
import {
  getNextPlayableMedia,
  getPreferredPlayableMedia,
} from "@/lib/mediaSchedule";

interface MediaContent {
  id: string;
  title: string;
  file_url: string;
  file_type: string | null;
  duration: number | null;
  is_24_7: boolean;
  scheduled_at: string | null;
  start_time: string | null;
  end_time: string | null;
}

export const useScheduledPlayback = (mediaContent: MediaContent[]) => {
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  const [scheduledMedia, setScheduledMedia] = useState<MediaContent | null>(null);

  const findScheduledMedia = useCallback(() => {
    return getPreferredPlayableMedia(mediaContent);
  }, [mediaContent]);

  const updateCurrentMedia = useCallback(() => {
    const scheduled = findScheduledMedia();
    
    if (scheduled) {
      setScheduledMedia(scheduled);
      const index = mediaContent.findIndex(m => m.id === scheduled.id);
      if (index !== -1 && index !== currentMediaIndex) {
        setCurrentMediaIndex(index);
      }
    }
  }, [findScheduledMedia, mediaContent, currentMediaIndex]);

  useEffect(() => {
    if (mediaContent.length === 0) return;

    // Initial check
    updateCurrentMedia();

    // Check every minute for schedule changes
    const interval = setInterval(() => {
      updateCurrentMedia();
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [mediaContent, updateCurrentMedia]);

  const handleMediaEnded = useCallback(() => {
    // Check if there's scheduled content that should play
    const scheduled = findScheduledMedia();

    if (scheduled && scheduled.id !== mediaContent[currentMediaIndex]?.id) {
      const index = mediaContent.findIndex(m => m.id === scheduled.id);
      if (index !== -1) {
        setCurrentMediaIndex(index);
        return;
      }
    }

    const nextPlayableMedia = getNextPlayableMedia(mediaContent, mediaContent[currentMediaIndex]?.id);
    if (!nextPlayableMedia) return;

    const nextIndex = mediaContent.findIndex((media) => media.id === nextPlayableMedia.id);
    if (nextIndex !== -1) {
      setCurrentMediaIndex(nextIndex);
    }
  }, [currentMediaIndex, mediaContent, findScheduledMedia]);

  return {
    currentMediaIndex,
    setCurrentMediaIndex,
    scheduledMedia,
    handleMediaEnded,
    getCurrentMoscowTime: () => new Date(),
  };
};

export default useScheduledPlayback;
