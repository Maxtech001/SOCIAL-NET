package main

import (
	"database/sql"
	"encoding/json"
	"errors"
	"fmt"
	"log"
	"net/http"
	"strconv"
	"sync"
	"time"
	"01.kood.tech/git/Maxwell/social-network/backend/database"
	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	CheckOrigin:     func(r *http.Request) bool { return true },
}

type Manager struct {
	clients ClientList
	sync.RWMutex
	handlers map[string]EventHandler
	db       *sql.DB
}

func NewManager() *Manager {
	db, err := database.OpenDatabase()
	if err != nil {
		log.Println(err)
	}

	m := &Manager{
		clients:  make(ClientList),
		handlers: make(map[string]EventHandler),
		db:       db,
	}

	m.setupEventHandlers()
	return m
}

func (m *Manager) routeEvent(event Event, c *Client) error {
	if handler, ok := m.handlers[event.Type]; ok {
		if err := handler(event, c); err != nil {
			return err
		}
		return nil
	} else {
		return errors.New("there is no such event type")
	}
}

func (m *Manager) setupEventHandlers() {
	m.handlers[EventSendMessage] = m.SendMessageHandler
	m.handlers[EventGetMessages] = m.GetMessagesHandler
	m.handlers[EventSendGroupMessage] = m.SendGroupMessageHandler
	m.handlers[EventGetGroupMessages] = m.GetGroupMessagesHandler
}

func (m *Manager) SendMessageHandler(event Event, c *Client) error {
	var chatEvent SendMessageEvent
	if err := json.Unmarshal(event.Payload, &chatEvent); err != nil {
		return fmt.Errorf("bad payload in request: %v", err)
	}

	var returnMsg ReturnMessageEvent
	returnMsg.Sent = time.Now().Format("2006-01-02 15:04:05")
	returnMsg.Content = chatEvent.Content
	returnMsg.ReceiverId = chatEvent.ReceiverId
	returnMsg.SenderId = chatEvent.SenderId

	addMessageToTable(returnMsg, m.db)

	data, err := json.Marshal(returnMsg)
	if err != nil {
		return fmt.Errorf("failed to marshal broadcast message: %v", err)
	}

	var outgoingEvent Event
	outgoingEvent.Payload = data
	outgoingEvent.Type = EventNewMessage

	for client := range c.manager.clients {

		if client.userId == returnMsg.ReceiverId {
			client.egress <- outgoingEvent
		}

	}
	return nil
}

func (m *Manager) SendGroupMessageHandler(event Event, c *Client) error {
	var groupChatEvent SendGroupMessageEvent
	if err := json.Unmarshal(event.Payload, &groupChatEvent); err != nil {
		return fmt.Errorf("bad payload in request: %v", err)
	}

	var returnMsg ReturnGroupMessageEvent
	returnMsg.Sent = time.Now().Format("2006-01-02 15:04:05")
	returnMsg.Content = groupChatEvent.Content
	returnMsg.GroupId = groupChatEvent.GroupId
	returnMsg.SenderId = groupChatEvent.SenderId

	allMemberIds := getAllGroupMemberIds(groupChatEvent.GroupId, m.db)

	addGroupMessageToTable(returnMsg, m.db)

	data, err := json.Marshal(returnMsg)
	if err != nil {
		return fmt.Errorf("failed to marshal broadcast message: %v", err)
	}

	var outgoingEvent Event
	outgoingEvent.Payload = data
	outgoingEvent.Type = EventNewGroupMessage

	for client := range c.manager.clients {
		for _, memberId := range allMemberIds {
			if client.userId == memberId {
				client.egress <- outgoingEvent
			}
		}
	}
	return nil
}

func (m *Manager) GetMessagesHandler(event Event, c *Client) error {
	var chatDataEvent SendChatDataEvent
	if err := json.Unmarshal(event.Payload, &chatDataEvent); err != nil {
		return fmt.Errorf("bad payload in request: %v", err)
	}

	data, err := json.Marshal(getChatData(chatDataEvent.CurrentChatterId, chatDataEvent.OtherChatterId, chatDataEvent.Amount, m.db))
	if err != nil {
		return fmt.Errorf("failed to marshal broadcast message: %v", err)
	}

	var outgoingEvent Event
	outgoingEvent.Payload = data
	outgoingEvent.Type = EventGetMessages
	c.egress <- outgoingEvent

	return nil
}

func (m *Manager) GetGroupMessagesHandler(event Event, c *Client) error {
	var groupChatDataEvent SendGroupChatDataEvent
	if err := json.Unmarshal(event.Payload, &groupChatDataEvent); err != nil {
		return fmt.Errorf("bad payload in request: %v", err)
	}

	data, err := json.Marshal(getGroupChatData(groupChatDataEvent, m.db))
	if err != nil {
		return fmt.Errorf("failed to marshal broadcast message: %v", err)
	}

	var outgoingEvent Event
	outgoingEvent.Payload = data
	outgoingEvent.Type = EventGetGroupMessages
	c.egress <- outgoingEvent

	return nil
}

func (m *Manager) ServeWS(w http.ResponseWriter, r *http.Request) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println(err, "18")
		return
	}

	userId, _ := strconv.Atoi(r.URL.Query().Get("userId"))
	client := NewClient(conn, m, userId)

	m.addClient(client)

	// start client processes
	go client.readMessages()
	go client.writeMessages()
}

func (m *Manager) addClient(client *Client) {
	m.Lock()
	defer m.Unlock()

	m.clients[client] = true
}

func (m *Manager) removeClient(client *Client) {
	m.Lock()
	defer m.Unlock()

	if _, ok := m.clients[client]; ok {
		client.connection.Close()
		delete(m.clients, client)
	}
}

func getDisplaynameById(userId int, db *sql.DB) string {
	var firstName string
	var lastName string

	db.QueryRow("SELECT firstName, lastName FROM users WHERE userId = ?", userId).Scan(&firstName, &lastName)
	return firstName + " " + lastName
}

func reverseUserMsgSlice(s []ReturnMessageEvent) {
	for i, j := 0, len(s)-1; i < j; i, j = i+1, j-1 {
		s[i], s[j] = s[j], s[i]
	}
}
