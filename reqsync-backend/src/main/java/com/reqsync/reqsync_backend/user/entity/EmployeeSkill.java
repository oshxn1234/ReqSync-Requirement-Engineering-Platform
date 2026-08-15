package com.reqsync.reqsync_backend.user.entity;

import com.reqsync.reqsync_backend.user.enums.SkillProficiency;

import jakarta.persistence.*;

@Entity
@Table(
        name = "employee_skills",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_employee_skill",
                        columnNames = {
                                "employee_profile_id",
                                "skill_name"
                        }
                )
        }
)
public class EmployeeSkill {

    @Id
    @GeneratedValue(
            strategy = GenerationType.IDENTITY
    )
    private Long id;


    @ManyToOne(
            fetch = FetchType.LAZY,
            optional = false
    )
    @JoinColumn(
            name = "employee_profile_id",
            nullable = false
    )
    private EmployeeProfile employeeProfile;


    @Column(
            name = "skill_name",
            nullable = false,
            length = 100
    )
    private String skillName;


    @Enumerated(EnumType.STRING)
    @Column(
            nullable = false,
            length = 30
    )
    private SkillProficiency proficiency;


    public EmployeeSkill() {
    }


    public Long getId() {
        return id;
    }


    public void setId(Long id) {
        this.id = id;
    }


    public EmployeeProfile getEmployeeProfile() {
        return employeeProfile;
    }


    public void setEmployeeProfile(
            EmployeeProfile employeeProfile
    ) {
        this.employeeProfile =
                employeeProfile;
    }


    public String getSkillName() {
        return skillName;
    }


    public void setSkillName(
            String skillName
    ) {
        this.skillName =
                skillName;
    }


    public SkillProficiency getProficiency() {
        return proficiency;
    }


    public void setProficiency(
            SkillProficiency proficiency
    ) {
        this.proficiency =
                proficiency;
    }
}