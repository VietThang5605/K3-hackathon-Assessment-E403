// Centralized API Configuration Helper for Local, Ngrok, Docker, and Production Deployments

export const getBackendUrl = () => {
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }
  if (typeof window !== 'undefined') {
    // Use full origin URL (e.g. https://xxxx.ngrok-free.app or http://localhost:3000)
    // Safari WebKit requires a full valid URL pattern.
    // Next.js rewrites will automatically proxy /api/* to Backend (http://localhost:8000/api/*).
    return window.location.origin;
  }
  return 'http://localhost:8000';
};
