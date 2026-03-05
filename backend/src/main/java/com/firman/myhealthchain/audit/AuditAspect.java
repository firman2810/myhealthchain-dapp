package com.firman.myhealthchain.audit;

import com.firman.myhealthchain.model.*;
import com.firman.myhealthchain.repo.AuditLogRepository;
import com.firman.myhealthchain.repo.UserRepo;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.reflect.MethodSignature;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.expression.EvaluationContext;
import org.springframework.expression.ExpressionParser;
import org.springframework.expression.spel.standard.SpelExpressionParser;
import org.springframework.expression.spel.support.StandardEvaluationContext;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

/**
 * Cross-cutting aspect that intercepts methods annotated with {@link Audited}
 * and writes {@link AuditLog} rows automatically.
 *
 * <ul>
 * <li>SUCCESS — method returned normally</li>
 * <li>DENIED — method threw {@link AccessDeniedException}</li>
 * <li>FAIL — method threw any other exception</li>
 * </ul>
 *
 * Actor information (userId, displayName, organizationId) is read from the
 * Spring {@link SecurityContextHolder}. SpEL expressions in the annotation
 * are evaluated against method parameters and the return value
 * ({@code #result}).
 *
 * <strong>No medical content is ever stored.</strong>
 */
@Aspect
@Component
public class AuditAspect {

    private static final ExpressionParser PARSER = new SpelExpressionParser();

    @Autowired
    private AuditLogRepository auditLogRepo;

    @Autowired
    private UserRepo userRepo;

    @Around("@annotation(audited)")
    public Object audit(ProceedingJoinPoint jp, Audited audited) throws Throwable {

        Object result = null;
        AuditStatus status;
        try {
            result = jp.proceed();
            status = AuditStatus.SUCCESS;
        } catch (AccessDeniedException ex) {
            status = AuditStatus.DENIED;
            writeLog(jp, audited, status, null);
            throw ex; // re-throw so Spring Security handles it
        } catch (Exception ex) {
            status = AuditStatus.FAIL;
            writeLog(jp, audited, status, null);
            throw ex; // re-throw original exception
        }

        writeLog(jp, audited, status, result);
        return result;
    }

    // ── internals ──

    private void writeLog(ProceedingJoinPoint jp, Audited audited, AuditStatus status, Object result) {
        try {
            User actor = resolveActor();
            if (actor == null || actor.getOrganizationId() == null) {
                return; // cannot log without org context
            }

            EvaluationContext ctx = buildSpelContext(jp, result);

            String patientRef = evaluateSpel(audited.patientRefSpel(), ctx);

            AuditLog log = new AuditLog();
            log.setTimestamp(LocalDateTime.now());
            log.setDoctorName(actor.getDisplayName());
            log.setDoctorId(actor.getUsername());
            log.setAction(audited.action());
            log.setTargetType(audited.targetType());
            log.setPatientRef(maskPatientId(patientRef));
            log.setStatus(status);
            log.setOrganizationId(actor.getOrganizationId());

            auditLogRepo.save(log);
        } catch (Exception ignored) {
            // Audit logging must never break the business flow
        }
    }

    /**
     * Resolve the current actor from SecurityContext → UserPrincipal → User.
     */
    private User resolveActor() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated())
            return null;

        Object principal = auth.getPrincipal();
        if (principal instanceof UserPrincipal up) {
            return up.getUser();
        }

        // Fallback: look up by username
        String username = auth.getName();
        return userRepo.findByUsername(username).orElse(null);
    }

    /**
     * Build a SpEL evaluation context with method parameter names and #result.
     */
    private EvaluationContext buildSpelContext(ProceedingJoinPoint jp, Object result) {
        StandardEvaluationContext ctx = new StandardEvaluationContext();
        MethodSignature sig = (MethodSignature) jp.getSignature();
        String[] paramNames = sig.getParameterNames();
        Object[] args = jp.getArgs();

        if (paramNames != null) {
            for (int i = 0; i < paramNames.length; i++) {
                ctx.setVariable(paramNames[i], args[i]);
            }
        }
        if (result != null) {
            ctx.setVariable("result", result);
        }
        return ctx;
    }

    private String evaluateSpel(String expression, EvaluationContext ctx) {
        if (expression == null || expression.isBlank())
            return "";
        try {
            Object value = PARSER.parseExpression(expression).getValue(ctx);
            return value != null ? value.toString() : "";
        } catch (Exception e) {
            return "";
        }
    }

    /**
     * Mask patient NRIC: show only last 5 characters.
     * e.g. "S1234567A" → "***4567A"
     */
    private String maskPatientId(String patientId) {
        if (patientId == null || patientId.isEmpty())
            return "***";
        if (patientId.length() <= 5)
            return "***" + patientId;
        return "***" + patientId.substring(patientId.length() - 5);
    }
}
