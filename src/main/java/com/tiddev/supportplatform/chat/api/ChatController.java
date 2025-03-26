package com.tiddev.supportplatform.chat.api;


import com.tiddev.supportplatform.chat.model.ChatMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.security.Principal;
import java.time.LocalDateTime;

@Controller
public class ChatController {

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @MessageMapping("/chat.private")
    public void handlePrivateMessage(@Payload ChatMessage message, Principal principal) {
        message.setSender(principal.getName());
        message.setTimestamp(LocalDateTime.now().toString());

        // Send to receiver
        messagingTemplate.convertAndSendToUser(
                message.getReceiver(),
                "/queue/private",
                message
        );

        // Send confirmation to sender
        messagingTemplate.convertAndSendToUser(
                message.getSender(),
                "/queue/private",
                message
        );
    }
}