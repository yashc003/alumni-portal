package com.portal;

/*
 * ============================================================
 * 🚀 AlumniPortalApplication.java — The Entry Point
 * ============================================================
 * This is the MAIN class of our entire backend application.
 * When you run the app, Java starts executing from the main() method here.
 *
 * KEY CONCEPT: @SpringBootApplication
 * This single annotation is actually a shortcut for THREE annotations combined:
 *
 * 1. @SpringBootConfiguration — Marks this class as a configuration source
 *    (Spring can read settings from here)
 *
 * 2. @EnableAutoConfiguration — Tells Spring Boot to automatically configure
 *    things based on what dependencies we added in pom.xml. For example:
 *    - We added spring-boot-starter-web → Spring auto-configures an embedded Tomcat server
 *    - We added spring-boot-starter-data-jpa → Spring auto-configures database connections
 *
 * 3. @ComponentScan — Tells Spring to scan all classes in this package (com.portal)
 *    and its sub-packages (com.portal.controller, com.portal.service, etc.)
 *    looking for classes annotated with @Controller, @Service, @Repository, etc.
 *    It then creates instances of those classes and manages them (this is called
 *    "Dependency Injection" — we'll learn about this in Step 2!)
 * ============================================================
 */

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class AlumniPortalApplication {

    /*
     * main() — The starting point of any Java application.
     *
     * SpringApplication.run() does ALL the heavy lifting:
     * 1. Creates the Spring application context (the "container" for all our
     * objects)
     * 2. Scans for components (@Controller, @Service, @Repository classes)
     * 3. Connects to the database
     * 4. Starts the embedded Tomcat web server (default port: 8080)
     * 5. Your API is now live at http://localhost:8080 !
     */
    public static void main(String[] args) {
        SpringApplication.run(AlumniPortalApplication.class, args);
    }
}
