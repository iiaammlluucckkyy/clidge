/**
 * CLIDGE Institutional Multi-Tenancy & White-Label Branding Configuration
 *
 * Configurable via environment variables (VITE_*) for turnkey deployment
 * across higher-education institutions without hardcoded brand lock-in.
 */

export const BRANDING = {
  // Institution Name (e.g., 'Muthayammal Engineering College')
  institutionName: import.meta.env.VITE_INSTITUTION_NAME || 'Muthayammal Engineering College',

  // Institution Short Code or Acronym (e.g., 'MEC')
  institutionCode: import.meta.env.VITE_INSTITUTION_CODE || 'MEC',

  // Campus Department or Faculty
  department: import.meta.env.VITE_CAMPUS_DEPARTMENT || 'Department of Computer Science & Engineering',

  // System Brand Name
  platformName: import.meta.env.VITE_PLATFORM_NAME || 'CLIDGE',

  // Platform Subtitle / Tagline
  platformSubtitle: import.meta.env.VITE_CAMPUS_TITLE || 'Smart Campus Presence System',

  // Official Support / IT Desk Email
  supportEmail: import.meta.env.VITE_SUPPORT_EMAIL || 'support@clidge.edu.in',

  // Primary Geofence Badge Label
  geofenceLabel: import.meta.env.VITE_GEOFENCE_LABEL || 'Campus Geofence Active',

  // Portal Labels
  facultyPortalName: 'Faculty Portal',
  studentPortalName: 'Student Portal',

  // Standard Footer Copyright
  copyrightText: `© 2026 ${import.meta.env.VITE_PLATFORM_NAME || 'CLIDGE'} • ${import.meta.env.VITE_INSTITUTION_NAME || 'Muthayammal Engineering College'}. All Rights Reserved.`
};

export default BRANDING;
