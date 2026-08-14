package com.reqsync.reqsync_backend.auth;

import com.reqsync.reqsync_backend.ReqsyncBackendApplication;
import org.springframework.boot.SpringApplication;

public class AuthApplication {

    public static void main(String[] args) {

        SpringApplication application =
                new SpringApplication(
                        ReqsyncBackendApplication.class
                );

        application.setAdditionalProfiles("auth");
        application.run(args);
    }
}