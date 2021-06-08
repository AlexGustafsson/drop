package sqlite

import (
	"github.com/AlexGustafsson/drop/internal/authentication"
	"github.com/AlexGustafsson/drop/internal/state"
	"github.com/google/uuid"
)

type SqliteArchive struct {
	store            *SqliteStore
	id               string
	name             string
	maximumFileCount int
	maximumFileSize  int
	maximumSize      int
}

func (archive *SqliteArchive) Id() string {
	return archive.id
}

func (archive *SqliteArchive) Name() string {
	return archive.name
}

func (archive *SqliteArchive) MaximumFileCount() int {
	return archive.maximumFileCount
}

func (archive *SqliteArchive) MaximumFileSize() int {
	return archive.maximumFileSize
}

func (archive *SqliteArchive) MaximumSize() int {
	return archive.maximumSize
}

func (archive *SqliteArchive) File(id string) (state.File, bool, error) {
	statement, err := archive.store.db.Prepare(`
		SELECT
		id, name, lastModified, size, mime
		FROM files
		WHERE files.archiveId = ? AND files.id = ?
	`)
	if err != nil {
		return nil, false, nil
	}
	defer statement.Close()

	rows, err := statement.Query(archive.id, id)
	if err != nil {
		return nil, false, nil
	}
	defer rows.Close()

	if !rows.Next() {
		return nil, false, nil
	}

	var file SqliteFile
	err = rows.Scan(&file.id, &file.name, &file.lastModified, &file.size, &file.mime)
	if err != nil {
		return nil, false, nil
	}

	return &file, true, nil
}

func (archive *SqliteArchive) HasToken(id string) (bool, error) {
	statement, err := archive.store.db.Prepare(`
		SELECT EXISTS(SELECT 1 FROM tokens WHERE tokens.id = ?)
	`)
	if err != nil {
		return false, err
	}
	defer statement.Close()

	rows, err := statement.Query(id)
	if err != nil {
		return false, err
	}
	defer rows.Close()

	if !rows.Next() {
		return false, nil
	}

	var exists bool
	err = rows.Scan(&exists)
	if err != nil {
		return false, err
	}

	return exists, nil
}

func (archive *SqliteArchive) CreateToken(lifetime int) (string, error) {
	token, id, err := authentication.CreateToken(archive.store.secret, archive.id, archive.name, lifetime, archive.maximumFileCount, archive.maximumFileSize, archive.maximumSize)
	if err != nil {
		return "", nil
	}

	statement, err := archive.store.db.Prepare(`
		INSERT INTO tokens
		(id, archiveId)
		VALUES
		(?, ?)
	`)
	if err != nil {
		return "", err
	}
	defer statement.Close()

	_, err = statement.Exec(id, archive.Id())
	if err != nil {
		return "", err
	}

	return token, nil
}

func (archive *SqliteArchive) CreateFile(name string, lastModified int, size int, mime string, nonce string) (state.File, error) {
	rawId, err := uuid.NewRandom()
	if err != nil {
		return nil, err
	}
	id := rawId.String()

	statement, err := archive.store.db.Prepare(`
		INSERT INTO files
		(id, archiveId, name, lastModified, size, mime, nonce)
		VALUES
		(?, ?, ?, ?, ?, ?, ?)
	`)
	if err != nil {
		return nil, err
	}
	defer statement.Close()

	_, err = statement.Exec(id, archive.id, name, lastModified, size, mime, nonce)
	if err != nil {
		return nil, err
	}

	file, _, err := archive.File(id)
	return file, err
}
