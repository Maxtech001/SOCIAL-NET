package main

import (
	"database/sql"
	"log"
	"net/http"

	"01.kood.tech/git/Maxwell/social-network/backend/database"
)

type application struct {
	db *sql.DB
}

func main() {
	var app application

	log.Println("Started go api server at http://localhost:8080/")
	db, err := database.OpenDatabase()
	if err != nil {
		log.Println(err)
		return
	}

	app.db = db
	err = http.ListenAndServe(":8080", app.server())
	if err != nil {
		log.Fatal(err)
	}
}
