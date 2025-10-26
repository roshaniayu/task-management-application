package com.example.task_management_server.interceptor;

import com.example.task_management_server.exception.AuthenticationException;
import com.example.task_management_server.service.JwtService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

@Component
public class AuthInterceptor implements HandlerInterceptor {

    static final String AUTH_HEADER_PREFIX = "Bearer ";
    private static final String AUTH_HEADER = "Authorization";
    private final JwtService jwtService;

    @Autowired
    public AuthInterceptor(JwtService jwtService) {
        this.jwtService = jwtService;
    }

    @Override
    public boolean preHandle(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response, @NonNull Object handler)
            throws AuthenticationException {

        String authHeader = request.getHeader(AUTH_HEADER);
        if (authHeader != null && authHeader.startsWith(AUTH_HEADER_PREFIX)) {
            String token = authHeader.substring(AUTH_HEADER_PREFIX.length());
            String username = jwtService.validateToken(token);
            if (username != null) {
                request.setAttribute("username", username);
                return true;
            }
        }

        throw new AuthenticationException("token not found");
    }
}