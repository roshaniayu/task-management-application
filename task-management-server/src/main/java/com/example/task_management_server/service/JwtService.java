package com.example.task_management_server.service;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.util.Base64;
import java.util.Date;
import java.util.Map;

@Service
public class JwtService {

    private final Key signingKey;
    private final long expirationMs;

    public JwtService(
            @Value("${app.jwt.secret}") String secret,
            @Value("${app.jwt.expiration-seconds}") long expirationSeconds) {

        byte[] keyBytes = secret.getBytes(StandardCharsets.UTF_8);

        this.signingKey = Keys.hmacShaKeyFor(keyBytes);
        this.expirationMs = expirationSeconds * 1000L;
    }

    public String generateToken(String username) {
        Date now = new Date();
        Date exp = new Date(now.getTime() + expirationMs);

        return Jwts.builder()
                .setClaims(Map.of("username", username))
                .setIssuedAt(now)
                .setExpiration(exp)
                .signWith(signingKey, SignatureAlgorithm.HS256)
                .compact();
    }

    public String validateToken(String token) {
        try {
            return Jwts.parserBuilder()
                    .setSigningKey(signingKey)
                    .build()
                    .parseClaimsJws(token)
                    .getBody()
                    .get("username", String.class);
        } catch (Exception e) {
            return null;
        }
    }

    public String generateTelegramKey(String username) {
        return Base64.getEncoder().encodeToString(
                Jwts.builder()
                        .setClaims(Map.of("telegram", username))
                        .signWith(signingKey, SignatureAlgorithm.HS256)
                        .compact().getBytes(StandardCharsets.UTF_8));
    }

    public String validateTelegramKey(String encTelegramKey) {
        try {
            byte[] decodedBytes = Base64.getDecoder().decode(encTelegramKey);
            String telegramKey = new String(decodedBytes, StandardCharsets.UTF_8);

            return Jwts.parserBuilder()
                    .setSigningKey(signingKey)
                    .build()
                    .parseClaimsJws(telegramKey)
                    .getBody()
                    .get("telegram", String.class);
        } catch (IllegalArgumentException e) {
            // Base64 decoding failed
            return null;
        } catch (Exception e) {
            // JWT validation failed
            return null;
        }
    }

}