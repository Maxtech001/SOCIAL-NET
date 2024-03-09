package main

import (
	"database/sql"
	"encoding/json"
	"log"
	"net/http"
	"strconv"

	"01.kood.tech/git/Maxwell/social-network/backend/models"
)

func (app *application) GetUserInfoHandler(w http.ResponseWriter, r *http.Request) {
	userId := r.URL.Query().Get("userId")
	currentUserId := r.URL.Query().Get("currentUserId")
	jsonData, err := json.Marshal(getUserInfo(userId, currentUserId, app.db))

	if err != nil {
		log.Println(err)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	w.Write(jsonData)
}

func getUserInfo(userId, currentUserId string, db *sql.DB) models.User {
	var user models.User
	row := db.QueryRow("SELECT firstName, lastName, email, nickname, dateOfBirth, profilePic, aboutMe, public, online FROM users WHERE userId = ?", userId)
	err := row.Scan(&user.FirstName, &user.LastName, &user.Email, &user.Nickname, &user.DateOfBirth, &user.ProfilePic, &user.AboutMe, &user.Public, &user.Online)
	if err != nil {
		log.Println(err)
	}

	user.CurrentUserFollowStatus = getCurrentUserFollowStatus(userId, currentUserId, db)
	user.RequestsToFollowCurrentUser = hasViewedUserRequestedToFollow(userId, currentUserId, db)
	user.Followers = getUserFollowers(userId, currentUserId, db)
	user.Following = getUserFollowing(userId, currentUserId, db)

	return user
}

func getCurrentUserFollowStatus(userId, currentUserId string, db *sql.DB) string {
	var isRequest bool
	// checks if current user is following viewed user
	err := db.QueryRow("SELECT isRequest FROM followers WHERE userId = ? AND followerId = ?", userId, currentUserId).Scan(&isRequest)
	if err != nil {
		if err == sql.ErrNoRows {
			return "Follow"
		} else {
			log.Println(err)
		}
	} else {
		if isRequest {
			return "Requested"
		}
	}

	return "Following"
}

func getViewedUserFollowStatus(userId, currentUserId string, db *sql.DB) bool {
	var isRequest bool
	// checks if viewed user is following current user
	err := db.QueryRow("SELECT isRequest FROM followers WHERE userId = ? AND followerId = ?", currentUserId, userId).Scan(&isRequest)
	if err != nil {
		if err == sql.ErrNoRows {
			return false
		} else {
			log.Println(err)
		}
	} else {
		if isRequest {
			return false
		}
	}

	return true
}

func hasViewedUserRequestedToFollow(userId, currentUserId string, db *sql.DB) bool {
	var isRequest bool
	// checks if viewed user is following current user
	err := db.QueryRow("SELECT isRequest FROM followers WHERE userId = ? AND followerId = ?", currentUserId, userId).Scan(&isRequest)
	if err != nil {
		if err == sql.ErrNoRows {
			return false
		} else {
			log.Println(err)
		}
	} else {
		if isRequest {
			return true
		}
	}

	return false
}

func getUserFollowers(userId, currentUserId string, db *sql.DB) []models.User {
	var followers = []models.User{}

	query := `
		SELECT u.userId, u.firstName, u.lastName, u.profilePic, u.public
		FROM users AS u
		INNER JOIN followers AS f ON u.userId = f.followerId
		WHERE f.userId = ? AND f.isRequest = false
	`

	rows, err := db.Query(query, userId)
	if err != nil {
		log.Println(err)
	}

	for rows.Next() {
		var follower models.User
		err := rows.Scan(&follower.UserId, &follower.FirstName, &follower.LastName, &follower.ProfilePic, &follower.Public)
		if err != nil {
			log.Println(err)
		}

		follower.CurrentUserFollowStatus = getCurrentUserFollowStatus(strconv.Itoa(follower.UserId), currentUserId, db)

		followers = append(followers, follower)
	}

	return followers
}

func getUserFollowing(userId, currentUserId string, db *sql.DB) []models.User {
	var following = []models.User{}

	query := `
		SELECT u.userId, u.firstName, u.lastName, u.profilePic, u.public
		FROM users AS u
		INNER JOIN followers AS f ON u.userId = f.userId
		WHERE f.followerId = ? AND f.isRequest = false
	`

	rows, err := db.Query(query, userId)
	if err != nil {
		log.Println(err)
	}

	for rows.Next() {
		var followingUser models.User
		err := rows.Scan(&followingUser.UserId, &followingUser.FirstName, &followingUser.LastName, &followingUser.ProfilePic, &followingUser.Public)
		if err != nil {
			log.Println(err)
		}

		followingUser.CurrentUserFollowStatus = getCurrentUserFollowStatus(strconv.Itoa(followingUser.UserId), currentUserId, db)

		following = append(following, followingUser)
	}

	return following
}

func getChattableUsers(currentUserId string, db *sql.DB) []models.User {
	var chattableUsers = []models.User{}

	query := `
		SELECT DISTINCT u.userId, u.firstName, u.lastName, u.nickname, u.profilePic, u.public
		FROM users AS u
		INNER JOIN followers AS f ON u.userId = f.userId
		WHERE ((f.followerId = ? AND f.isRequest = false) OR (f.userId = ? AND f.isRequest = false)) AND u.userId != ?
	`

	rows, err := db.Query(query, currentUserId, currentUserId, currentUserId, currentUserId)
	if err != nil {
		log.Println(err)
	}

	for rows.Next() {
		var chattableUser models.User
		err := rows.Scan(&chattableUser.UserId, &chattableUser.FirstName, &chattableUser.LastName, &chattableUser.Nickname, &chattableUser.ProfilePic, &chattableUser.Public)
		if err != nil {
			log.Println(err)
		}

		if chattableUser.Public || getViewedUserFollowStatus(strconv.Itoa(chattableUser.UserId), currentUserId, db) {
			chattableUsers = append(chattableUsers, chattableUser)
		}
	}

	return chattableUsers
}

func (app *application) FollowersHandler(w http.ResponseWriter, r *http.Request) {
	userId := r.URL.Query().Get("userId")
	var followers = []models.User{}

	query := `
		SELECT u.userId, u.firstName, u.lastName, u.profilePic, u.public
		FROM users AS u
		INNER JOIN followers AS f ON u.userId = f.followerId
		WHERE f.userId = ? AND f.isRequest = false
	`

	rows, err := app.db.Query(query, userId)
	if err != nil {
		log.Println(err)
	}

	for rows.Next() {
		var follower models.User
		err := rows.Scan(&follower.UserId, &follower.FirstName, &follower.LastName, &follower.ProfilePic, &follower.Public)
		if err != nil {
			log.Println(err)
		}

		followers = append(followers, follower)
	}

	jsonResp, err := json.Marshal(followers)
	if err != nil {
		log.Fatalf("Err: %s", err)
	}

	w.Write(jsonResp)
}

func (app *application) PrivacyHandler(w http.ResponseWriter, r *http.Request) {
	userId := r.URL.Query().Get("userId")
	privacyStr := r.URL.Query().Get("privacy")
	isPublic := true

	if privacyStr == "Private" {
		isPublic = false
	}

	statement, err := app.db.Prepare("UPDATE users SET public = ? WHERE userId = ?")
	if err != nil {
		log.Println(err)
		return
	}

	if isPublic {
		_, err = app.db.Exec("UPDATE followers SET isRequest = false WHERE userId = ?", userId)
		if err != nil {
			log.Println(err)
			return
		}
	}

	_, err = statement.Exec(isPublic, userId)
	if err != nil {
		log.Println(err)
		return
	}

	w.WriteHeader(http.StatusOK)
}
