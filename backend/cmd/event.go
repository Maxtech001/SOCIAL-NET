package main

import (
	"database/sql"
	"encoding/json"
	"log"
	"net/http"
	"strconv"

	"https://01.kood.tech/git/Maxwell/social-network/backend/models"
)

func (app *application) CreateEventHandler(w http.ResponseWriter, r *http.Request) {
	var event models.Event
	err := json.NewDecoder(r.Body).Decode(&event)
	if err != nil {
		log.Println(err)
		return
	}

	statement, err := app.db.Prepare("INSERT INTO events (groupId, userId, title, description, startDate, endDate) VALUES (?, ?, ?, ?, ?, ?)")
	if err != nil {
		log.Println(err, "4")
		return
	}

	_, err = statement.Exec(event.GroupId, event.UserId, event.Title, event.Description, event.StartDate, event.EndDate)
	if err != nil {
		log.Println(err, "5")
		return
	}
	w.WriteHeader(http.StatusOK)
	w.Write([]byte("Event successfully created"))
}

func (app *application) GetEventsHandler(w http.ResponseWriter, r *http.Request) {
	groupId := r.URL.Query().Get("groupId")
	currentUserId := r.URL.Query().Get("currentUserId")
	var events = []models.Event{}

	query := `
		SELECT e.eventId, e.groupId, e.userId, e.title, e.description, e.startDate, e.endDate,
			u.userId, u.firstName, u.lastName, u.profilePic
		FROM events AS e
		JOIN users AS u ON e.userId = u.userId
		WHERE groupId = ?
	`

	rows, err := app.db.Query(query, groupId)
	if err != nil {
		log.Println(err)
	}

	for rows.Next() {
		var event models.Event
		err := rows.Scan(&event.EventId, &event.GroupId, &event.UserId, &event.Title, &event.Description, &event.StartDate, &event.EndDate, &event.Creator.UserId, &event.Creator.FirstName, &event.Creator.LastName, &event.Creator.ProfilePic)
		if err != nil {
			log.Println(err)
		}

		event.EventUsers = getEventUsers(event.EventId, currentUserId, app.db)

		events = append(events, event)
	}

	jsonResp, err := json.Marshal(events)
	if err != nil {
		log.Fatalf("Err: %s", err)
	}

	w.Write(jsonResp)
}

func getEventUsers(eventId int, currentUserId string, db *sql.DB) []models.EventUser {
	var eventUsers = []models.EventUser{}

	query := `
		SELECT u.userId, u.firstName, u.lastName, u.profilePic, u.public, ea.status
		FROM users AS u
		INNER JOIN events_attendance AS ea ON u.userId = ea.userId
		WHERE ea.eventId = ?
	`

	rows, err := db.Query(query, eventId)
	if err != nil {
		log.Println(err)
	}

	for rows.Next() {
		var eventUser models.EventUser
		var statusStr string
		err := rows.Scan(&eventUser.UserId, &eventUser.FirstName, &eventUser.LastName, &eventUser.ProfilePic, &eventUser.Public, &statusStr)
		if err != nil {
			log.Println(err)
		}

		if statusStr == "Going" {
			eventUser.Going = true
		} else {
			eventUser.Going = false
		}

		eventUser.CurrentUserFollowStatus = getCurrentUserFollowStatus(strconv.Itoa(eventUser.UserId), currentUserId, db)

		eventUsers = append(eventUsers, eventUser)
	}

	return eventUsers
}

func (app *application) UpdateAttendanceHandler(w http.ResponseWriter, r *http.Request) {
	var attendance models.Attendance
	err := json.NewDecoder(r.Body).Decode(&attendance)
	if err != nil {
		log.Println(err)
		return
	}

	var count int
	err = app.db.QueryRow("SELECT COUNT(*) FROM events_attendance WHERE eventId = ? AND userId = ?", attendance.EventId, attendance.UserId).Scan(&count)
	if err != nil {
		log.Println(err)
	}

	if count == 0 {
		_, err := app.db.Exec("INSERT INTO events_attendance (eventId, userId, status) VALUES (?, ?, ?)", attendance.EventId, attendance.UserId, attendance.Status)
		if err != nil {
			log.Println(err)
		}
	} else {
		_, err := app.db.Exec("UPDATE events_attendance SET status = ? WHERE eventId = ? AND userId = ?", attendance.Status, attendance.EventId, attendance.UserId)
		if err != nil {
			log.Println(err)
		}
	}

	w.WriteHeader(http.StatusOK)
}
