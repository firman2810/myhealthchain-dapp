package com.firman.myhealthchain.audit;

import com.firman.myhealthchain.model.AuditAction;
import com.firman.myhealthchain.model.AuditTargetType;

import java.lang.annotation.*;

/**
 * Marks a service method for automatic audit-logging via {@link AuditAspect}.
 *
 * <p>
 * SpEL expressions reference method parameters by name (e.g.
 * {@code #patientId})
 * and the return value via {@code #result}.
 * </p>
 */
@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
@Documented
public @interface Audited {

    /** The action being performed. */
    AuditAction action();

    /** The type of entity being acted upon. */
    AuditTargetType targetType();

    /**
     * SpEL expression that resolves to the target entity ID.
     * Evaluated against method arguments and, on success, the return value
     * ({@code #result}).
     * Example: {@code "#result.recordId"} or {@code "#patientId"}.
     */
    String targetIdSpel() default "";

    /**
     * SpEL expression that resolves to the patient reference (e.g. NRIC).
     * Will be masked before storage. Example: {@code "#request.patientId"} or
     * {@code "#patientId"}.
     */
    String patientRefSpel() default "";
}
