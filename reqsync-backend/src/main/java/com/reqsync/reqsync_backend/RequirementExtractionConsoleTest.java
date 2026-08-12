package com.reqsync.reqsync_backend;

import com.reqsync.reqsync_backend.requirement.dto.ExtractedRequirementResponse;
import com.reqsync.reqsync_backend.requirement.dto.RequirementExtractionRequest;
import com.reqsync.reqsync_backend.requirement.dto.RequirementExtractionResponse;
import com.reqsync.reqsync_backend.requirement.service.RequirementExtractionService;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class RequirementExtractionConsoleTest
        implements CommandLineRunner {

    private final RequirementExtractionService
            requirementExtractionService;

    public RequirementExtractionConsoleTest(
            RequirementExtractionService requirementExtractionService
    ) {

        this.requirementExtractionService =
                requirementExtractionService;
    }

    @Override
    public void run(String... args) {

        try {

            System.out.println();
            System.out.println(
                    "=============================================="
            );
            System.out.println(
                    "       REQUIREMENT EXTRACTION TEST"
            );
            System.out.println(
                    "=============================================="
            );

            /*
             * Create the request that would normally
             * come from the React frontend.
             */
            RequirementExtractionRequest request =
                    new RequirementExtractionRequest();

            /*
             * Temporary project ID.
             *
             * Later this will come from the selected
             * ReqSync project.
             */
            request.setProjectId(1L);

            request.setProjectName(
                    "Online Shopping System"
            );

            /*
             * This simulates meeting notes.
             *
             * Later:
             *
             * PDF
             *  ↓
             * React PDF.js
             *  ↓
             * Extracted text
             *  ↓
             * documentContent
             */
            request.setDocumentContent(
                    """
                    During the stakeholder meeting, the client
                    discussed the requirements for an online
                    shopping platform.

                    Customers must be able to create an account
                    using their full name, email address and
                    password.

                    Registered customers must be able to log in
                    using their email address and password.

                    If a customer forgets their password, they
                    should be able to reset it using a verification
                    link sent to their registered email address.

                    Customers must be able to browse the available
                    products.

                    Customers should be able to search for products
                    using the product name or product category.

                    Customers must be able to view detailed
                    information about a selected product, including
                    its name, description, price and availability.

                    Customers should be able to add products to a
                    shopping cart.

                    Customers must be able to change the quantity
                    of products in their shopping cart and remove
                    unwanted products.

                    The system must allow customers to place an
                    order using the products contained in their
                    shopping cart.

                    Customers should be able to make payments using
                    credit cards or debit cards.

                    When payment is successful, the system must
                    generate an order confirmation and notify the
                    customer.

                    Customers should be able to view the current
                    status of their orders.

                    Administrators must be able to add new products.

                    Administrators must be able to update existing
                    product information.

                    Administrators must be able to remove products
                    that are no longer available.

                    Administrators should be able to view customer
                    orders and update their delivery status.

                    Customer passwords must be securely stored.

                    Normal users must not be allowed to access
                    administrator functions.

                    The system should respond to normal user
                    requests within three seconds.

                    The system should support at least 500
                    concurrent users.
                    """
            );

            System.out.println();
            System.out.println(
                    "Sending meeting notes to requirement extraction service..."
            );

            System.out.println();

            /*
             * Call your friend's existing extraction service.
             */
            RequirementExtractionResponse response =
                    requirementExtractionService.extract(
                            request
                    );

            System.out.println();
            System.out.println(
                    "=============================================="
            );
            System.out.println(
                    "            EXTRACTION RESULT"
            );
            System.out.println(
                    "=============================================="
            );

            System.out.println(
                    "Extraction ID : "
                            + response.getExtractionId()
            );

            System.out.println(
                    "Project ID    : "
                            + response.getProjectId()
            );

            System.out.println(
                    "Status        : "
                            + response.getStatus()
            );

            System.out.println(
                    "Message       : "
                            + response.getMessage()
            );

            System.out.println(
                    "Created At    : "
                            + response.getCreatedAt()
            );

            System.out.println();

            System.out.println(
                    "=============================================="
            );
            System.out.println(
                    "          EXTRACTED REQUIREMENTS"
            );
            System.out.println(
                    "=============================================="
            );

            /*
             * Print every requirement returned by Gemini.
             */
            for (
                    ExtractedRequirementResponse requirement
                    : response.getRequirements()
            ) {

                System.out.println();

                System.out.println(
                        "ID          : "
                                + requirement.getId()
                );

                System.out.println(
                        "Code        : "
                                + requirement.getCode()
                );

                System.out.println(
                        "Title       : "
                                + requirement.getTitle()
                );

                System.out.println(
                        "Description : "
                                + requirement.getDescription()
                );

                System.out.println(
                        "Type        : "
                                + requirement.getType()
                );

                System.out.println(
                        "Priority    : "
                                + requirement.getPriority()
                );

                System.out.println(
                        "Status      : "
                                + requirement.getStatus()
                );

                System.out.println(
                        "Confidence  : "
                                + requirement.getConfidenceScore()
                );

                System.out.println(
                        "----------------------------------------------"
                );
            }

            System.out.println();

            System.out.println(
                    "Total Extracted Requirements: "
                            + response
                            .getRequirements()
                            .size()
            );

            System.out.println();

            System.out.println(
                    "=============================================="
            );
            System.out.println(
                    "          EXTRACTION TEST COMPLETED"
            );
            System.out.println(
                    "=============================================="
            );

        } catch (Exception exception) {

            System.err.println();

            System.err.println(
                    "=============================================="
            );
            System.err.println(
                    "            EXTRACTION TEST FAILED"
            );
            System.err.println(
                    "=============================================="
            );

            System.err.println();

            System.err.println(
                    "Error:"
            );

            System.err.println(
                    exception.getMessage()
            );

            System.err.println();

            exception.printStackTrace();
        }
    }
}