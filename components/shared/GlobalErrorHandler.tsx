'use client';

import { useEffect } from 'react';

export default function GlobalErrorHandler() {
  useEffect(() => {
    // Handle global unhandled promise rejections (chunk loading errors)
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const error = event.reason;
      
      // Check if it's a chunk loading error
      if (
        error &&
        (error.name === 'ChunkLoadError' ||
         (typeof error === 'string' && error.includes('Loading chunk')) ||
         (error.message && error.message.includes('Loading chunk')))
      ) {
        console.log('Chunk loading error detected, reloading page...');
        event.preventDefault();
        window.location.reload();
      }
    };

    // Handle global JavaScript errors
    const handleError = (event: ErrorEvent) => {
      const error = event.error;
      
      if (
        error &&
        (error.name === 'ChunkLoadError' ||
         error.message.includes('Loading chunk'))
      ) {
        console.log('Chunk loading error detected, reloading page...');
        window.location.reload();
      }
    };

    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    window.addEventListener('error', handleError);

    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
      window.removeEventListener('error', handleError);
    };
  }, []);

  return null;
}
