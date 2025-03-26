package com.tiddev.supportplatform.chat.listener;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.messaging.SessionConnectEvent;

import java.util.ArrayList;
import java.util.Map;

@Component
public class WebSocketEventListener {

    @Autowired
    ObjectMapper objectMapper;

    @EventListener
    public void handleWebSocketConnectListener(SessionConnectEvent event) {

        Object nativeHeaders = event.getMessage().getHeaders().get("nativeHeaders");
        Map userDataMap = objectMapper.convertValue(nativeHeaders, Map.class);
        String username = String.valueOf(objectMapper.convertValue(userDataMap.get("username"), ArrayList.class).get(0));
        String token = String.valueOf(objectMapper.convertValue(userDataMap.get("token"), ArrayList.class).get(0));


        System.out.println("New WebSocket connection established!");

        // Extract STOMP headers or session details
        org.springframework.messaging.Message<?> message = event.getMessage();
        System.out.println("Headers: " + message.getHeaders());

        // You can access the session ID or other details from the headers
        String sessionId = (String) message.getHeaders().get("simpSessionId");
        System.out.println("Session ID: " + sessionId);
    }
}