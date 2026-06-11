package com.portal.security;

/*
 * ============================================================
 * 🛡️ JwtAuthenticationFilter.java — The Security Guard
 * ============================================================
 * This class is a FILTER — it intercepts EVERY incoming HTTP request
 * BEFORE it reaches your controllers.
 *
 * WHAT IS A FILTER?
 * Think of it like a security checkpoint at an airport:
 *
 *   HTTP Request ──→ [JwtAuthenticationFilter] ──→ [Your Controller]
 *                         │
 *                    Check passport (JWT token)
 *                    Valid? → Let them through
 *                    Invalid/Missing? → Block or let Spring Security decide
 *
 * HOW IT WORKS:
 * 1. Extract the token from the "Authorization" header
 *    Example header: "Authorization: Bearer eyJhbGciOiJIUzI1..."
 *
 * 2. Validate the token using JwtTokenProvider
 *
 * 3. If valid, load the user details and tell Spring Security:
 *    "Hey, this request is from john@email.com and he has ROLE_STUDENT"
 *
 * 4. Spring Security then checks if that role can access the requested endpoint
 *
 * WHY OncePerRequestFilter?
 * In some setups, a request might pass through filters multiple times
 * (e.g., forwarded requests). OncePerRequestFilter guarantees our
 * code runs exactly ONCE per request — no duplicate checks.
 * ============================================================
 */

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.lang.NonNull;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    @Autowired
    private JwtTokenProvider tokenProvider;

    @Autowired
    private CustomUserDetailsService userDetailsService;

    /*
     * 🔄 doFilterInternal — Runs on EVERY HTTP request
     *
     * @param request     — The incoming HTTP request (contains headers, URL, body, etc.)
     * @param response    — The outgoing HTTP response (we can modify status codes, headers)
     * @param filterChain — The chain of remaining filters. We MUST call filterChain.doFilter()
     *                      to pass the request along. If we don't, the request is blocked here!
     *
     * FLOW:
     *   1. Extract JWT from the "Authorization: Bearer <token>" header
     *   2. Validate the token
     *   3. If valid → load user → set authentication in SecurityContext
     *   4. Always call filterChain.doFilter() to continue processing
     */
    @Override
    protected void doFilterInternal(@NonNull HttpServletRequest request,
                                    @NonNull HttpServletResponse response,
                                    @NonNull FilterChain filterChain)
            throws ServletException, IOException {

        try {
            // Step 1: Extract the JWT token from the request header
            String jwt = extractTokenFromRequest(request);

            // Step 2: Validate the token (is it genuine? not expired?)
            if (StringUtils.hasText(jwt) && tokenProvider.validateToken(jwt)) {

                // Step 3: Extract the email from the token
                String email = tokenProvider.getUsernameFromToken(jwt);

                // Step 4: Load the full user details from the database
                UserDetails userDetails = userDetailsService.loadUserByUsername(email);

                /*
                 * Step 5: Create an Authentication object
                 *
                 * UsernamePasswordAuthenticationToken is Spring Security's way of saying:
                 * "This user is authenticated. Here are their details and authorities."
                 *
                 * Parameters:
                 *   - userDetails:                Who they are
                 *   - null:                       Credentials (null because we already verified via JWT)
                 *   - userDetails.getAuthorities: What roles they have (ROLE_STUDENT, etc.)
                 */
                UsernamePasswordAuthenticationToken authentication =
                        new UsernamePasswordAuthenticationToken(
                                userDetails,
                                null,
                                userDetails.getAuthorities()
                        );

                // Attach additional details (like the IP address of the request)
                authentication.setDetails(
                        new WebAuthenticationDetailsSource().buildDetails(request)
                );

                /*
                 * Step 6: Store the authentication in Spring Security's context
                 *
                 * SecurityContextHolder is like a "session locker" — it stores
                 * the current user's authentication for the duration of this request.
                 *
                 * After this line, anywhere in our code we can call:
                 *   SecurityContextHolder.getContext().getAuthentication()
                 * to get the current logged-in user's info.
                 *
                 * This is a THREAD-LOCAL storage — each HTTP request runs in its
                 * own thread, so different requests don't interfere with each other.
                 */
                SecurityContextHolder.getContext().setAuthentication(authentication);
            }
        } catch (Exception ex) {
            // If anything goes wrong, log it but don't crash the server.
            // The request will proceed without authentication (and Spring Security
            // will reject it if the endpoint requires authentication).
            System.err.println("Could not set user authentication: " + ex.getMessage());
        }

        // CRITICAL: Always call this! It passes the request to the next filter
        // in the chain (and eventually to your controller).
        // If you forget this line, ALL requests will hang and never get a response!
        filterChain.doFilter(request, response);
    }

    /*
     * 📤 Extract the JWT token from the HTTP request header
     *
     * The standard format is:
     *   Authorization: Bearer eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOi...
     *
     * "Bearer" is a token type prefix (an industry standard from OAuth 2.0).
     * We strip it off to get just the token string.
     *
     * If the header is missing or doesn't start with "Bearer ", we return null
     * (meaning: this request has no authentication token).
     */
    private String extractTokenFromRequest(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");

        if (StringUtils.hasText(bearerToken) && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);  // Remove "Bearer " (7 characters) from the start
        }

        return null;
    }
}
