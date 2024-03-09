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
	"strings"
	"time"

	"01.kood.tech/git/Maxwell/social-network/backend/models"
	"github.com/gofrs/uuid"
)

func (app *application) GetPostsHandler(w http.ResponseWriter, r *http.Request) {
	var posts []models.Post
	currentUserId := r.URL.Query().Get("userId")

	stmt := `
        SELECT DISTINCT p.postId, p.userId, p.content, COALESCE(p.img, ""), p.privacy, p.created 
        FROM posts AS p
        LEFT JOIN group_members AS gm ON p.groupId = gm.groupId
        LEFT JOIN followers AS f ON p.userId = f.userId 
        LEFT JOIN exclusive_posts AS s ON p.postId = s.postId
        WHERE (
        (p.userId = ? OR (f.followerId = ? AND f.isRequest = false) OR gm.memberId = ?) 
        ) 
        AND (
        (s.selectedUserId = ? OR (p.userId = ? AND p.privacy = 'Specific') OR s.postId IS NULL)
        OR
        (p.privacy = 'Group' AND gm.memberId IS NOT NULL)
        )
        ORDER BY p.created DESC
    `

	rows, err := app.db.Query(stmt, currentUserId, currentUserId, currentUserId, currentUserId, currentUserId)
	if err != nil {
		log.Fatalf("Err: %s", err)
	}
	defer rows.Close()

	for rows.Next() {
		post := models.Post{}
		var img sql.NullString
		err = rows.Scan(&post.PostID, &post.UserID, &post.Content, &img, &post.Privacy, &post.CreatedAt)
		if err != nil {
			log.Fatalf("Err: %s", err)
		}
		if img.Valid {
			post.Img = img.String
		} else {
			post.Img = ""
		}

		err = app.db.QueryRow("SELECT COUNT(*) FROM comments WHERE postId = ?", post.PostID).Scan(&post.CommentAmount)
		if err != nil {
			log.Println(err)
			return
		}

		var nickname string
		var firstName string
		var lastName string
		if err := app.db.QueryRow(`SELECT COALESCE(nickname, ""), firstName, lastName, profilePic from users WHERE userId = ?`, post.UserID).Scan(&nickname, &firstName, &lastName, &post.ProfilePic); err != nil {
			if err == sql.ErrNoRows {
				log.Println(err)
			}
			log.Fatalf(err.Error())
		}

		if nickname == "" {
			post.DisplayName = firstName + " " + lastName
		} else {
			post.DisplayName = nickname
		}

		posts = append(posts, post)
	}
	jsonResp, err := json.Marshal(posts)
	if err != nil {
		log.Fatalf("Err: %s", err)
	}

	w.Write(jsonResp)
}

func (app *application) GetSinglePostHandler(w http.ResponseWriter, r *http.Request) {
	var post models.Post
	postId := r.URL.Query().Get("postId")

	query := `
			SELECT 
			    p.postId, 
			    p.userId, 
			    p.content, 
			    COALESCE(p.img, "") AS img, 
			    p.privacy, 
			    p.created, 
			    COALESCE(u.nickname, "") AS nickname, 
			    u.firstName, 
			    u.lastName, 
			    u.profilePic,
			    COUNT(c.postId) AS commentCount
			FROM 
			    posts AS p
			LEFT JOIN 
			    comments AS c ON p.postId = c.postId
			LEFT JOIN 
			    users AS u ON p.userId = u.userId
			WHERE
			    p.postId = ?
			GROUP BY 
			    p.postId, 
			    p.userId, 
			    p.content, 
			    p.img, 
			    p.privacy, 
			    p.created,
			    u.nickname, 
			    u.firstName, 
			    u.lastName, 
			    u.profilePic
			ORDER BY 
			    p.created DESC;
    `

	var nickname string
	var firstName string
	var lastName string
	err := app.db.QueryRow(query, postId).Scan(&post.PostID, &post.UserID, &post.Content, &post.Img, &post.Privacy, &post.CreatedAt, &nickname, &firstName, &lastName, &post.ProfilePic, &post.CommentAmount)
	if err != nil {
		log.Println(err)
		return
	}

	if nickname == "" {
		post.DisplayName = firstName + " " + lastName
	} else {
		post.DisplayName = nickname
	}

	jsonResp, err := json.Marshal(post)
	if err != nil {
		log.Fatalf("Err: %s", err)
	}

	w.Write(jsonResp)
}

