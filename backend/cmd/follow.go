package main

import (
	"encoding/json"
	"log"
	"net/http"

	"https://01.kood.tech/git/Maxwell/social-network/backend/models"
)

func (app *application) CreateFollowHandler(w http.ResponseWriter, r *http.Request) {
	var followReq models.FollowRequest

	err := json.NewDecoder(r.Body).Decode(&followReq)
	if err != nil {
		log.Println(err)
		return
	}

	if followReq.FollowType == "Follow" || followReq.FollowType == "RequestFollow" {
		var isRequest = false
		if followReq.FollowType == "RequestFollow" {
			isRequest = true
		}

		statement, err := app.db.Prepare("INSERT INTO followers (userId, followerId, isRequest) VALUES (?, ?, ?)")
		if err != nil {
			log.Println(err, "4")
			return
		}

		_, err = statement.Exec(followReq.UserId, followReq.FollowerId, isRequest)
		if err != nil {
			log.Println(err, "5")
			return
		}
	} else {
		app.db.Exec("DELETE FROM followers WHERE userId = ? AND followerId = ?", followReq.UserId, followReq.FollowerId)
	}
	w.WriteHeader(http.StatusOK)
	w.Write([]byte("Follow status successfully changed"))
}

func (app *application) GetFollowRequestsHandler(w http.ResponseWriter, r *http.Request) {
	userId := r.URL.Query().Get("userId")

	var followRequests = []models.User{}

	query := `
		SELECT u.userId, u.firstName, u.lastName, u.nickname, u.profilePic
		FROM users AS u
		INNER JOIN followers AS f ON u.userId = f.followerId
		WHERE f.userId = ? AND f.isRequest = true
	`

	rows, err := app.db.Query(query, userId)
	if err != nil {
		log.Println(err)
	}

	for rows.Next() {
		var requester models.User
		err := rows.Scan(&requester.UserId, &requester.FirstName, &requester.LastName, &requester.Nickname, &requester.ProfilePic)
		if err != nil {
			log.Println(err)
		}

		followRequests = append(followRequests, requester)
	}

	jsonResp, err := json.Marshal(followRequests)
	if err != nil {
		log.Fatalf("Err: %s", err)
	}

	w.Write(jsonResp)
}

func (app *application) FollowRequestHandler(w http.ResponseWriter, r *http.Request) {
	var followRequestResp models.FollowRequestResponse

	err := json.NewDecoder(r.Body).Decode(&followRequestResp)
	if err != nil {
		log.Println(err)
		return
	}

	if followRequestResp.Accepted {
		statement, err := app.db.Prepare("UPDATE followers SET isRequest = false WHERE userId = ? AND followerId = ?")
		if err != nil {
			log.Println(err, "4")
			return
		}

		_, err = statement.Exec(followRequestResp.UserId, followRequestResp.FollowerId)
		if err != nil {
			log.Println(err, "5")
			return
		}
	} else {
		app.db.Exec("DELETE FROM followers WHERE userId = ? AND followerId = ?", followRequestResp.UserId, followRequestResp.FollowerId)
	}

	w.WriteHeader(http.StatusOK)
	w.Write([]byte("Follow request successfully handled"))
}
