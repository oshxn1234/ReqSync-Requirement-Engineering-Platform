package com.reqsync.reqsync_backend.requirement.service;

import com.reqsync.reqsync_backend.requirement.dto.CompletenessCriterionResponse;
import com.reqsync.reqsync_backend.requirement.enums.CriterionStatus;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CompletenessScoreService {

    /**
     * PASS = 1
     * PARTIAL = 0.5
     * FAIL = 0
     *
     * Confirmed missing gaps reduce
     * the score by 5 points each.
     */
    public int calculate(
            List<CompletenessCriterionResponse> criteria,
            int confirmedMissingCount
    ) {

        if (
                criteria == null ||
                        criteria.isEmpty()
        ) {

            return 0;
        }


        double obtainedPoints = 0;


        for (
                CompletenessCriterionResponse criterion
                : criteria
        ) {

            if (
                    criterion == null ||
                            criterion.getStatus() == null
            ) {

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
         * Confirmed project gaps reduce score.
         */
        finalScore -=
                confirmedMissingCount * 5;


        if (finalScore < 0) {
            finalScore = 0;
        }


        if (finalScore > 100) {
            finalScore = 100;
        }


        return finalScore;
    }
}