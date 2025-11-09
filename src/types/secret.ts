/**
 * Secret - Simple key-value secret storage
 */
export interface Secret {
  id: string;
  name: string;
  description?: string;
  tags: string[];
  secretDataMasked?: Record<string, string>; // Key-value pairs (masked from API)
  secrets?: Record<string, string>; // Key-value pairs (unmasked, when editing/creating)
  active: boolean;
  createdAt: string;
  createdBy?: string;
  modifiedAt: string;
  modifiedBy?: string;
}

/**
 * Create Secret Request
 */
export interface SecretCreateRequest {
  name: string;
  description?: string;
  tags?: string[];
  secrets: Record<string, string>;
}

/**
 * Update Secret Request
 */
export interface SecretUpdateRequest {
  name?: string;
  description?: string;
  tags?: string[];
  secrets?: Record<string, string>;
}

/**
 * Secret Search Parameters
 */
export interface SecretSearchParams {
  query?: string;
  tags?: string[];
  page?: number;
  size?: number;
}
