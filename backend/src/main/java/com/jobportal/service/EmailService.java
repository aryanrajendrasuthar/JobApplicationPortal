package com.jobportal.service;

import com.jobportal.entity.Application;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username:noreply@jobportal.com}")
    private String fromEmail;

    @Value("${app.frontend-url}")
    private String frontendUrl;

    @Async
    public void sendApplicationStatusUpdate(
        String seekerEmail, String seekerName,
        String jobTitle, String companyName,
        Application.ApplicationStatus status
    ) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true);
            helper.setFrom(fromEmail);
            helper.setTo(seekerEmail);
            helper.setSubject("Application Update: " + jobTitle + " at " + companyName);
            helper.setText(buildStatusEmailHtml(seekerName, jobTitle, companyName, status), true);
            mailSender.send(message);
            log.info("Status email sent to {}", seekerEmail);
        } catch (MessagingException e) {
            log.warn("Failed to send email to {}: {}", seekerEmail, e.getMessage());
        }
    }

    @Async
    public void sendApplicationConfirmation(
        String seekerEmail, String seekerName,
        String jobTitle, String companyName
    ) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true);
            helper.setFrom(fromEmail);
            helper.setTo(seekerEmail);
            helper.setSubject("Application Submitted: " + jobTitle + " at " + companyName);
            helper.setText(buildConfirmationEmailHtml(seekerName, jobTitle, companyName), true);
            mailSender.send(message);
        } catch (MessagingException e) {
            log.warn("Failed to send confirmation email: {}", e.getMessage());
        }
    }

    private String buildStatusEmailHtml(
        String name, String jobTitle, String companyName,
        Application.ApplicationStatus status
    ) {
        String statusText = switch (status) {
            case SCREENING -> "Your application is now under review by the hiring team.";
            case INTERVIEW -> "Congratulations! You have been selected for an interview.";
            case OFFERED -> "Great news! You have received a job offer.";
            case REJECTED -> "Thank you for applying. Unfortunately, you were not selected at this time.";
            default -> "Your application status has been updated.";
        };

        String badgeColor = switch (status) {
            case INTERVIEW, OFFERED -> "#10b981";
            case REJECTED -> "#ef4444";
            default -> "#6366f1";
        };

        return """
            <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px">
              <div style="background:#6366f1;padding:24px;border-radius:8px 8px 0 0;text-align:center">
                <h1 style="color:white;margin:0;font-size:24px">JobPortal</h1>
              </div>
              <div style="background:#f9fafb;padding:32px;border-radius:0 0 8px 8px">
                <p style="color:#374151;font-size:16px">Hi <strong>%s</strong>,</p>
                <p style="color:#374151">Your application for <strong>%s</strong> at <strong>%s</strong> has been updated.</p>
                <div style="background:white;border-radius:8px;padding:20px;margin:24px 0;border-left:4px solid %s">
                  <p style="margin:0;font-weight:600;color:%s;font-size:18px">%s</p>
                  <p style="margin:8px 0 0;color:#6b7280">%s</p>
                </div>
                <a href="%s/dashboard" style="display:inline-block;background:#6366f1;color:white;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:600">View My Applications</a>
              </div>
            </div>
            """.formatted(name, jobTitle, companyName, badgeColor, badgeColor, status.name(), statusText, frontendUrl);
    }

    private String buildConfirmationEmailHtml(String name, String jobTitle, String companyName) {
        return """
            <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px">
              <div style="background:#6366f1;padding:24px;border-radius:8px 8px 0 0;text-align:center">
                <h1 style="color:white;margin:0;font-size:24px">JobPortal</h1>
              </div>
              <div style="background:#f9fafb;padding:32px;border-radius:0 0 8px 8px">
                <p style="color:#374151;font-size:16px">Hi <strong>%s</strong>,</p>
                <p style="color:#374151">Your application for <strong>%s</strong> at <strong>%s</strong> has been successfully submitted!</p>
                <p style="color:#6b7280">The employer will review your application and get back to you. Track your application status in your dashboard.</p>
                <a href="%s/dashboard" style="display:inline-block;background:#6366f1;color:white;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:600">View Dashboard</a>
              </div>
            </div>
            """.formatted(name, jobTitle, companyName, frontendUrl);
    }
}
