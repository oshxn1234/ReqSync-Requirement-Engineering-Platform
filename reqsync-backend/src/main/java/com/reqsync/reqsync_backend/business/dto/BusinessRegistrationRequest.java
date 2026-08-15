package com.reqsync.reqsync_backend.business.dto;

public class BusinessRegistrationRequest {

    // ==========================================
    // Business
    // ==========================================

    private String businessName;

    private String registrationNumber;

    private String businessEmail;

    private String businessPhone;

    private String businessAddress;


    // ==========================================
    // CEO
    // ==========================================

    private String ceoFirstName;

    private String ceoLastName;

    private String ceoEmail;

    private String ceoPassword;


    // ==========================================
    // System Admin
    // ==========================================

    private String adminFirstName;

    private String adminLastName;

    private String adminEmail;

    private String adminPassword;


    public BusinessRegistrationRequest() {
    }


    public String getBusinessName() {
        return businessName;
    }

    public void setBusinessName(
            String businessName
    ) {
        this.businessName = businessName;
    }


    public String getRegistrationNumber() {
        return registrationNumber;
    }

    public void setRegistrationNumber(
            String registrationNumber
    ) {
        this.registrationNumber = registrationNumber;
    }


    public String getBusinessEmail() {
        return businessEmail;
    }

    public void setBusinessEmail(
            String businessEmail
    ) {
        this.businessEmail = businessEmail;
    }


    public String getBusinessPhone() {
        return businessPhone;
    }

    public void setBusinessPhone(
            String businessPhone
    ) {
        this.businessPhone = businessPhone;
    }


    public String getBusinessAddress() {
        return businessAddress;
    }

    public void setBusinessAddress(
            String businessAddress
    ) {
        this.businessAddress = businessAddress;
    }


    public String getCeoFirstName() {
        return ceoFirstName;
    }

    public void setCeoFirstName(
            String ceoFirstName
    ) {
        this.ceoFirstName = ceoFirstName;
    }


    public String getCeoLastName() {
        return ceoLastName;
    }

    public void setCeoLastName(
            String ceoLastName
    ) {
        this.ceoLastName = ceoLastName;
    }


    public String getCeoEmail() {
        return ceoEmail;
    }

    public void setCeoEmail(
            String ceoEmail
    ) {
        this.ceoEmail = ceoEmail;
    }


    public String getCeoPassword() {
        return ceoPassword;
    }

    public void setCeoPassword(
            String ceoPassword
    ) {
        this.ceoPassword = ceoPassword;
    }


    public String getAdminFirstName() {
        return adminFirstName;
    }

    public void setAdminFirstName(
            String adminFirstName
    ) {
        this.adminFirstName = adminFirstName;
    }


    public String getAdminLastName() {
        return adminLastName;
    }

    public void setAdminLastName(
            String adminLastName
    ) {
        this.adminLastName = adminLastName;
    }


    public String getAdminEmail() {
        return adminEmail;
    }

    public void setAdminEmail(
            String adminEmail
    ) {
        this.adminEmail = adminEmail;
    }


    public String getAdminPassword() {
        return adminPassword;
    }

    public void setAdminPassword(
            String adminPassword
    ) {
        this.adminPassword = adminPassword;
    }
}