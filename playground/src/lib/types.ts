/**
 * Bootstrap color variants used throughout the demo application
 */
export type BootstrapColor = 
  | 'primary'
  | 'secondary'
  | 'success'
  | 'danger'
  | 'warning'
  | 'info'
  | 'light'
  | 'dark';

/**
 * Bootstrap text color variants
 * Includes standard colors plus additional text-specific variants
 */
export type BootstrapTextColor = BootstrapColor | 'white' | 'muted' | 'black-50' | 'white-50' | 'body' | 'black';

/**
 * Bootstrap background color variants
 * Includes standard colors plus transparent
 */
export type BootstrapBackgroundColor = BootstrapColor | 'transparent';

/**
 * Bootstrap size variants used for spacing, buttons, etc.
 */
export type BootstrapSize = 'sm' | 'md' | 'lg' | 'xl';
