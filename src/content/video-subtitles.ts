export const sia2026VideoUrl = "https://rfeqcidlnvpbabuuiozp.supabase.co/storage/v1/object/public/site-videos/epureau-sia-2026-c365e3b49c5f.mp4";

// Attach this translation only to the exact film it was timed against.
// Replacing a video in the CMS must not retain unrelated subtitles.
export function englishSubtitlesForVideo(value: string) {
  try {
    const url = new URL(value);
    return url.origin + url.pathname === sia2026VideoUrl
      ? "/subtitles/epureau-sia-2026.en.vtt"
      : undefined;
  } catch {
    return undefined;
  }
}
