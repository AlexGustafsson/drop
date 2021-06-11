package sqlite

import (
	"fmt"

	log "github.com/sirupsen/logrus"
)

func (store *SqliteStore) setup() error {
	log.Debug("Setting up database")

	log.Debug("Creating archives table if it does not already exist")
	_, err := store.db.Exec(`
		CREATE TABLE IF NOT EXISTS archives (
			id string PRIMARY KEY,
			name string NOT NULL,
			maximumFileCount integer NOT NULL,
			maximumFileSize integer NOT NULL,
			maximumSize integer NOT NULL,
			created integer NOT NULL
		)
	`)
	if err != nil {
		log.Error("Failed to create archives table: ", err.Error())
		return fmt.Errorf("Table creation failed")
	}

	log.Debug("Creating files table if it does not already exist")
	_, err = store.db.Exec(`
		CREATE TABLE IF NOT EXISTS files (
			id string PRIMARY KEY,
			archiveId string NOT NULL,
			name string NOT NULL,
			lastModified integer NOT NULL,
			size integer NOT NULL,
			mime string NOT NULL,
			nonce string NOT NULL,
			created integer NOT NULL,
			FOREIGN KEY (archiveId) REFERENCES archives (id)
		)
	`)
	if err != nil {
		log.Error("Failed to create files table: ", err.Error())
		return fmt.Errorf("Table creation failed")
	}

	log.Debug("Creating archive tokens table if it does not already exist")
	_, err = store.db.Exec(`
		CREATE TABLE IF NOT EXISTS archive_tokens (
			id string PRIMARY KEY,
			archiveId string NOT NULL,
			created integer NOT NULL,
			FOREIGN KEY (archiveId) REFERENCES archives (id)
		)
	`)
	if err != nil {
		log.Error("Failed to create archive tokens table: ", err.Error())
		return fmt.Errorf("Table creation failed")
	}

	log.Debug("Creating admin tokens table if it does not already exist")
	_, err = store.db.Exec(`
		CREATE TABLE IF NOT EXISTS admin_tokens (
			id string PRIMARY KEY,
			created integer NOT NULL
		)
	`)
	if err != nil {
		log.Error("Failed to create admin tokens table: ", err.Error())
		return fmt.Errorf("Table creation failed")
	}

	return nil
}
