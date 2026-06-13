package com.portal.service.scraper;

import com.portal.model.AccountStatus;
import com.portal.model.JobPost;
import com.portal.model.Role;
import com.portal.repository.JobPostRepository;
import com.portal.repository.UserRepository;
import jakarta.annotation.PostConstruct;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.ArrayList;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class JobAggregationEngine {

    private final JobPostRepository jobPostRepository;
    private final UserRepository userRepository;

    public JobAggregationEngine(JobPostRepository jobPostRepository, UserRepository userRepository) {
        this.jobPostRepository = jobPostRepository;
        this.userRepository = userRepository;
    }

    @PostConstruct
    public void migrateExistingJobs() {
        List<JobPost> existingJobs = jobPostRepository.findAll();
        boolean changed = false;
        for (JobPost job : existingJobs) {
            if (job.getJobHash() == null) {
                job.setJobHash(generateJobHash(job.getCompany(), job.getTitle(), job.getLocation()));
                changed = true;
            }
        }
        if (changed) {
            jobPostRepository.saveAll(existingJobs);
            System.out.println("✅ JobAggregationEngine: Migrated existing jobs with SHA-256 hashes.");
        }
    }

    public List<JobPost> processAndFilter(List<JobPost> rawJobs) {
        List<JobPost> validJobs = new ArrayList<>();

        for (JobPost job : rawJobs) {
            // 1. Basic validation
            if (job.getCompany() == null || job.getTitle() == null || job.getApplyLink() == null
                    || job.getLocation() == null) {
                continue;
            }

            // 2. Geographic Filtering
            if (!isLocationValid(job.getLocation())) {
                continue;
            }

            // 3. Whitelist + Scoring
            int score = calculateScore(job);
            if (score < 55) {
                continue;
            }
            job.setRelevanceScore(score);

            // 4. Extract Experience
            extractExperience(job);

            // 5. Deduplication
            String hash = generateJobHash(job.getCompany(), job.getTitle(), job.getLocation());
            if (jobPostRepository.existsByJobHash(hash)) {
                continue;
            }
            job.setJobHash(hash);

            // 6. Alumni Referral Check
            int alumniCount = userRepository.countByCompanyIgnoreCaseAndRoleAndAccountStatus(job.getCompany(),
                    Role.ROLE_ALUMNI, AccountStatus.APPROVED);
            if (alumniCount > 0) {
                job.setIsReferralAvailable(true);
                job.setRelevanceScore(job.getRelevanceScore() + 5); // Max +5 bonus
            }

            validJobs.add(job);
        }

        return validJobs;
    }

    private boolean isLocationValid(String location) {
        String loc = location.toLowerCase();

        // Explicit rejects
        if (loc.contains("us only") || loc.contains("uk only") || loc.contains("europe only")
                || loc.contains("no sponsorship") || loc.contains("citizens only")
                || loc.equals("united states") || loc.equals("us") || loc.equals("uk") || loc.equals("europe")) {
            return false;
        }

        // Accept if contains India or Remote
        return loc.contains("india") || loc.contains("remote") || loc.contains("work from home")
                || loc.contains("pune") || loc.contains("mumbai") || loc.contains("bangalore")
                || loc.contains("bengaluru")
                || loc.contains("hyderabad") || loc.contains("chennai") || loc.contains("delhi") || loc.contains("ncr")
                || loc.contains("noida") || loc.contains("gurugram") || loc.contains("gurgaon")
                || loc.contains("kolkata")
                || loc.contains("ahmedabad");
    }

    private int calculateScore(JobPost job) {
        int score = 0;
        String title = job.getTitle().toLowerCase();
        String desc = job.getDescription() != null ? job.getDescription().toLowerCase() : "";

        // Reject non-IT roles completely
        if (title.contains("sales") || title.contains("marketing") || title.contains("hr ")
                || title.contains("human resources")
                || title.contains("finance") || title.contains("accounting") || title.contains("customer support")
                || title.contains("bpo") || title.contains("call center") || title.contains("medical")
                || title.contains("mechanical") || title.contains("civil") || title.contains("electrical")
                || title.contains("recruiter")) {
            return 0; // Immediate reject
        }

        // Base score matching keywords
        if (title.contains("java developer") || title.contains("software engineer") || title.contains("sde")
                || title.contains("member technical staff") || title.contains("backend developer")
                || title.contains("full stack") || title.contains("software developer")
                || title.contains("developer") || title.contains("engineer") || title.contains("programmer")) {
            score += 60;
        } else if (title.contains("associate") || title.contains("graduate engineer")
                || title.contains("application engineer")) {
            score += 55;
        } else if (title.contains("react") || title.contains("frontend") || title.contains("node")
                || title.contains("mern") || title.contains("web developer")) {
            score += 55;
        } else if (title.contains("qa") || title.contains("test") || title.contains("devops") || title.contains("cloud")
                || title.contains("data") || title.contains("machine learning")) {
            score += 45;
        }

        // Tech stack bonuses
        if (desc.contains("java") || desc.contains("spring boot") || title.contains("java")
                || title.contains("spring")) {
            score += 20;
        }
        if (desc.contains("microservices") || desc.contains("rest api")) {
            score += 10;
        }

        // Experience bonuses (Fresher prioritized)
        if (title.contains("fresher") || title.contains("entry level") || title.contains("graduate")
                || title.contains("intern") || title.contains("trainee") || title.contains("campus")) {
            score += 30;
        } else if (desc.contains("0 years") || desc.contains("0-1 years") || desc.contains("0-2 years")
                || desc.contains("fresher") || desc.contains("entry level")) {
            score += 25;
        } else if (desc.contains("1-3 years") || desc.contains("2-3 years")) {
            score += 10;
        } else if (desc.contains("4+ years") || desc.contains("5+ years")) {
            score -= 5; // Penalize highly experienced roles slightly to favor freshers
        }

        return score;
    }

    private void extractExperience(JobPost job) {
        String text = (job.getTitle() + " " + (job.getDescription() != null ? job.getDescription() : "")).toLowerCase();

        if (text.contains("fresher") || text.contains("entry level") || text.contains("intern")
                || text.contains("trainee") || text.contains("0 years")) {
            job.setMinExperience(0);
            job.setMaxExperience(1);
        } else if (text.contains("0-2 years") || text.contains("0 to 2 years")) {
            job.setMinExperience(0);
            job.setMaxExperience(2);
        } else if (text.contains("1-3 years") || text.contains("1 to 3 years")) {
            job.setMinExperience(1);
            job.setMaxExperience(3);
        } else if (text.contains("2-4 years") || text.contains("2 to 4 years")) {
            job.setMinExperience(2);
            job.setMaxExperience(4);
        } else {
            // Regex to find things like "3+ years" or "3-5 years"
            Matcher mRange = Pattern.compile("(\\d+)\\s*(?:-|to)\\s*(\\d+)\\s*years?").matcher(text);
            if (mRange.find()) {
                try {
                    job.setMinExperience(Integer.parseInt(mRange.group(1)));
                    job.setMaxExperience(Integer.parseInt(mRange.group(2)));
                } catch (Exception ignored) {
                }
            } else {
                Matcher mPlus = Pattern.compile("(\\d+)\\+?\\s*years?").matcher(text);
                if (mPlus.find()) {
                    try {
                        job.setMinExperience(Integer.parseInt(mPlus.group(1)));
                    } catch (Exception ignored) {
                    }
                }
            }
        }
    }

    private String generateJobHash(String company, String title, String location) {
        String normalizedCompany = normalizeStr(company);
        String normalizedTitle = normalizeStr(title);
        String normalizedLocation = normalizeStr(location);

        String raw = normalizedCompany + "|" + normalizedTitle + "|" + normalizedLocation;
        return sha256(raw);
    }

    private String normalizeStr(String input) {
        if (input == null)
            return "";
        return input.toLowerCase()
                .replaceAll("[^a-z0-9]", "") // remove all non-alphanumeric (punctuation, spaces)
                .trim();
    }

    private String sha256(String base) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(base.getBytes(StandardCharsets.UTF_8));
            StringBuilder hexString = new StringBuilder();
            for (byte b : hash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1)
                    hexString.append('0');
                hexString.append(hex);
            }
            return hexString.toString();
        } catch (NoSuchAlgorithmException ex) {
            throw new RuntimeException("SHA-256 not available", ex);
        }
    }
}
