export function normalizeNewlines(text: string): string {
    // Normalize CRLF/CR -> LF for consistent matching.
    return text.replace(/\r\n?/g, "\n");
}
