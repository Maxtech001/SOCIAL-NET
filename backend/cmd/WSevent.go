package main

import (
	"encoding/json"

	"01.kood.tech/git/Maxwell/social-network/backend/models"
)

type Event struct {
	Type    string          `json:"type"`
	Payload json.RawMessage `json:"payload"`
}

type EventHandler func(event Event, c *Client) error

type SendMessageEvent struct {
	Content    string `json:"content"`
	SenderId   int    `json:"senderId"`
	ReceiverId int    `json:"receiverId"`
}

type ReturnMessageEvent struct {
	MessageId int `json:"messageId"`
	SendMessageEvent
	Sent string `json:"sent"`
}

type ReturnChatDataEvent struct {
	CurrentChatterDisplayname string               `json:"currentChatterDisplayname"`
	OtherChatterDisplayname   string               `json:"otherChatterDisplayname"`
	Messages                  []ReturnMessageEvent `json:"messages"`
}

type SendChatDataEvent struct {
	CurrentChatterId int `json:"currentChatterId"`
	OtherChatterId   int `json:"otherChatterId"`
	Amount           int `json:"amount"`
}

type SendGroupMessageEvent struct {
	Content  string `json:"content"`
	SenderId int    `json:"senderId"`
	GroupId  int    `json:"groupId"`
}

type ReturnGroupMessageEvent struct {
	MessageId int `json:"messageId"`
	SendGroupMessageEvent
	Sent string `json:"sent"`
}

type ReturnGroupChatDataEvent struct {
	GroupData models.Group              `json:"groupData"`
	Messages  []ReturnGroupMessageEvent `json:"messages"`
}

type SendGroupChatDataEvent struct {
	GroupId       int `json:"groupId"`
	CurrentUserId int `json:"currentUserId"`
	Amount        int `json:"amount"`
}

const (
	EventSendMessage      = "send_message"
	EventNewMessage       = "new_message"
	EventGetMessages      = "get_messages"
	EventSendGroupMessage = "send_group_message"
	EventNewGroupMessage  = "new_group_message"
	EventGetGroupMessages = "get_group_messages"
)
