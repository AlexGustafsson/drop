package sqlite

import (
	"github.com/AlexGustafsson/drop/internal/auth"
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
	created          int64
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

func (archive *SqliteArchive) Created() int64 {
	return archive.created
}

func (archive *SqliteArchive) File(id string) (state.File, bool, error) {
	statement, err := archive.store.db.Prepare(`
		SELECT
		id, name, lastModified, size, mime, nonce, created
		FROM files
		WHERE files.archiveId = ? AND files.id = ?
	`)
	if err != nil {
		return nil, false, err
	}
	defer statement.Close()

	rows, err := statement.Query(archive.id, id)
	if err != nil {
		return nil, false, err
	}
	defer rows.Close()

	if !rows.Next() {
		return nil, false, nil
	}

	var file SqliteFile
	err = rows.Scan(&file.id, &file.name, &file.lastModified, &file.size, &file.mime, &file.nonce, &file.created)
	if err != nil {
		return nil, false, err
	}

	return &file, true, nil
}

func (archive *SqliteArchive) Files() ([]state.File, error) {
	statement, err := archive.store.db.Prepare(`
		SELECT
		id, name, lastModified, size, mime, nonce, created
		FROM files
		WHERE files.archiveId = ?
	`)
	if err != nil {
		return nil, err
	}
	defer statement.Close()

	rows, err := statement.Query(archive.id)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	files := make([]state.File, 0)
	for rows.Next() {
		var file SqliteFile
		err = rows.Scan(&file.id, &file.name, &file.lastModified, &file.size, &file.mime, &file.nonce, &file.created)
		if err != nil {
			return nil, err
		}

		files = append(files, &file)
	}

	return files, nil
}

func (archive *SqliteArchive) Token(id string) (state.ArchiveToken, bool, error) {
	statement, err := archive.store.db.Prepare(`
		SELECT
		id, created
		FROM archive_tokens
		WHERE archive_tokens.archiveId = ? AND archive_tokens.id = ?
	`)
	if err != nil {
		return nil, false, err
	}
	defer statement.Close()

	rows, err := statement.Query(archive.id, id)
	if err != nil {
		return nil, false, err
	}
	defer rows.Close()

	if !rows.Next() {
		return nil, false, nil
	}

	var token SqliteArchiveToken
	err = rows.Scan(&token.id, &token.created)
	if err != nil {
		return nil, false, err
	}

	return &token, true, nil
}

func (archive *SqliteArchive) Tokens() ([]state.ArchiveToken, error) {
	statement, err := archive.store.db.Prepare(`
		SELECT
		id, created
		FROM archive_tokens
		WHERE archive_tokens.archiveId = ?
	`)
	if err != nil {
		return nil, err
	}
	defer statement.Close()

	rows, err := statement.Query(archive.id)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	tokens := make([]state.ArchiveToken, 0)
	for rows.Next() {
		var token SqliteArchiveToken
		err = rows.Scan(&token.id, &token.created)
		if err != nil {
			return nil, err
		}
		tokens = append(tokens, &token)
	}

	return tokens, nil
}

func (archive *SqliteArchive) CreateToken(lifetime int) (state.ArchiveToken, string, error) {
	tokenString, claims, err := auth.CreateArchiveToken(archive.store.secret, archive.id, archive.name, lifetime, archive.maximumFileCount, archive.maximumFileSize, archive.maximumSize)
	if err != nil {
		return nil, "", nil
	}

	statement, err := archive.store.db.Prepare(`
		INSERT INTO archive_tokens
		(id, archiveId, expires, created)
		VALUES
		(?, ?, ?, ?)
	`)
	if err != nil {
		return nil, "", err
	}
	defer statement.Close()

	_, err = statement.Exec(claims.Id, archive.Id(), claims.ExpiresAt, claims.IssuedAt)
	if err != nil {
		return nil, "", err
	}

	token := &SqliteArchiveToken{
		id:      claims.Id,
		expires: claims.ExpiresAt,
		created: claims.IssuedAt,
	}

	return token, tokenString, nil
}

func (archive *SqliteArchive) CreateFile(name string, lastModified int64, size int, mime string, nonce string) (state.File, error) {
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

func (archive *SqliteArchive) DeleteFile(id string) (bool, error) {
	statement, err := archive.store.db.Prepare(`
		DELETE
		FROM files
		WHERE files.id = ?
	`)
	if err != nil {
		return false, err
	}
	defer statement.Close()

	result, err := statement.Exec(id)
	if err != nil {
		return false, err
	}

	rows, err := result.RowsAffected()
	if err != nil {
		return false, err
	}

	return rows > 0, nil
}

func (archive *SqliteArchive) DeleteToken(id string) (bool, error) {
	statement, err := archive.store.db.Prepare(`
		DELETE
		FROM archive_tokens
		WHERE archive_tokens.id = ?
	`)
	if err != nil {
		return false, err
	}
	defer statement.Close()

	result, err := statement.Exec(id)
	if err != nil {
		return false, err
	}

	rows, err := result.RowsAffected()
	if err != nil {
		return false, err
	}

	return rows > 0, nil
}
