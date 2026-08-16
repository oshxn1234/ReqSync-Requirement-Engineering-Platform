//package com.reqsync.reqsync_backend.developer;
//
//import com.reqsync.reqsync_backend.auth.config.DataInitializer;
//import com.reqsync.reqsync_backend.auth.config.SecurityConfig;
//import com.reqsync.reqsync_backend.auth.controller.AuthController;
//import com.reqsync.reqsync_backend.auth.entity.User;
//import com.reqsync.reqsync_backend.auth.repository.UserRepository;
//import com.reqsync.reqsync_backend.auth.security.JwtAuthenticationFilter;
//import com.reqsync.reqsync_backend.auth.service.CustomUserDetailsService;
//import com.reqsync.reqsync_backend.auth.service.JwtService;
//
//import com.reqsync.reqsync_backend.business.entity.Business;
//
//import com.reqsync.reqsync_backend.developer.entity.DeveloperSubmission;
//import com.reqsync.reqsync_backend.developer.entity.DeveloperTask;
//import com.reqsync.reqsync_backend.developer.repository.DeveloperSubmissionRepository;
//import com.reqsync.reqsync_backend.developer.repository.DeveloperTaskRepository;
//import com.reqsync.reqsync_backend.developer.service.DeveloperSubmissionService;
//import com.reqsync.reqsync_backend.developer.service.DeveloperTaskService;
//
//import org.springframework.boot.SpringApplication;
//import org.springframework.boot.autoconfigure.SpringBootApplication;
//import org.springframework.boot.persistence.autoconfigure.EntityScan;
//import org.springframework.context.annotation.ComponentScan;
//import org.springframework.context.annotation.FilterType;
//import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
//
//
//@SpringBootApplication
//
//
//@ComponentScan(
//        basePackageClasses = {
//                SecurityConfig.class,
//                AuthController.class,
//                CustomUserDetailsService.class,
//                JwtService.class,
//                JwtAuthenticationFilter.class,
//
//                DeveloperTaskService.class,
//                DeveloperSubmissionService.class
//        },
//
//        excludeFilters = {
//                @ComponentScan.Filter(
//                        type = FilterType.ASSIGNABLE_TYPE,
//                        classes = DataInitializer.class
//                )
//        }
//)
//
//
//@EntityScan(
//        basePackageClasses = {
//                User.class,
//                Business.class,
//                DeveloperTask.class,
//                DeveloperSubmission.class
//        }
//)
//
//
//@EnableJpaRepositories(
//        basePackageClasses = {
//                UserRepository.class,
//                DeveloperTaskRepository.class,
//                DeveloperSubmissionRepository.class
//        }
//)
//
//
//public class DeveloperApplication {
//
//    public static void main(String[] args) {
//
//        SpringApplication application =
//                new SpringApplication(
//                        DeveloperApplication.class
//                );
//
//        application.setAdditionalProfiles(
//                "developer"
//        );
//
//        application.run(args);
//    }
//}