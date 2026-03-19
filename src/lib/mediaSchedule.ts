export const MOSCOW_TIME_ZONE = "Europe/Moscow";

export interface ScheduledMediaLike {
  id?: string;
  is_24_7?: boolean | null;
  start_time?: string | null;
  end_time?: string | null;
}

const moscowTimeFormatter = new Intl.DateTimeFormat("en-GB", {
  timeZone: MOSCOW_TIME_ZONE,
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

export const parseTimeToMinutes = (timeStr: string): number => {
  const [hours = "0", minutes = "0"] = timeStr.trim().split(":");
  return Number.parseInt(hours, 10) * 60 + Number.parseInt(minutes, 10);
};

export const normalizeDbTimeString = (timeValue: string | null | undefined): string | null => {
  if (!timeValue) return null;

  const match = timeValue.match(/(\d{2}:\d{2})(?::\d{2})?/);
  return match?.[1] ?? null;
};

export const hasScheduledWindow = (media: ScheduledMediaLike): boolean =>
  Boolean(normalizeDbTimeString(media.start_time) && normalizeDbTimeString(media.end_time));

export const getCurrentMoscowMinutes = (date = new Date()): number => {
  const parts = moscowTimeFormatter.formatToParts(date);
  const hour = Number(parts.find((part) => part.type === "hour")?.value ?? "0");
  const minute = Number(parts.find((part) => part.type === "minute")?.value ?? "0");
  return hour * 60 + minute;
};

export const isMediaScheduledNow = (media: ScheduledMediaLike, date = new Date()): boolean => {
  const startTime = normalizeDbTimeString(media.start_time);
  const endTime = normalizeDbTimeString(media.end_time);

  if (!startTime || !endTime) return true;

  const currentMinutes = getCurrentMoscowMinutes(date);
  const startMinutes = parseTimeToMinutes(startTime);
  const endMinutes = parseTimeToMinutes(endTime);

  if (startMinutes === endMinutes) {
    return true;
  }

  if (endMinutes < startMinutes) {
    return currentMinutes >= startMinutes || currentMinutes < endMinutes;
  }

  return currentMinutes >= startMinutes && currentMinutes < endMinutes;
};

export const getCurrentlyPlayableMedia = <T extends ScheduledMediaLike>(mediaItems: T[], date = new Date()): T[] =>
  mediaItems.filter((media) => isMediaScheduledNow(media, date));

export const getPreferredPlayableMedia = <T extends ScheduledMediaLike>(mediaItems: T[], date = new Date()): T | null => {
  const playableMedia = getActivePlaybackQueue(mediaItems, date);
  const scheduledMedia = playableMedia.find((media) => hasScheduledWindow(media));

  if (scheduledMedia) return scheduledMedia;

  return playableMedia.find((media) => media.is_24_7) ?? playableMedia[0] ?? null;
};

export const getActivePlaybackQueue = <T extends ScheduledMediaLike>(mediaItems: T[], date = new Date()): T[] => {
  const playableMedia = getCurrentlyPlayableMedia(mediaItems, date);
  const scheduledMedia = playableMedia.filter((media) => hasScheduledWindow(media));
  if (scheduledMedia.length > 0) return scheduledMedia;

  const active247Media = playableMedia.filter((media) => media.is_24_7);
  if (active247Media.length > 0) return active247Media;

  return playableMedia;
};

export const getNextPlayableMedia = <T extends ScheduledMediaLike & { id?: string }>(
  mediaItems: T[],
  currentMediaId?: string | null,
  date = new Date(),
): T | null => {
  const playableMedia = getActivePlaybackQueue(mediaItems, date);

  if (playableMedia.length === 0) return null;
  if (!currentMediaId) return playableMedia[0];

  const currentIndex = playableMedia.findIndex((media) => media.id === currentMediaId);
  if (currentIndex === -1) return playableMedia[0];

  return playableMedia[(currentIndex + 1) % playableMedia.length];
};
