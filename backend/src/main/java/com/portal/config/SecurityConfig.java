package com.portal.config;

/*
 * ============================================================
 * 📜 SecurityConfig.java — The Rule Book
 * ============================================================
 * This is the CENTRAL configuration for Spring Security.
 * It answers three questions:
 *
 *   1. WHICH ENDPOINTS ARE PUBLIC? (no login needed)
 *      → /api/auth/register, /api/auth/login
 *
 *   2. WHICH ENDPOINTS NEED SPECIFIC ROLES?
 *      → /api/admin/** requires ROLE_ADMIN
 *
 *   3. HOW SHOULD AUTHENTICATION WORK?
 *      → Stateless JWT (no cookies, no server-side sessions)
 *
 * WHAT IS A SecurityFilterChain?
 * Spring Security works by running your request through a CHAIN of filters:
 *
 *   Request → CORS → CSRF → JwtAuthFilter → Authorization → Controller
 *
 * Each filter has a specific job. We customize this chain here.
 *
 * WHAT IS @Configuration?
 * It tells Spring: "This class contains bean definitions."
 * A @Bean method creates an object that Spring manages (like @Component,
 * but for objects where we need to configure them with code, not just annotations).
 *
 * WHAT IS @EnableWebSecurity?
 * It activates Spring Security's web protection features.
 * Without this, none of our security rules would take effect.
 * ============================================================
 */

