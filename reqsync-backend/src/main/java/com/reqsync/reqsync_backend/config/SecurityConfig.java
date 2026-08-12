package com.reqsync.reqsync_backend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http
    ) throws Exception {

        http

                /*
                 * Disable CSRF for API development.
                 *
                 * Otherwise POST, PUT and DELETE requests
                 * from Postman/React can be rejected.
                 */
                .csrf(csrf ->
                        csrf.disable()
                )

                /*
                 * Configure endpoint authorization.
                 */
                .authorizeHttpRequests(auth -> auth

                        /*
                         * Temporarily allow all ReqSync APIs.
                         */
                        .requestMatchers(
                                "/api/**"
                        )
                        .permitAll()

                        /*
                         * Any other endpoint still requires
                         * authentication.
                         */
                        .anyRequest()
                        .authenticated()
                );

        return http.build();
    }
}