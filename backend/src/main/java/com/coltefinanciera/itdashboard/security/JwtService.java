package com.coltefinanciera.itdashboard.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Date;
import java.util.List;

@Service
public class JwtService {

    private final JwtProperties properties;
    private final SecretKey secretKey;

    public JwtService(JwtProperties properties) {
        this.properties = properties;
        this.secretKey = Keys.hmacShaKeyFor(properties.secret().getBytes(StandardCharsets.UTF_8));
    }

    public String generateToken(AuthenticatedUser user) {
        Instant now = Instant.now();
        Instant expiresAt = now.plusSeconds(properties.accessTokenMinutes() * 60);
        return Jwts.builder()
                .issuer(properties.issuer())
                .subject(user.username())
                .claim("uid", user.userId())
                .claim("name", user.fullName())
                .claim("permissions", user.permissions())
                .issuedAt(Date.from(now))
                .expiration(Date.from(expiresAt))
                .signWith(secretKey)
                .compact();
    }

    public Claims parse(String token) {
        return Jwts.parser()
                .verifyWith(secretKey)
                .requireIssuer(properties.issuer())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    @SuppressWarnings("unchecked")
    public AuthenticatedUser toUser(Claims claims) {
        Object uid = claims.get("uid");
        Long userId = uid instanceof Number number ? number.longValue() : Long.valueOf(String.valueOf(uid));
        List<String> permissions = claims.get("permissions", List.class);
        return new AuthenticatedUser(
                userId,
                claims.getSubject(),
                String.valueOf(claims.get("name")),
                SetSupport.copyOf(permissions)
        );
    }
}
