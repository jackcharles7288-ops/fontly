/**
 * Build-time homepage overview video metadata.
 * Single source for HomeVideo.astro and Schema VideoObject.
 */
export const HOME_VIDEO = {
  youtubeId: '0__RHitjs1w',
  title: 'Fonti: Free Font Generator | Copy & Paste Styled Text',
  description:
    'A short Fonti overview showing how to type text, browse and search Unicode styles, copy a result, build a custom style, and use styled text in supported fields on desktop and mobile.',
  duration: 'PT1M9.5S',
  /** Owner-confirmed local upload date (Asia/Karachi). Date-only precision. */
  uploadDate: '2026-10-15',
  watchUrl: 'https://www.youtube.com/watch?v=0__RHitjs1w',
  embedUrl: 'https://www.youtube-nocookie.com/embed/0__RHitjs1w',
  playbackUrl:
    'https://www.youtube-nocookie.com/embed/0__RHitjs1w?autoplay=1&playsinline=1',
  heading: 'Watch Fonti in action',
  intro: 'See how to browse styles, copy text, and make a style of your own.',
  playLabel: 'Play Fonti overview video on YouTube',
  thumbnail: {
    path480: '/images/video/fonti-overview-480.webp',
    path800: '/images/video/fonti-overview-800.webp',
    path1200: '/images/video/fonti-overview-1200.webp',
    width: 1200,
    height: 675,
  },
} as const;

export type HomeVideoMeta = typeof HOME_VIDEO;
