package com.reqsync.reqsync_backend.srs.dto;

/**
 * Payload used by the Business Analyst to manually
 * adjust a generated SRS document.
 *
 * @param title        Optional new document title.
 * @param content      Optional new Markdown content.
 * @param status       Optional lifecycle status change.
 */
public record SrsUpdateRequest(
        String title,
        String content,
        String status
) {
}
