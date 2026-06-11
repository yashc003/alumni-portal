package com.portal.security;

/*
 * ============================================================
 * 🎫 JwtTokenProvider.java — The Passport Printer & Validator
 * ============================================================
 * This class handles everything related to JWT (JSON Web Tokens).
 *
 * WHAT IS A JWT?
 * A JWT is a compact, URL-safe string that carries information (called "claims").
 * It looks like this: xxxxx.yyyyy.zzzzz (three parts separated by dots)
 *
 *   Part 1 — HEADER:  Says which algorithm was used to sign the token
 *                      {"alg": "HS256", "typ": "JWT"}
 *
 *   Part 2 — PAYLOAD: Contains the actual data (called "claims")
 *                      {"sub": "john@email.com", "role": "ROLE_STUDENT", "exp": 1718100000}
 *                      - sub (subject): Who this token belongs to
 *                      - role: What permissions they have
 *                      - exp (expiration): When this token expires
 *
 *   Part 3 — SIGNATURE: A cryptographic signature that proves the token hasn't been tampered with.
 *                        Created using: HMAC-SHA256(header + payload, SECRET_KEY)
 *
 * WHY USE JWT?
 * Without JWT, the server would need to store session data for every logged-in user
 * (in memory or a database). With JWT, the token itself carries all the info —
 * the server just validates the signature. This is called "STATELESS" authentication.
 *
 * ANALOGY:
 * Think of JWT like a movie ticket:
 *   - The theater PRINTS the ticket (we create the token at login)
 *   - The ticket has your SEAT NUMBER, MOVIE NAME, and SHOWTIME (the claims)
 *   - There's a HOLOGRAM stamp that proves the ticket is real (the signature)
 *   - At the entrance, they just LOOK at the hologram — they don't need to check a database
 *   - The ticket EXPIRES after the showtime (token expiration)
 * ============================================================
 */

import io.jsonwebtoken.*;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.util.Date;

/*
 * @Component — Tells Spring: "Create ONE instance of this class and manage it."
 *
 * This is part of Spring's "Dependency Injection" system:
 *   - Spring creates a JwtTokenProvider object when the app starts
 *   - Any class that needs it can just declare it as a field
 *   - Spring automatically "injects" (provides) the instance
 *
 * Think of it like a restaurant kitchen:
 *   @Component = "This tool should be available on the tool rack"
 *   @Autowired = "I need that tool — hand it to me"
 */
@Component
public class JwtTokenProvider {

    /*
     * @Value("${app.jwt.secret}") — Reads the value from application.properties!
     *
     * Remember in application.properties we wrote:
     *   app.jwt.secret=dGhpcyBpcyBhIHZlcn...
     *
     * Spring reads that value and injects it into this field.
     * This way, we don't hardcode secrets in our Java code.
     *
     * The "${...}" syntax is called SpEL (Spring Expression Language).
     */
    @Value("${app.jwt.secret}")
    private String jwtSecret;

    @Value("${app.jwt.expiration-ms}")
    private long jwtExpirationMs;

    /*
     * Converts our Base64-encoded secret string into a cryptographic key.
     * The JJWT library needs a SecretKey object, not a plain string.
     *
     * HMAC-SHA = Hash-based Message Authentication Code with SHA algorithm
     * It's the algorithm used to create and verify the token's signature.
     */
    private SecretKey getSigningKey() {
        byte[] keyBytes = Decoders.BASE64.decode(jwtSecret);
        return Keys.hmacShaKeyFor(keyBytes);
    }

    /*
     * 🖨️ CREATE A TOKEN — Called after successful login
     *
     * @param authentication — Spring Security's object containing the logged-in user's info
     * @return A JWT token string like "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOi..."
     *
     * The token is built using the Builder Pattern:
     *   Jwts.builder()          → Start building a token
     *     .subject(email)       → Set WHO this token is for
     *     .issuedAt(now)        → Set WHEN the token was created
     *     .expiration(expiry)   → Set WHEN the token expires
     *     .signWith(key)        → Sign with our secret key (creates the signature)
     *     .compact()            → Build the final string
     */
    public String generateToken(Authentication authentication) {
        // Get the user's details from the Authentication object
        UserDetails userDetails = (UserDetails) authentication.getPrincipal();

        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + jwtExpirationMs);

        return Jwts.builder()
                .subject(userDetails.getUsername())  // "username" is actually the email in our case
                .issuedAt(now)
                .expiration(expiryDate)
                .signWith(getSigningKey())
                .compact();
    }

    /*
     * 📖 READ THE TOKEN — Extract the email from a token
     *
     * @param token — The JWT string from the Authorization header
     * @return The email address stored in the token's "subject" claim
     *
     * This is called on every request by JwtAuthenticationFilter
     * to figure out WHO is making the request.
     *
     * Jwts.parser()                → Create a parser
     *   .verifyWith(key)           → Use our secret key to verify the signature
     *   .build()                   → Build the parser
     *   .parseSignedClaims(token)  → Parse the token (throws exception if invalid!)
     *   .getPayload()              → Get the claims (the data)
     *   .getSubject()              → Get the "sub" claim (the email)
     */
    public String getUsernameFromToken(String token) {
        Claims claims = Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();

        return claims.getSubject();
    }

    /*
     * ✅ VALIDATE THE TOKEN — Check if a token is genuine and not expired
     *
     * @param token — The JWT string to validate
     * @return true if valid, false if expired/tampered/malformed
     *
     * How validation works:
     * 1. Parse the token using our secret key
     * 2. If parsing succeeds → the signature is valid (not tampered)
     * 3. JJWT automatically checks if the token has expired
     * 4. If anything fails, an exception is thrown → we catch it and return false
     *
     * Common failure reasons:
     *   - ExpiredJwtException:      Token's expiration date has passed
     *   - MalformedJwtException:    Token string is corrupted or badly formatted
     *   - SecurityException:        Signature doesn't match (someone tampered with it!)
     *   - UnsupportedJwtException:  Token uses an algorithm we don't support
     */
    public boolean validateToken(String token) {
        try {
            Jwts.parser()
                    .verifyWith(getSigningKey())
                    .build()
                    .parseSignedClaims(token);
            return true;  // If no exception was thrown, the token is valid!
        } catch (ExpiredJwtException ex) {
            System.err.println("JWT token has expired: " + ex.getMessage());
        } catch (MalformedJwtException ex) {
            System.err.println("Invalid JWT token format: " + ex.getMessage());
        } catch (SecurityException ex) {
            System.err.println("JWT signature validation failed: " + ex.getMessage());
        } catch (UnsupportedJwtException ex) {
            System.err.println("Unsupported JWT token: " + ex.getMessage());
        } catch (IllegalArgumentException ex) {
            System.err.println("JWT claims string is empty: " + ex.getMessage());
        }
        return false;  // Something went wrong → token is invalid
    }
}