import com.portal.security.JwtAuthenticationFilter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Autowired
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    /*
     * 🔗 SecurityFilterChain — The main security configuration
     *
     * @Bean — Tells Spring: "I'm creating this object. Manage it for me."
     *         Unlike @Component (which goes on a CLASS), @Bean goes on a METHOD
     *         inside a @Configuration class. It's used when you need to CREATE
     *         and CONFIGURE an object with code.
     *
     * This method uses a "fluent API" (method chaining) to configure security.
     * Each .method() call configures a different aspect.
     */
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {

        http
            /*
             * CSRF (Cross-Site Request Forgery) Protection → DISABLED
             *
             * WHAT IS CSRF?
             * A CSRF attack tricks a logged-in user's browser into making unwanted requests.
             * Example: You're logged into your bank. A malicious site makes your browser
             * send a hidden request to transfer money — using your existing session cookie.
             *
             * WHY DISABLE IT?
             * CSRF protection is for cookie-based sessions. Since we use JWT tokens
             * (sent in the Authorization header, NOT in cookies), CSRF attacks are
             * not possible. The attacker can't access the JWT stored in localStorage.
             */
            .csrf(csrf -> csrf.disable())

            /*
             * CORS (Cross-Origin Resource Sharing) → ENABLED
             *
             * WHAT IS CORS?
             * Browsers block requests between different origins (domain + port) by default.
             * Our frontend runs on http://localhost:5173 (Vite)
             * Our backend runs on http://localhost:8080 (Spring Boot)
             * These are DIFFERENT ORIGINS (different ports), so the browser would block it!
             *
             * CORS headers tell the browser: "It's OK, I trust requests from localhost:5173"
             */
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))

            /*
             * SESSION MANAGEMENT → STATELESS
             *
             * By default, Spring Security creates an HTTP session (stored on the server)
             * for each logged-in user. But we're using JWT tokens instead!
             *
             * STATELESS means: "Don't create any sessions. Every request must carry
             * its own authentication (the JWT token in the header)."
             *
             * This is better for scalability — if you have 3 servers behind a load balancer,
             * any server can handle any request because there's no session to look up.
             */
            .sessionManagement(session ->
                session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            )

            /*
             * AUTHORIZATION RULES — Who can access what?
             *
             * These rules are checked IN ORDER — the first match wins.
             * That's why we put specific rules first and the catch-all last.
             *
             * requestMatchers("/path") → Apply this rule to this URL pattern
             * permitAll()              → Anyone can access (no login needed)
             * hasRole("ADMIN")         → Only users with ROLE_ADMIN can access
             * authenticated()          → Any logged-in user can access (any role)
             */
            .authorizeHttpRequests(auth -> auth
                // 🟢 PUBLIC endpoints — anyone can access these without logging in
                .requestMatchers("/api/auth/**").permitAll()
                // 🔌 WebSocket Handshake — must be public so the browser can connect. 
                // Security is handled LATER by WebSocketAuthInterceptor during STOMP CONNECT!
                .requestMatchers("/ws/**").permitAll()
                // The /** means "any sub-path", so this covers:
                //   /api/auth/register, /api/auth/login, /api/auth/anything-else

                // 🔴 ADMIN-ONLY endpoints — only Class Coordinators
                .requestMatchers("/api/admin/**").hasRole("ADMIN")
                // Note: hasRole("ADMIN") checks for "ROLE_ADMIN" authority.
                // Spring Security automatically adds the "ROLE_" prefix!

                // 🟡 EVERYTHING ELSE requires authentication (any role)
                .anyRequest().authenticated()
            );

        /*
         * ADD OUR JWT FILTER to the chain
         *
         * We insert our JwtAuthenticationFilter BEFORE Spring's built-in
         * UsernamePasswordAuthenticationFilter. This ensures our JWT check
         * runs first, before Spring tries its default authentication.
         *
         * Think of it as: "Check the JWT passport BEFORE asking for username/password"
         */
        http.addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    /*
     * 🌍 CORS Configuration
     *
     * Specifies exactly which origins, methods, and headers are allowed.
     * This is the detailed version of "allow frontend to talk to backend."
     */
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();

        // Which origins (frontend URLs) are allowed to make requests?
        configuration.setAllowedOrigins(List.of(
                "http://localhost:5173",    // Vite dev server
                "http://localhost:3000"     // Alternative dev server port
        ));

        // Which HTTP methods are allowed?
        configuration.setAllowedMethods(Arrays.asList(
                "GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"
        ));

        // Which request headers can the frontend send?
        configuration.setAllowedHeaders(Arrays.asList(
                "Authorization",    // Our JWT token
                "Content-Type",     // JSON data
                "Accept"            // Response format preference
        ));

        // Should the browser send credentials (cookies)? We set true for flexibility,
        // even though we use JWT. Some browsers need this for CORS preflight requests.
        configuration.setAllowCredentials(true);

        // Apply these CORS rules to ALL endpoints
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    /*
     * 🔑 AuthenticationManager Bean
     *
     * The AuthenticationManager is Spring Security's "master authenticator."
     * When someone tries to log in, we call:
     *   authenticationManager.authenticate(usernamePasswordToken)
     *
     * It then:
     * 1. Calls CustomUserDetailsService.loadUserByUsername()
     * 2. Compares the provided password with the stored BCrypt hash
     * 3. Returns an Authentication object if successful
     * 4. Throws an exception if credentials are wrong
     *
     * We need to expose it as a @Bean so we can use it in our AuthService (Step 4).
     */
    @Bean
    public AuthenticationManager authenticationManager(
            AuthenticationConfiguration authenticationConfiguration) throws Exception {
        return authenticationConfiguration.getAuthenticationManager();
    }

    /*
     * 🔐 Password Encoder Bean
     *
     * BCrypt is a one-way hashing algorithm designed specifically for passwords.
     *
     * WHY BCRYPT?
     * 1. It's SLOW ON PURPOSE — each hash takes ~100ms (vs microseconds for SHA-256).
     *    This makes brute-force attacks impractical (billions of guesses would take years).
     * 2. It automatically generates and stores a SALT (random data mixed into the hash).
     *    Two users with the same password get different hashes!
     * 3. The strength factor (10 by default) can be increased as computers get faster.
     *
     * Example:
     *   "Admin@123" → "$2a$10$EqKcp1WFKqGIVo9UR/cPfuDPh1PsHfBjx1ZxhP7v8JxqgXGQiJfam"
     *   "Admin@123" → "$2a$10$XYZ..." (different hash because of different salt!)
     *
     * Spring Security uses this encoder when:
     *   - Registration: Hashing the password before saving
     *   - Login: Comparing the provided password with the stored hash
     */
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
