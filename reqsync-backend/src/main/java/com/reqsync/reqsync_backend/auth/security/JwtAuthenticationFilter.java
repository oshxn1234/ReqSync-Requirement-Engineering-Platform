package com.reqsync.reqsync_backend.auth.security;

import com.reqsync.reqsync_backend.auth.service.CustomUserDetailsService;
import com.reqsync.reqsync_backend.auth.service.JwtService;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;

import org.springframework.security.core.userdetails.UserDetails;

import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;

import org.springframework.stereotype.Component;

import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class JwtAuthenticationFilter
        extends OncePerRequestFilter {

    private static final Logger log =
            LoggerFactory.getLogger(
                    JwtAuthenticationFilter.class
            );


    private final JwtService jwtService;

    private final CustomUserDetailsService
            userDetailsService;


    public JwtAuthenticationFilter(
            JwtService jwtService,
            CustomUserDetailsService userDetailsService
    ) {

        this.jwtService =
                jwtService;

        this.userDetailsService =
                userDetailsService;
    }


    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {

        final String authorizationHeader =
                request.getHeader(
                        "Authorization"
                );


        /*
         * No Authorization header.
         *
         * Continue normally.
         * Spring Security will later decide whether
         * the endpoint is public or protected.
         */
        if (
                authorizationHeader == null
                        ||
                        authorizationHeader.isBlank()
        ) {

            filterChain.doFilter(
                    request,
                    response
            );

            return;
        }


        /*
         * Authorization exists,
         * but it is not Bearer authentication.
         */
        if (
                !authorizationHeader
                        .startsWith(
                                "Bearer "
                        )
        ) {

            log.warn(
                    "Authorization header does not start with Bearer for {} {}",
                    request.getMethod(),
                    request.getRequestURI()
            );


            filterChain.doFilter(
                    request,
                    response
            );

            return;
        }


        /*
         * Remove:
         *
         * Bearer
         *
         * and trim accidental spaces.
         */
        String jwt =
                authorizationHeader
                        .substring(7)
                        .trim();


        if (jwt.isBlank()) {

            log.warn(
                    "Empty JWT received for {} {}",
                    request.getMethod(),
                    request.getRequestURI()
            );


            filterChain.doFilter(
                    request,
                    response
            );

            return;
        }


        try {

            /*
             * Extract email stored in JWT subject.
             */
            String email =
                    jwtService
                            .extractUsername(
                                    jwt
                            );


            if (
                    email == null
                            ||
                            email.isBlank()
            ) {

                log.warn(
                        "JWT contains no username."
                );


                filterChain.doFilter(
                        request,
                        response
                );

                return;
            }


            /*
             * Do not overwrite an existing
             * SecurityContext authentication.
             */
            if (
                    SecurityContextHolder
                            .getContext()
                            .getAuthentication()
                            == null
            ) {

                UserDetails userDetails =
                        userDetailsService
                                .loadUserByUsername(
                                        email
                                );


                if (
                        jwtService
                                .isTokenValid(
                                        jwt,
                                        userDetails
                                )
                ) {

                    UsernamePasswordAuthenticationToken
                            authentication =
                            new UsernamePasswordAuthenticationToken(
                                    userDetails,
                                    null,
                                    userDetails.getAuthorities()
                            );


                    authentication.setDetails(
                            new WebAuthenticationDetailsSource()
                                    .buildDetails(
                                            request
                                    )
                    );


                    SecurityContextHolder
                            .getContext()
                            .setAuthentication(
                                    authentication
                            );


                    log.info(
                            "JWT authenticated user: {} authorities: {}",
                            userDetails.getUsername(),
                            userDetails.getAuthorities()
                    );

                } else {

                    log.warn(
                            "JWT validation failed for user: {}",
                            email
                    );
                }
            }

        } catch (Exception exception) {

            /*
             * IMPORTANT:
             *
             * This log allows us to see the REAL
             * reason instead of silently producing 403.
             *
             * Examples:
             *
             * ExpiredJwtException
             * SignatureException
             * MalformedJwtException
             */
            log.error(
                    "JWT authentication failed for {} {}. {}: {}",
                    request.getMethod(),
                    request.getRequestURI(),
                    exception
                            .getClass()
                            .getSimpleName(),
                    exception.getMessage()
            );


            /*
             * Make sure invalid JWT authentication
             * never remains in SecurityContext.
             */
            SecurityContextHolder
                    .clearContext();
        }


        filterChain.doFilter(
                request,
                response
        );
    }
}