import { supabase } from './supabaseClient';

/**
 * Tracks a visitor session to Supabase.
 * Stores timestamp, path, and basic device info.
 */
export const trackVisit = async (path = window.location.pathname) => {
  try {
    // If Supabase is not configured, silently skip in production
    if (!supabase) {
      if (import.meta.env.DEV) {
        console.log('📊 [Dev] Supabase not configured. Visit skipped:', path);
      }
      return;
    }

    // Optional: Prevent duplicate counts in the same tab session
    const sessionKey = `tracked_${path}`;
    if (sessionStorage.getItem(sessionKey)) return;

    const { error } = await supabase
      .from('visits')
      .insert([
        { 
          path,
          user_agent: navigator.userAgent,
          platform: navigator.platform,
          screen_resolution: `${window.screen.width}x${window.screen.height}`,
          referrer: document.referrer || 'direct'
        }
      ]);

    if (error) {
      // If table doesn't exist, we'll see it here
      console.warn('⚠️ Analytics error (possibly table missing):', error.message);
      return;
    }

    // Mark as tracked for this session
    sessionStorage.setItem(sessionKey, 'true');

  } catch (err) {
    if (import.meta.env.DEV) {
      console.error('❌ Failed to track visit:', err.message);
    }
  }
};
