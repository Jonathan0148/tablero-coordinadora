package com.coltefinanciera.itdashboard.shared.audit;

import jakarta.persistence.Column;
import jakarta.persistence.MappedSuperclass;
import lombok.Getter;
import lombok.Setter;
import org.springframework.data.annotation.CreatedBy;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedBy;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import jakarta.persistence.EntityListeners;
import java.time.OffsetDateTime;

@Getter
@Setter
@MappedSuperclass
@EntityListeners(AuditingEntityListener.class)
public abstract class AuditableEntity {

    @CreatedDate
    @Column(name = "created_at", nullable = false)
    private OffsetDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;

    @CreatedBy
    @Column(name = "created_by", length = 128)
    private String createdBy;

    @LastModifiedBy
    @Column(name = "updated_by", length = 128)
    private String updatedBy;

    @Column(name = "is_deleted", nullable = false, columnDefinition = "CHAR(1)")
    private String deleted = "N";

    @Column(name = "deleted_at")
    private OffsetDateTime deletedAt;

    @Column(name = "deleted_by", length = 128)
    private String deletedBy;

    public boolean isDeleted() {
        return "Y".equals(deleted);
    }

    public void markDeleted() {
        this.deleted = "Y";
        this.deletedAt = OffsetDateTime.now();
    }
}
