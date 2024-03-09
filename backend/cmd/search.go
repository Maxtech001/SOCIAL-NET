package main

import (
	"database/sql"
	"encoding/json"
	"log"
	"net/http"

	"01.kood.tech/git/Maxwell/social-network/backend/models"
)

func (app *application) SearchHandler(w http.ResponseWriter, r *http.Request) {
	searchValue := r.URL.Query().Get("value")
	var searchResponse models.SearchResponse

	searchResponse.Users = getUsers(searchValue, app.db)
	searchResponse.Groups = getGroups(searchValue, app.db)

	jsonData, err := json.Marshal(searchResponse)

	if err != nil {
		log.Println(err)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	w.Write(jsonData)
}

func getUsers(searchValue string, db *sql.DB) []models.User {
	var users = []models.User{}

	query := `
        SELECT userId, firstName, lastName, nickname, profilePic
        FROM users
        WHERE (LOWER(firstName) LIKE LOWER(? || '%')
           OR LOWER(lastName) LIKE LOWER(? || '%')
           OR LOWER(firstName || ' ' || lastName) LIKE LOWER(? || '%'))
           OR LOWER(nickname) LIKE LOWER(? || '%')
    `
	rows, err := db.Query(query, searchValue, searchValue, searchValue, searchValue)

	if err != nil {
		log.Println(err)
	}
	defer rows.Close()

	for rows.Next() {
		var user models.User
		err := rows.Scan(&user.UserId, &user.FirstName, &user.LastName, &user.Nickname, &user.ProfilePic)
		if err != nil {
			log.Println(err)
		}

		users = append(users, user)
	}

	return users
}

func getGroups(searchValue string, db *sql.DB) []models.Group {
	var groups = []models.Group{}

	query := `
        SELECT groupId, title, img
        FROM groups
        WHERE (LOWER(title) LIKE LOWER(? || '%'))
    `
	rows, err := db.Query(query, searchValue)

	if err != nil {
		log.Println(err)
	}
	defer rows.Close()

	for rows.Next() {
		var group models.Group
		err := rows.Scan(&group.GroupID, &group.Title, &group.GroupPic)
		if err != nil {
			log.Println(err)
		}

		groups = append(groups, group)
	}

	return groups
}
