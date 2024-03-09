package main

import (
	"database/sql"
	"encoding/json"
	"log"
	"net/http"
)

func (app *application) GetChatDataHandler(w http.ResponseWriter, r *http.Request) {
	var chatData SendChatDataEvent

	err := json.NewDecoder(r.Body).Decode(&chatData)
	if err != nil {
		log.Println(err)
		return
	}

	returnData := getChatData(chatData.CurrentChatterId, chatData.OtherChatterId, chatData.Amount, app.db)

	jsonData, err := json.Marshal(returnData)
	if err != nil {
		log.Println(err)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	w.Write(jsonData)
}

func addMessageToTable(messageData ReturnMessageEvent, db *sql.DB) {
	statement, err := db.Prepare("INSERT INTO user_messages (senderId, receiverId, content) VALUES (?, ?, ?)")
	if err != nil {
		log.Println(err)
		return
	}

	_, err = statement.Exec(messageData.SenderId, messageData.ReceiverId, messageData.Content)
	if err != nil {
		log.Println(err)
		return
	}
}

func getChatData(currentChatterId, otherChatterId, amount int, db *sql.DB) ReturnChatDataEvent {
	var returnChatData ReturnChatDataEvent

	returnChatData.CurrentChatterDisplayname = getDisplaynameById(currentChatterId, db)
	returnChatData.OtherChatterDisplayname = getDisplaynameById(otherChatterId, db)

	rows, err := db.Query(`
		SELECT messageId, senderId, receiverId, content, sent FROM user_messages 
		WHERE (senderId = ? AND receiverId = ?) OR (senderId = ? AND receiverId = ?)
		ORDER BY sent DESC LIMIT ?`, currentChatterId, otherChatterId, otherChatterId, currentChatterId, amount)
	if err != nil {
		log.Println(err)
	}
	defer rows.Close()

	for rows.Next() {
		var messageData ReturnMessageEvent

		rows.Scan(&messageData.MessageId, &messageData.SenderId, &messageData.ReceiverId, &messageData.Content, &messageData.Sent)
		returnChatData.Messages = append(returnChatData.Messages, messageData)
	}
	reverseUserMsgSlice(returnChatData.Messages)

	return returnChatData
}
