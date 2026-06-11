package com.portal.controller;

/*
 * ============================================================
 * 🌐 AuthController.java — HTTP Endpoints for Authentication
 * ============================================================
 * A Controller is the ENTRY POINT for HTTP requests. When the frontend
 * makes a request, it hits the controller first.
 *
 * WHAT IS @RestController?
 * It combines two annotations:
 *   @Controller — "I handle HTTP requests"
 *   @ResponseBody — "I return data directly (JSON), not an HTML page"
 *
 * WHAT IS @RequestMapping("/api/auth")?
 * It sets a BASE PATH for all endpoints in this controller.
 * So if we define @PostMapping("/register"), the full URL becomes:
 *   POST http://localhost:8080/api/auth/register
 *
 * HOW DOES SPRING CONVERT JSON ↔ JAVA?
 * When the frontend sends JSON in the request body, Spring automatically
 * converts it to a Java object (deserialization) using the Jackson library.
 * When we return a Java object, Spring converts it to JSON (serialization).
 *
 *   Frontend → { "email": "john@..." }  →  Spring → new LoginRequest("john@...")
 *   Backend  → new AuthResponse(...)     →  Spring → { "token": "eyJ..." }
 *
 * THE @Valid ANNOTATION:
 * When we add @Valid before a parameter, Spring automatically runs all
 * the validation annotations on that class (@NotBlank, @Email, @Size, etc.)
 * BEFORE our code runs. If validation fails, Spring returns 400 Bad Request.
 * ============================================================
 */

import com.portal.dto.AuthResponse;
import com.portal.dto.LoginRequest;
import com.portal.dto.RegisterRequest;
import com.portal.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthService authService;

    /*
     * 📝 POST /api/auth/register — Register a new user
     *
     * @PostMapping — This method handles HTTP POST requests to /api/auth/register
     *
     * @RequestBody — Tells Spring: "The request body contains JSON. Convert it
     *                to a RegisterRequest object for me."
     *
     * @Valid — Tells Spring: "Run all validation annotations on RegisterRequest
     *          BEFORE calling this method. If validation fails, return 400."
     *
     * ResponseEntity<> — A wrapper that lets us control:
     *   - The HTTP status code (201 Created, 400 Bad Request, etc.)
     *   - The response body (the JSON data)
     *   - Response headers (if needed)
     *
     * Map.of("message", ...) — Creates a simple JSON response like:
     *   { "message": "Registration successful! Please wait for admin approval." }
     */
    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest request) {
        try {
            String message = authService.register(request);

            // Return 201 CREATED status (better than 200 OK for resource creation)
            return ResponseEntity
                    .status(HttpStatus.CREATED)       // HTTP 201
                    .body(Map.of("message", message)); // { "message": "Registration successful!..." }

        } catch (RuntimeException ex) {
            // Return 400 BAD REQUEST with the error message
            return ResponseEntity
                    .badRequest()                                // HTTP 400
                    .body(Map.of("error", ex.getMessage()));     // { "error": "Email already registered" }
        }
    }

    /*
     * 🔑 POST /api/auth/login — Authenticate and get a JWT token
     *
     * SUCCESS (200 OK):
     * {
     *   "token": "eyJhbGciOiJIUzI1NiJ9...",
     *   "tokenType": "Bearer",
     *   "fullName": "John Doe",
     *   "email": "john@email.com",
     *   "role": "ROLE_STUDENT"
     * }
     *
     * FAILURE - Wrong credentials (401 UNAUTHORIZED):
     * { "error": "Invalid email or password" }
     *
     * FAILURE - Account not approved (403 FORBIDDEN):
     * { "error": "Account is not approved yet. Please wait for admin verification." }
     */
    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest request) {
        try {
            AuthResponse response = authService.login(request);

            // Return 200 OK with the token and user info
            return ResponseEntity.ok(response);

        } catch (RuntimeException ex) {
            /*
             * We check the error message to determine the right HTTP status code:
             * - "not approved" → 403 Forbidden (credentials OK, but access denied)
             * - anything else  → 401 Unauthorized (bad credentials)
             *
             * In production, we'd use custom exception classes instead of parsing messages.
             * But for learning, this approach is clear and understandable.
             */
            HttpStatus status = ex.getMessage().contains("not approved")
                    ? HttpStatus.FORBIDDEN      // 403
                    : HttpStatus.UNAUTHORIZED;  // 401

            return ResponseEntity
                    .status(status)
                    .body(Map.of("error", ex.getMessage()));
        }
    }
}
