package main

import (
	"io"
	"log"
	"net/http"
	"os"
	"path/filepath"

	"github.com/gofrs/uuid"
	"golang.org/x/crypto/bcrypt"
)

func (app *application) RegisterHandler(w http.ResponseWriter, r *http.Request) {
	r.ParseMultipartForm(10 << 20) // 10 MB max memory

	imgName := "defaultProfilePic.png"

	var emailExists bool
	err := app.db.QueryRow("SELECT EXISTS (SELECT 1 FROM users WHERE lower(email) = lower(?))", r.FormValue("email")).Scan(&emailExists)
	if err != nil {
		log.Println(err, "2")
		return
	}

	if emailExists {
		w.WriteHeader(http.StatusBadRequest)
		w.Write([]byte("Registration unsuccessful: email already in use"))
		return
	}

	hashedPw, err := hashPassword(r.FormValue("password"))
	if err != nil {
		log.Println(err, "3")
		return
	}

	file, handler, err := r.FormFile("img")
	if err == nil {
		defer file.Close()

		imgDir := "backend/media/users"

		imgName = uuid.Must(uuid.NewV4()).String() + filepath.Ext(handler.Filename)

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
	}

	statement, err := app.db.Prepare("INSERT INTO users (firstName, lastName, email, nickname, dateOfBirth, password, profilePic, aboutMe) VALUES (?, ?, ?, ?, ?, ?, ?, ?)")
	if err != nil {
		log.Println(err, "4")
		return
	}

	_, err = statement.Exec(r.FormValue("firstName"), r.FormValue("lastName"), r.FormValue("email"), r.FormValue("nickname"),
		r.FormValue("dateOfBirth"), hashedPw, imgName, r.FormValue("aboutMe"))
	if err != nil {
		log.Println(err, "5")
		return
	}

	w.WriteHeader(http.StatusOK)
	w.Write([]byte("Registration successful"))
}

func hashPassword(password string) (string, error) {
	hash, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return "", err
	}
	return string(hash), nil
}
