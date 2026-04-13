/**
 * Builds a full URL to a server-hosted asset (avatar, upload…).
 * Uses NEXT_PUBLIC_SERVER_URL so it works in both local dev and prod.
 */
export const serverUrl = (path) => {
    if (!path) return null;
    return `${process.env.NEXT_PUBLIC_SERVER_URL}${path}`;
};

/**
 * Builds a full URL to an API endpoint (e.g. ICS download).
 * Uses NEXT_PUBLIC_API_URL which already includes /api.
 */
export const apiUrl = (path) => {
    return `${process.env.NEXT_PUBLIC_API_URL}${path}`;
};
