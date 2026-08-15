package com.reqsync.reqsync_backend.auth.service;

import com.reqsync.reqsync_backend.auth.entity.User;
import com.reqsync.reqsync_backend.auth.repository.UserRepository;

import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;

import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CustomUserDetailsService
        implements UserDetailsService {

    private final UserRepository userRepository;


    public CustomUserDetailsService(
            UserRepository userRepository
    ) {

        this.userRepository =
                userRepository;
    }


    // ==========================================
    // Load User
    // ==========================================

    @Override
    public UserDetails loadUserByUsername(
            String email
    ) throws UsernameNotFoundException {

        User user =
                userRepository
                        .findByEmailIgnoreCase(email)
                        .orElseThrow(
                                () -> new UsernameNotFoundException(
                                        "User not found: " + email
                                )
                        );


        return org.springframework.security.core.userdetails.User
                .withUsername(
                        user.getEmail()
                )

                .password(
                        user.getPassword()
                )

                .authorities(
                        List.of(
                                new SimpleGrantedAuthority(
                                        "ROLE_" +
                                                user.getRole().name()
                                )
                        )
                )

                .accountLocked(
                        user.isAccountLocked()
                )

                .disabled(
                        !user.isEnabled()
                )

                .build();
    }
}