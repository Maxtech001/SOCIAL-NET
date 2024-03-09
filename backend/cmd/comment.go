package main

import (
	"database/sql"
	"encoding/json"
	"io"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"strconv"
	"time"

	"01.kood.tech/git/Maxwell/social-network/backend/models"        
	"github.com/gofrs/uuid"
)

func (app *application) CreateCommentHandler(w http.ResponseWriter, r *http.Request) {
	r.ParseMultipartForm(10 << 20) // 10 MB max memory

	var comment models.Comment
	comment.Img = ""

	file, handler, err := r.FormFile("img")
	if err == nil {
		defer file.Close()

		imgDir := "backend/media/comments"

		imgName := uuid.Must(uuid.NewV4()).String() + filepath.Ext(handler.Filename)

		newFile, err := os.Create(imgDir + "/" + imgName)
		if err != nil {
			log.Println(err)
			return
		}
		defer newFile.Close()

		_, err = io.Copy(newFile, file)
		if err != nil {
			log.Println(err)
			return
		}

		comment.Img = imgName
	}

	userIDStr := r.FormValue("userId")
	userID, err := strconv.Atoi(userIDStr)
	if err != nil {
		log.Printf("Error converting userId to int: %s", err)
		return
	}

	postIDstr := r.FormValue("postId")
	postID, err := strconv.Atoi(postIDstr)
	if err != nil {
		log.Printf("Error converting userId to int: %s", err)
		return
	}

	comment.UserID = userID
	comment.PostID = postID
	comment.Content = r.FormValue("content")
	comment.CreatedAt = time.Now()

	stmt := `INSERT INTO comments (userId, postId, content, img, created) VALUES (?, ?, ?, ?, ?)`
	_, err = app.db.Exec(stmt, comment.UserID, comment.PostID, comment.Content, comment.Img, comment.CreatedAt)

	if err != nil {
		log.Printf("Err: %s", err)
	}

	w.WriteHeader(http.StatusOK)
}

func (app *application) GetCommentsHandler(w http.ResponseWriter, r *http.Request) {
	var comments = []models.Comment{}
	postId := r.URL.Query().Get("postId")

	stmt := `SELECT commentId, postId, userId, content, COALESCE(img, ""), created FROM comments WHERE postId = ? ORDER BY created ASC LIMIT 200`

	rows, err := app.db.Query(stmt, postId)
	if err != nil {
		log.Println(err)
		return
	}
	defer rows.Close()

	for rows.Next() {
		comment := models.Comment{}
		err = rows.Scan(&comment.CommentId, &comment.PostID, &comment.UserID, &comment.Content, &comment.Img, &comment.CreatedAt)
		if err != nil {
			log.Fatalf("Err: %s", err)
		}

		var nickname string
		var firstName string
		var lastName string
		if err := app.db.QueryRow(`SELECT COALESCE(nickname, ""), firstName, lastName, profilePic from users WHERE userId = ?`, comment.UserID).Scan(&nickname, &firstName, &lastName, &comment.ProfilePic); err != nil {
			if err == sql.ErrNoRows {
				log.Println(err)
			}
			log.Fatalf(err.Error())
		}

		if nickname == "" {
			comment.DisplayName = firstName + " " + lastName
		} else {
			comment.DisplayName = nickname
		}

		comments = append(comments, comment)
	}
	jsonResp, err := json.Marshal(comments)
	if err != nil {
		log.Fatalf("Err: %s", err)
	}

	w.Write(jsonResp)
}

func (app *application) GetCommentLikesHandler(w http.ResponseWriter, r *http.Request) {
	var likers = []models.User{}
	currentUserId := r.URL.Query().Get("userId")
	commentId := r.URL.Query().Get("commentId")

	query := `
		SELECT u.userId, u.firstName, u.lastName, u.profilePic, u.public
		FROM users AS u
		INNER JOIN comment_likes AS cl ON u.userId = cl.userId
		WHERE cl.commentId = ? 
	`

	rows, err := app.db.Query(query, commentId)
	if err != nil {
		log.Println(err)
	}

	for rows.Next() {
		var liker models.User
		err := rows.Scan(&liker.UserId, &liker.FirstName, &liker.LastName, &liker.ProfilePic, &liker.Public)
		if err != nil {
			log.Println(err)
		}

		liker.CurrentUserFollowStatus = getCurrentUserFollowStatus(strconv.Itoa(liker.UserId), currentUserId, app.db)

		likers = append(likers, liker)
	}

	jsonData, err := json.Marshal(likers)

	if err != nil {
		log.Println(err)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	w.Write(jsonData)
}
