package com.reqsync.reqsync_backend.auth;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class AuthApplication {

    public static void main(String[] args) {

        SpringApplication application =
                new SpringApplication(AuthApplication.class);

        application.setAdditionalProfiles("auth");

        application.run(args);
    }
}