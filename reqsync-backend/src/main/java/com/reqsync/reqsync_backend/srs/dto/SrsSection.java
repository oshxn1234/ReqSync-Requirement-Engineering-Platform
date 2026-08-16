package com.reqsync.reqsync_backend.srs.dto;

/**
 * One structured section of the generated SRS document.
 *
 * @param title   Section heading, e.g. "Functional Requirements".
 * @param content Markdown body of the section.
 * @param order   Position of the section inside the document.
 */
public record SrsSection(
        String title,
        String content,
        int order
) {
}
