package com.reqsync.reqsync_backend.business.controller;

import com.reqsync.reqsync_backend.business.dto.BusinessRegistrationRequest;
import com.reqsync.reqsync_backend.business.dto.BusinessRegistrationResponse;
import com.reqsync.reqsync_backend.business.service.BusinessRegistrationService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/businesses")
public class BusinessRegistrationController {

    private final BusinessRegistrationService
            businessRegistrationService;


    public BusinessRegistrationController(
            BusinessRegistrationService businessRegistrationService
    ) {

        this.businessRegistrationService =
                businessRegistrationService;
    }


    @PostMapping("/register")
    public ResponseEntity<BusinessRegistrationResponse>
    registerBusiness(
            @RequestBody
            BusinessRegistrationRequest request
    ) {

        return ResponseEntity.ok(
                businessRegistrationService
                        .register(
                                request
                        )
        );
    }
}