package com.reqsync.reqsync_backend.requirement.service;

import com.reqsync.reqsync_backend.requirement.dto.CompletenessCriterionResponse;
import com.reqsync.reqsync_backend.requirement.enums.CriterionStatus;
import org.springframework.stereotype.Service;

import java.util.List;

//@Service
public class CompletenessScoreService {

    /**
     * Calculate the final completeness percentage.
     *
     * PASS    = 1 point
     * PARTIAL = 0.5 point
     * FAIL    = 0 point
     *
     * Each confirmed missing requirement
     * reduces the score by 5 points.
     */
    public int calculate(
            List<CompletenessCriterionResponse> criteria,
            int confirmedMissingCount
    ) {

        if (criteria == null ||
                criteria.isEmpty()) {

            return 0;
        }


        double obtainedPoints = 0;


        for (
                CompletenessCriterionResponse criterion
                : criteria
        ) {

            if (criterion == null ||
                    criterion.getStatus() == null) {

                continue;
            }


            if (
                    criterion.getStatus()
                            == CriterionStatus.PASS
            ) {

                obtainedPoints += 1.0;

            } else if (
                    criterion.getStatus()
                            == CriterionStatus.PARTIAL
            ) {

                obtainedPoints += 0.5;
            }

            /*
             * FAIL contributes 0.
             */
        }


        double rawScore =
                (
                        obtainedPoints
                                / criteria.size()
                )
                        * 100;


        int finalScore =
                (int) Math.round(
                        rawScore
                );


        /*
         * Penalty only after semantic search
         * confirms that the requirement is
         * actually missing.
         */
        finalScore -=
                confirmedMissingCount * 5;


        /*
         * Keep result within 0–100.
         */
        if (finalScore < 0) {

            finalScore = 0;
        }

        if (finalScore > 100) {

            finalScore = 100;
        }


        return finalScore;
    }
}