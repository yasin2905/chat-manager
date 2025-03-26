package com.tiddev.supportplatform.chat.model;


import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
public class ChatMessage {
    public enum MessageType { TEXT, IMAGE, FILE }

    private MessageType type;
    private String content;
    private String sender;
    private String receiver;
    private String timestamp;
}