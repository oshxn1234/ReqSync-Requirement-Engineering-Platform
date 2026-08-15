//package com.reqsync.reqsync_backend.project.service;
//
//import com.reqsync.reqsync_backend.project.entity.Project;
//import com.reqsync.reqsync_backend.project.entity.ProjectMember;
//import com.reqsync.reqsync_backend.project.repository.ProjectMemberRepository;
//import com.reqsync.reqsync_backend.project.repository.ProjectRepository;
//import com.reqsync.reqsync_backend.user.dto.CreateTeamMemberRequest;
//import com.reqsync.reqsync_backend.user.dto.UserResponse;
//import com.reqsync.reqsync_backend.user.entity.User;
//import com.reqsync.reqsync_backend.user.enums.UserRole;
//import com.reqsync.reqsync_backend.user.enums.UserStatus;
//import com.reqsync.reqsync_backend.user.repository.UserRepository;
//import org.springframework.security.core.Authentication;
//import org.springframework.security.crypto.password.PasswordEncoder;
//import org.springframework.stereotype.Service;
//import org.springframework.transaction.annotation.Transactional;
//
//@Service
//@Transactional
//public class ProjectTeamService {
//
//    private final ProjectRepository
//            projectRepository;
//
//    private final ProjectMemberRepository
//            projectMemberRepository;
//
//    private final UserRepository
//            userRepository;
//
//    private final UserService
//            userService;
//
//    private final PasswordEncoder
//            passwordEncoder;
//
//
//    public ProjectTeamService(
//            ProjectRepository projectRepository,
//            ProjectMemberRepository projectMemberRepository,
//            UserRepository userRepository,
//            UserService userService,
//            PasswordEncoder passwordEncoder
//    ) {
//
//        this.projectRepository =
//                projectRepository;
//
//        this.projectMemberRepository =
//                projectMemberRepository;
//
//        this.userRepository =
//                userRepository;
//
//        this.userService =
//                userService;
//
//        this.passwordEncoder =
//                passwordEncoder;
//    }
//
//
//    public UserResponse createAndAddMember(
//            Long projectId,
//            CreateTeamMemberRequest request,
//            Authentication authentication
//    ) {
//
//        User manager =
//                userService
//                        .getAuthenticatedUser(
//                                authentication
//                        );
//
//
//        Project project =
//                projectRepository
//                        .findById(
//                                projectId
//                        )
//                        .orElseThrow(
//                                () ->
//                                        new RuntimeException(
//                                                "Project not found."
//                                        )
//                        );
//
//
//        if (
//                project.getProjectManager()
//                        == null
//                        ||
//                        !project.getProjectManager()
//                                .getId()
//                                .equals(
//                                        manager.getId()
//                                )
//        ) {
//
//            throw new RuntimeException(
//                    "You are not the assigned project manager for this project."
//            );
//        }
//
//
//        if (
//                request.getRole()
//                        == UserRole.CEO
//                        ||
//                        request.getRole()
//                                == UserRole.PROJECT_MANAGER
//        ) {
//
//            throw new RuntimeException(
//                    "Project managers can only create project team members."
//            );
//        }
//
//
//        if (
//                userRepository
//                        .existsByEmailIgnoreCase(
//                                request.getEmail()
//                        )
//        ) {
//
//            throw new RuntimeException(
//                    "Email is already registered."
//            );
//        }
//
//
//        User member =
//                new User();
//
//        member.setBusiness(
//                manager.getBusiness()
//        );
//
//        member.setFullName(
//                request.getFullName()
//        );
//
//        member.setEmail(
//                request.getEmail()
//                        .trim()
//                        .toLowerCase()
//        );
//
//        member.setPasswordHash(
//                passwordEncoder.encode(
//                        request.getPassword()
//                )
//        );
//
//        member.setRole(
//                request.getRole()
//        );
//
//        member.setStatus(
//                UserStatus.ACTIVE
//        );
//
//
//        User savedUser =
//                userRepository.save(
//                        member
//                );
//
//
//        ProjectMember membership =
//                new ProjectMember();
//
//        membership.setProject(
//                project
//        );
//
//        membership.setUser(
//                savedUser
//        );
//
//
//        projectMemberRepository.save(
//                membership
//        );
//
//
//        return new UserResponse(
//                savedUser.getId(),
//                savedUser.getFullName(),
//                savedUser.getEmail(),
//                savedUser.getRole(),
//                savedUser.getStatus(),
//                savedUser.getBusiness().getId()
//        );
//    }
//}