func (app *application) GetUserPostsHandler(w http.ResponseWriter, r *http.Request) {
	var posts = []models.Post{}
	userId := r.URL.Query().Get("userId")
	currentUserId := r.URL.Query().Get("currentUserId")

	stmt := `
        SELECT DISTINCT p.postId, p.userId, p.content, COALESCE(p.img, ""), p.privacy, p.created 
        FROM posts AS p
        LEFT JOIN followers AS f ON p.userId = f.userId 
        LEFT JOIN exclusive_posts AS s ON p.postId = s.postId
        WHERE p.userId = ? AND (p.privacy = 'Public' OR 
		(p.privacy = 'Private' AND (f.followerId = ? AND f.isRequest = false)) OR 
		(p.privacy = 'Specific' AND s.selectedUserId = ?) OR 
		p.userId = ?)
        ORDER BY p.created DESC
    `

	rows, err := app.db.Query(stmt, userId, currentUserId, currentUserId, currentUserId, currentUserId, currentUserId)
	if err != nil {
		log.Fatalf("Err: %s", err)
	}
	defer rows.Close()

	for rows.Next() {
		post := models.Post{}
		var img sql.NullString
		err = rows.Scan(&post.PostID, &post.UserID, &post.Content, &img, &post.Privacy, &post.CreatedAt)
		if err != nil {
			log.Fatalf("Err: %s", err)
		}
		if img.Valid {
			post.Img = img.String
		} else {
			post.Img = ""
		}

		err = app.db.QueryRow("SELECT COUNT(*) FROM comments WHERE postId = ?", post.PostID).Scan(&post.CommentAmount)
		if err != nil {
			log.Println(err)
			return
		}

		var nickname string
		var firstName string
		var lastName string
		if err := app.db.QueryRow(`SELECT COALESCE(nickname, ""), firstName, lastName, profilePic from users WHERE userId = ?`, post.UserID).Scan(&nickname, &firstName, &lastName, &post.ProfilePic); err != nil {
			if err == sql.ErrNoRows {
				log.Println(err)
			}
			log.Fatalf(err.Error())
		}

		if nickname == "" {
			post.DisplayName = firstName + " " + lastName
		} else {
			post.DisplayName = nickname
		}

		posts = append(posts, post)
	}
	jsonResp, err := json.Marshal(posts)
	if err != nil {
		log.Fatalf("Err: %s", err)
	}

	w.Write(jsonResp)
}

