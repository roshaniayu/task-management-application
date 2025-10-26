package com.example.task_management_server.interceptor;

import java.io.IOException;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

import com.example.task_management_server.service.JwtService;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Component
public class AuthInterceptor implements HandlerInterceptor {

    private final JwtService jwtService;

    private static final String AUTH_HEADER = "Authorization";
    static final String AUTH_HEADER_PREFIX = "Bearer ";

    @Autowired
    public AuthInterceptor(JwtService jwtService) {
        this.jwtService = jwtService;
    }

    @Override
    public boolean preHandle(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response, @NonNull Object handler)
            throws IOException {

        String authHeader = request.getHeader(AUTH_HEADER);
        if (authHeader != null && authHeader.startsWith(AUTH_HEADER_PREFIX)) {
            String token = authHeader.substring(AUTH_HEADER_PREFIX.length());
            String username = jwtService.validateToken(token);
            if (username != null) {
                request.setAttribute("username", username);
                return true;
            }
        }

        setUnauthorizedResponse(response);
        return false;
    }

    public void setUnauthorizedResponse(HttpServletResponse response) throws IOException {
        String err = "{\"error\":\"unauthorized\"}";

        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        response.setContentType("application/json");
        response.getWriter().write(err);
    }

}