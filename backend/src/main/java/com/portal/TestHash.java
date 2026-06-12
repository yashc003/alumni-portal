package com.portal;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

public class TestHash {
    public static void main(String[] args) {
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
        System.out.println("Match? " + encoder.matches("Admin@123", "$2a$10$EqKcp1WFKqGIVo9UR/cPfuDPh1PsHfBjx1ZxhP7v8JxqgXGQiJfam"));
    }
}
