package com.reqsync.reqsync_backend.auth.config;

import com.reqsync.reqsync_backend.auth.security.JwtAuthenticationFilter;
import com.reqsync.reqsync_backend.auth.service.CustomUserDetailsService;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;

import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import jakarta.servlet.DispatcherType;

import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableMethodSecurity
public class SecurityConfig {

    private final CustomUserDetailsService
            userDetailsService;

    private final JwtAuthenticationFilter
            jwtAuthenticationFilter;


    public SecurityConfig(
            CustomUserDetailsService userDetailsService,
            JwtAuthenticationFilter jwtAuthenticationFilter
    ) {

        this.userDetailsService =
                userDetailsService;

        this.jwtAuthenticationFilter =
                jwtAuthenticationFilter;
    }


    // ==========================================
    // Password Encoder
    // ==========================================

    @Bean
    public PasswordEncoder passwordEncoder() {

        return new BCryptPasswordEncoder();
    }


    // ==========================================
    // Authentication Provider
    // ==========================================

    @Bean
    public DaoAuthenticationProvider
    authenticationProvider() {

        DaoAuthenticationProvider provider =
                new DaoAuthenticationProvider(
                        userDetailsService
                );


        provider.setPasswordEncoder(
                passwordEncoder()
        );


        return provider;
    }


    // ==========================================
    // Authentication Manager
    // ==========================================

    @Bean
    public AuthenticationManager
    authenticationManager(
            AuthenticationConfiguration configuration
    ) throws Exception {

        return configuration
                .getAuthenticationManager();
    }


    // ==========================================
    // Security Filter Chain
    // ==========================================

    @Bean
    public SecurityFilterChain
    securityFilterChain(
            HttpSecurity http
    ) throws Exception {

        http

                // ------------------------------------------
                // Disable CSRF
                //
                // We are using JWT authentication.
                // ------------------------------------------
                .csrf(
                        csrf ->
                                csrf.disable()
                )


                // ------------------------------------------
                // Enable CORS
                // ------------------------------------------
                .cors(
                        cors ->
                                cors.configurationSource(
                                        corsConfigurationSource()
                                )
                )


                // ------------------------------------------
                // Stateless JWT authentication
                //
                // Spring Security will not create
                // HTTP sessions.
                // ------------------------------------------
                .sessionManagement(
                        session ->
                                session.sessionCreationPolicy(
                                        SessionCreationPolicy.STATELESS
                                )
                )


                // ------------------------------------------
                // Authorization rules
                // ------------------------------------------
                .authorizeHttpRequests(
                        auth ->
                                auth

                                        /*
                                         * ==================================
                                         * PUBLIC ENDPOINTS
                                         * ==================================
                                         *
                                         * No JWT is required.
                                         */


                                        /*
                                         * Existing login endpoint.
                                         */
                                        .requestMatchers(
                                                "/api/auth/login"
                                        )
                                        .permitAll()


                                        /*
                                         * Existing authentication test
                                         * endpoint.
                                         *
                                         * Keep this public only while
                                         * developing/testing if needed.
                                         */
                                        .requestMatchers(
                                                "/api/auth/test"
                                        )
                                        .permitAll()


                                        /*
                                         * ==================================
                                         * BUSINESS REGISTRATION
                                         * ==================================
                                         *
                                         * Must be public because the CEO
                                         * account does not exist yet.
                                         *
                                         * This endpoint:
                                         *
                                         * 1. Creates Business
                                         * 2. Creates CEO User
                                         * 3. Links CEO to Business
                                         */
                                        .requestMatchers(
                                                "/api/businesses/register"
                                        )
                                        .permitAll()


                                        /*
                                         * ==================================
                                         * AUTHENTICATED AUTH ENDPOINT
                                         * ==================================
                                         */
                                        .requestMatchers(
                                                "/api/auth/me"
                                        )
                                        .authenticated()


                                        /*
                                         * ==================================
                                         * ERROR DISPATCH
                                         * ==================================
                                         *
                                         * When an exception escapes to the
                                         * container, Tomcat forwards to the
                                         * /error endpoint. That internal
                                         * dispatch must stay public so real
                                         * error status codes (400, 404, 500)
                                         * are returned instead of a 403.
                                         */
                                        .dispatcherTypeMatchers(
                                                DispatcherType.ERROR
                                        )
                                        .permitAll()


                                        /*
                                         * ==================================
                                         * EVERYTHING ELSE
                                         * ==================================
                                         *
                                         * Requirement extraction
                                         * Semantic search
                                         * Completeness analysis
                                         * Projects
                                         * User management
                                         * etc.
                                         *
                                         * All require a valid JWT.
                                         */
                                        .anyRequest()
                                        .authenticated()
                )


                // ------------------------------------------
                // Authentication Provider
                // ------------------------------------------
                .authenticationProvider(
                        authenticationProvider()
                )


                // ------------------------------------------
                // JWT Filter
                //
                // Runs BEFORE Spring's normal
                // username/password authentication filter.
                // ------------------------------------------
                .addFilterBefore(
                        jwtAuthenticationFilter,
                        UsernamePasswordAuthenticationFilter.class
                );


        return http.build();
    }


    // ==========================================
    // CORS Configuration
    // ==========================================

    @Bean
    public CorsConfigurationSource
    corsConfigurationSource() {

        CorsConfiguration configuration =
                new CorsConfiguration();


        /*
         * Frontend URLs allowed to call
         * the Spring Boot backend.
         *
         * If your React frontend runs on
         * another port, add it here.
         */
        configuration.setAllowedOrigins(
                List.of(
                        "http://localhost:3000"
                )
        );


        /*
         * HTTP methods allowed.
         */
        configuration.setAllowedMethods(
                List.of(
                        "GET",
                        "POST",
                        "PUT",
                        "PATCH",
                        "DELETE",
                        "OPTIONS"
                )
        );


        /*
         * Allow headers such as:
         *
         * Authorization
         * Content-Type
         */
        configuration.setAllowedHeaders(
                List.of(
                        "*"
                )
        );


        /*
         * Allow frontend credentials.
         */
        configuration.setAllowCredentials(
                true
        );


        /*
         * Allow frontend JavaScript to read
         * the Authorization header if needed.
         */
        configuration.setExposedHeaders(
                List.of(
                        "Authorization"
                )
        );


        UrlBasedCorsConfigurationSource source =
                new UrlBasedCorsConfigurationSource();


        source.registerCorsConfiguration(
                "/**",
                configuration
        );


        return source;
    }
}