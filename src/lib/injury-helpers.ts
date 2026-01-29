import { supabase } from './supabase';

/**
 * Fetch pelapor (reporter) profile data from database
 * Returns nama and wilayah with proper fallbacks
 */
export async function fetchPelaporData(userId: string): Promise<{ nama: string; wilayah: string }> {
  try {
    const { data: pelaporProfile } = await supabase
      .from('profiles')
      .select('full_name, wilayah, dojang')
      .eq('id', userId)
      .single();
    
    if (pelaporProfile) {
      return {
        nama: pelaporProfile.full_name || 'Tidak diketahui',
        wilayah: pelaporProfile.wilayah || pelaporProfile.dojang || '(Belum diisi)'
      };
    }
  } catch (err) {
    console.error('Error fetching pelapor profile:', err);
  }
  
  // Fallback if query fails or no data
  return {
    nama: 'Tidak diketahui',
    wilayah: '(Belum diisi)'
  };
}

/**
 * Format timestamp to date-only string (YYYY-MM-DD)
 * Handles both ISO timestamps and date strings consistently
 */
export function formatDateOnly(dateInput: string | null | undefined): string | undefined {
  if (!dateInput) return undefined;
  
  try {
    // Parse the date and extract only YYYY-MM-DD part
    const date = new Date(dateInput);
    return date.toISOString().slice(0, 10);
  } catch (err) {
    console.error('Error formatting date:', err);
    return undefined;
  }
}
