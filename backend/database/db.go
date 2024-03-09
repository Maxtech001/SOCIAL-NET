package database

import (
	"database/sql"
	"log"
	"os"

	"github.com/golang-migrate/migrate/v4"
	"github.com/golang-migrate/migrate/v4/database/sqlite3"
	_ "github.com/golang-migrate/migrate/v4/source/file"
	_ "github.com/mattes/migrate/source/file"
	_ "github.com/mattn/go-sqlite3"
)

func OpenDatabase() (*sql.DB, error) {
	db, err := sql.Open("sqlite3", "backend/database/database.db")
	if err != nil {
		return nil, err
	}

	if dbIsEmpty() {
		err = MigrateDB(db)
		if err != nil {
			return nil, err
		}
	}

	return db, nil
}

// checks if the database is empty
func dbIsEmpty() bool {
	dbText, err := os.ReadFile("backend/database/database.db")
	if err != nil {
		log.Println(err)
	}
	return len(dbText) == 0
}

// goes through the generated migrations in the migration folder and applies the up migrations, which create the tables
func MigrateDB(db *sql.DB) error {
	driver, err := sqlite3.WithInstance(db, &sqlite3.Config{})
	if err != nil {
		return err
	}

	m, err := migrate.NewWithDatabaseInstance("file://backend/database/migration", "sqlite3", driver)
	if err != nil {
		return err
	}

	err = m.Up()
	if err != nil && err != migrate.ErrNoChange {
		return err
	}

	return nil
}