func (app *application) CreatePostHandler(w http.ResponseWriter, r *http.Request) {
	r.ParseMultipartForm(10 << 20) // 10 MB max memory

	var post models.Post
	var postId int64

	post.Img = ""

	file, handler, err := r.FormFile("img")
	if err == nil {
		defer file.Close()

		imgDir := "backend/media/posts"

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

		post.Img = imgName
	}

	userIDStr := r.FormValue("userId")
	userID, err := strconv.Atoi(userIDStr)
	post.UserID = userID
	if err != nil {
		log.Println(err)
		return
	}

	groupIDStr := r.FormValue("groupId")
	if groupIDStr != "" {
		groupID, err := strconv.Atoi(groupIDStr)
		post.GroupID = groupID
		if err != nil {
			log.Println(err)
			return
		}
	}

	post.Content = r.FormValue("content")
	post.Privacy = r.FormValue("privacy")
	input := r.FormValue("selectedFollowers")

	post.CreatedAt = time.Now()

	stmt := `INSERT INTO posts (userId, content, img, groupId, privacy, created) VALUES (?, ?, ?, ?, ?, ?)`
	id, err := app.db.Exec(stmt, post.UserID, post.Content, post.Img, post.GroupID, post.Privacy, post.CreatedAt)
	if err != nil {
		log.Println(err)
	}

	postId, err = id.LastInsertId()

	if input != "" {
		// Remove brackets and spaces
		input = strings.ReplaceAll(input, "[", "")
		input = strings.ReplaceAll(input, "]", "")
		input = strings.ReplaceAll(input, " ", "")

		// Split the string into individual values
		values := strings.Split(input, ",")

		// Convert string values to integers
		var arrayFollowersId []int
		for _, value := range values {
			if value != "" {
				num, err := strconv.Atoi(value)
				if err != nil {
					log.Println(err)
					return
				}
				arrayFollowersId = append(arrayFollowersId, num)
			}
		}

		for _, selectedUserId := range arrayFollowersId {
			stmt := `INSERT INTO exclusive_posts (postId, selectedUserId) VALUES (?, ?)`
			_, err = app.db.Exec(stmt, postId, selectedUserId)

			if err != nil {
				log.Println(err)
			}
		}
		if err != nil {
			log.Println(err)
		}

	}

	var nickname string
	var firstName string
	var lastName string
	if err := app.db.QueryRow(`SELECT COALESCE(nickname, ""), firstName, lastName, profilePic from users WHERE userId = ?`, post.UserID).Scan(&nickname, &firstName, &lastName, &post.ProfilePic); err != nil {
		if err == sql.ErrNoRows {
			log.Println(err)
		}
		log.Fatalf(err.Error())
	}

	if nickname == "" {
		post.DisplayName = firstName + " " + lastName
	} else {
		post.DisplayName = nickname
	}

	jsonResponse, err := json.Marshal(post)
	if err != nil {
		http.Error(w, "Error creating JSON response", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	_, _ = w.Write(jsonResponse)
}

func (app *application) LikeHandler(w http.ResponseWriter, r *http.Request) {
	var likeInfo models.Like

	err := json.NewDecoder(r.Body).Decode(&likeInfo)
	if err != nil {
		log.Println(err)
		return
	}

	// checks if the request sent was for a comment or post
	if likeInfo.CommentId == 0 {
		addPostOrCommentLike("post", likeInfo.PostId, likeInfo.UserId, app.db)
	} else {
		addPostOrCommentLike("comment", likeInfo.CommentId, likeInfo.UserId, app.db)
	}

	w.WriteHeader(http.StatusOK)
}

func addPostOrCommentLike(targetName string, targetId, userId int, db *sql.DB) {
	result, err := db.Exec("DELETE FROM "+targetName+"_likes WHERE "+targetName+"Id = ? AND userId = ?", targetId, userId)
	if err != nil {
		log.Println(err)
		return
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		log.Println(err)
		return
	}

	if rowsAffected == 0 {
		db.Exec("INSERT INTO "+targetName+"_likes ("+targetName+"Id, userId) VALUES (?, ?)", targetId, userId)
	}
}

func (app *application) GetPostLikesHandler(w http.ResponseWriter, r *http.Request) {
	var likers = []models.User{}
	currentUserId := r.URL.Query().Get("userId")
	postId := r.URL.Query().Get("postId")

	query := `
		SELECT u.userId, u.firstName, u.lastName, u.profilePic, u.public
		FROM users AS u
		INNER JOIN post_likes AS pl ON u.userId = pl.userId
		WHERE pl.postId = ? 
	`

	rows, err := app.db.Query(query, postId)
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

func (app *application) GetGroupPostsHandler(w http.ResponseWriter, r *http.Request) {
	var posts []models.Post
	groupId := r.URL.Query().Get("groupId")

	stmt := `
        SELECT postId, userId, content, COALESCE(img, ""), privacy, created 
        FROM posts 
        WHERE groupId=?
        ORDER BY created DESC
    `

	rows, err := app.db.Query(stmt, groupId)
	if err != nil {
		log.Fatalf("Err: %s", err)
	}
	defer rows.Close()

	for rows.Next() {
		post := models.Post{}
		var img sql.NullString
		err = rows.Scan(&post.PostID, &post.UserID, &post.Content, &img, &post.Privacy, &post.CreatedAt)
		if err != nil {
			log.Fatalf("Err: %s", err)
		}
		if img.Valid {
			post.Img = img.String
		} else {
			post.Img = ""
		}

		err = app.db.QueryRow("SELECT COUNT(*) FROM comments WHERE postId = ?", post.PostID).Scan(&post.CommentAmount)
		if err != nil {
			log.Println(err)
			return
		}

		var nickname string
		var firstName string
		var lastName string
		if err := app.db.QueryRow(`SELECT COALESCE(nickname, ""), firstName, lastName, profilePic from users WHERE userId = ?`, post.UserID).Scan(&nickname, &firstName, &lastName, &post.ProfilePic); err != nil {
			if err == sql.ErrNoRows {
				log.Println(err)
			}
			log.Fatalf(err.Error())
		}

		if nickname == "" {
			post.DisplayName = firstName + " " + lastName
		} else {
			post.DisplayName = nickname
		}

		posts = append(posts, post)
	}
	jsonResp, err := json.Marshal(posts)
	if err != nil {
		log.Fatalf("Err: %s", err)
	}

	w.Write(jsonResp)
}
