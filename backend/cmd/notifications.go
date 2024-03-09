package main

import (
	"database/sql"
	"encoding/json"
	"log"
	"net/http"
	"time"

	"01.kood.tech/git/Maxwell/social-network/backend/models"
)

func (app *application) AddNotificationHandler(w http.ResponseWriter, r *http.Request) {
	var incomingNotification models.Notification

	err := json.NewDecoder(r.Body).Decode(&incomingNotification)
	if err != nil {
		log.Println(err, "1")
		return
	}

	_, err = app.db.Exec("INSERT INTO notifications (sourceId, receiverId, type, created) VALUES (?, ?, ?, ?)", incomingNotification.SourceId, incomingNotification.ReceiverId, incomingNotification.NotificationType, time.Now())
	if err != nil {
		log.Println(err)
		return
	}

	w.WriteHeader(http.StatusOK)
}

func getNotifications(userId string, db *sql.DB) []models.Notification {
	var userNotifications = []models.Notification{}

	query := "SELECT notificationId, sourceId, type, seen, clickedOn, created FROM notifications WHERE receiverId = ? ORDER BY created DESC"
	rows, err := db.Query(query, userId)
	if err != nil {
		log.Fatalf("Err: %s", err)
	}
	defer rows.Close()

	for rows.Next() {
		var notification models.Notification
		err := rows.Scan(&notification.NotificationId, &notification.SourceId, &notification.NotificationType, &notification.Seen, &notification.ClickedOn, &notification.Created)
		if err != nil {
			log.Println(err)
		}

		userNotifications = append(userNotifications, notification)
	}

	return userNotifications
}

func (app *application) SetAllNotificationsToSeenHandler(w http.ResponseWriter, r *http.Request) {
	currentUserId := r.URL.Query().Get("userId")

	statement, err := app.db.Prepare("UPDATE notifications SET seen = true WHERE receiverId = ?")
	if err != nil {
		log.Println(err)
		return
	}

	_, err = statement.Exec(currentUserId)
	if err != nil {
		log.Println(err)
		return
	}

	w.WriteHeader(http.StatusOK)
}

func (app *application) UpdateNOtificationStatusHandler(w http.ResponseWriter, r *http.Request) {
	notificationId := r.URL.Query().Get("notificationId")

	statement, err := app.db.Prepare("UPDATE notifications SET clickedOn = true WHERE notificationId = ?")
	if err != nil {
		log.Println(err)
		return
	}

	_, err = statement.Exec(notificationId)
	if err != nil {
		log.Println(err)
		return
	}

	w.WriteHeader(http.StatusOK)
}
