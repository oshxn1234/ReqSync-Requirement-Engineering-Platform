package com.reqsync.reqsync_backend.business.dto;

public class BusinessRegistrationResponse {

    private Long businessId;

    private String businessName;

    private Long ceoId;

    private String ceoEmail;

    private Long systemAdminId;

    private String systemAdminEmail;

    private String message;


    public BusinessRegistrationResponse() {
    }


    public BusinessRegistrationResponse(
            Long businessId,
            String businessName,
            Long ceoId,
            String ceoEmail,
            Long systemAdminId,
            String systemAdminEmail,
            String message
    ) {

        this.businessId = businessId;
        this.businessName = businessName;
        this.ceoId = ceoId;
        this.ceoEmail = ceoEmail;
        this.systemAdminId = systemAdminId;
        this.systemAdminEmail = systemAdminEmail;
        this.message = message;
    }


    public Long getBusinessId() {
        return businessId;
    }

    public void setBusinessId(Long businessId) {
        this.businessId = businessId;
    }


    public String getBusinessName() {
        return businessName;
    }

    public void setBusinessName(String businessName) {
        this.businessName = businessName;
    }


    public Long getCeoId() {
        return ceoId;
    }

    public void setCeoId(Long ceoId) {
        this.ceoId = ceoId;
    }


    public String getCeoEmail() {
        return ceoEmail;
    }

    public void setCeoEmail(String ceoEmail) {
        this.ceoEmail = ceoEmail;
    }


    public Long getSystemAdminId() {
        return systemAdminId;
    }

    public void setSystemAdminId(
            Long systemAdminId
    ) {
        this.systemAdminId = systemAdminId;
    }


    public String getSystemAdminEmail() {
        return systemAdminEmail;
    }

    public void setSystemAdminEmail(
            String systemAdminEmail
    ) {
        this.systemAdminEmail = systemAdminEmail;
    }


    public String getMessage() {
        return message;
    }

    public void setMessage(
            String message
    ) {
        this.message = message;
    }
}