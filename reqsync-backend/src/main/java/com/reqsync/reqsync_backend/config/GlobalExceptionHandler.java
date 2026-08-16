package com.reqsync.reqsync_backend.config;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.Map;

/**
 * Global exception handling so controllers return clean
 * JSON errors with meaningful HTTP status codes instead
 * of opaque container responses.
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

    /**
     * Validation / bad input.
     */
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, String>> handleBadRequest(
            IllegalArgumentException exception
    ) {

        return error(
                HttpStatus.BAD_REQUEST,
                exception.getMessage()
        );
    }


    /**
     * Conflicting state (e.g. approving an already
     * rejected approval request).
     */
    @ExceptionHandler(IllegalStateException.class)
    public ResponseEntity<Map<String, String>> handleConflict(
            IllegalStateException exception
    ) {

        return error(
                HttpStatus.CONFLICT,
                exception.getMessage()
        );
    }


    /**
     * Generic server-side failure.
     */
    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<Map<String, String>> handleRuntime(
            RuntimeException exception
    ) {

        return error(
                HttpStatus.INTERNAL_SERVER_ERROR,
                exception.getMessage()
        );
    }


    private ResponseEntity<Map<String, String>> error(
            HttpStatus status,
            String message
    ) {

        String body =
                message == null
                        ? status.getReasonPhrase()
                        : message;

        return ResponseEntity
                .status(status)
                .body(
                        Map.of(
                                "message",
                                body
                        )
                );
    }
}
