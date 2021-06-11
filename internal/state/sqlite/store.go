package sqlite

import (
	"database/sql"

	"github.com/AlexGustafsson/drop/internal/authentication"
	"github.com/AlexGustafsson/drop/internal/state"
	"github.com/google/uuid"
	_ "github.com/mattn/go-sqlite3"
)

type SqliteStore struct {
	secret []byte
	db     *sql.DB
}

func New(secret []byte) *SqliteStore {
	return &SqliteStore{
		secret: secret,
		db:     nil,
	}
}

func (store *SqliteStore) Connect(connectionString string) error {
	db, err := sql.Open("sqlite3", connectionString)
	if err != nil {
		return err
	}
	store.db = db

	err = store.setup()
	if err != nil {
		return err
	}

	store.db = db
	return nil
}

func (store *SqliteStore) Disconnect() error {
	return store.db.Close()
}

func (store *SqliteStore) Secret() []byte {
	return store.secret
}

func (store *SqliteStore) CreateArchive(name string, maximumFileCount int, maximumFileSize int, maximumSize int) (state.Archive, error) {
	rawId, err := uuid.NewRandom()
	if err != nil {
		return nil, err
	}
	id := rawId.String()

	archive := &SqliteArchive{
		id:               id,
		name:             name,
		maximumFileCount: maximumFileCount,
		maximumFileSize:  maximumFileSize,
		maximumSize:      maximumSize,
	}

	statement, err := store.db.Prepare(`
		INSERT INTO archives
		(id, name, maximumFileCount, maximumFileSize, maximumSize)
		VALUES
		(?, ?, ?, ?, ?)
	`)
	if err != nil {
		return nil, err
	}
	defer statement.Close()

	_, err = statement.Exec(id, name, maximumFileCount, maximumFileSize, maximumSize)
	if err != nil {
		return nil, err
	}

	return archive, nil
}

func (store *SqliteStore) Archive(archiveId string) (state.Archive, bool, error) {
	statement, err := store.db.Prepare(`
		SELECT
		id, name, maximumFileCount, maximumFileSize, maximumSize
		FROM archives
		WHERE archives.id = ?
	`)
	if err != nil {
		return nil, false, err
	}
	defer statement.Close()

	rows, err := statement.Query(archiveId)
	if err != nil {
		return nil, false, err
	}
	defer rows.Close()

	if !rows.Next() {
		return nil, false, nil
	}

	archive := SqliteArchive{
		store: store,
	}
	err = rows.Scan(&archive.id, &archive.name, &archive.maximumFileCount, &archive.maximumFileSize, &archive.maximumSize)
	if err != nil {
		return nil, false, err
	}

	return &archive, true, nil
}

func (store *SqliteStore) Archives() ([]state.Archive, error) {
	statement, err := store.db.Prepare(`
		SELECT
		id, name, maximumFileCount, maximumFileSize, maximumSize
		FROM archives
	`)
	if err != nil {
		return nil, err
	}
	defer statement.Close()

	rows, err := statement.Query()
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	archives := make([]state.Archive, 0)
	for rows.Next() {
		archive := SqliteArchive{
			store: store,
		}
		err = rows.Scan(&archive.id, &archive.name, &archive.maximumFileCount, &archive.maximumFileSize, &archive.maximumSize)
		if err != nil {
			return nil, err
		}
		archives = append(archives, &archive)
	}

	return archives, nil
}

func (store *SqliteStore) CreateAdminToken(lifetime int) (string, error) {
	token, id, err := authentication.CreateAdminToken(store.secret, lifetime)
	if err != nil {
		return "", nil
	}

	statement, err := store.db.Prepare(`
		INSERT INTO admin_tokens
		(id)
		VALUES
		(?)
	`)
	if err != nil {
		return "", err
	}
	defer statement.Close()

	_, err = statement.Exec(id)
	if err != nil {
		return "", err
	}

	return token, nil
}

func (store *SqliteStore) AdminToken(id string) (state.AdminToken, bool, error) {
	statement, err := store.db.Prepare(`
		SELECT
		id, created
		FROM admin_tokens
		WHERE AND admin_tokens.id = ?
	`)
	if err != nil {
		return nil, false, err
	}
	defer statement.Close()

	rows, err := statement.Query(id)
	if err != nil {
		return nil, false, err
	}
	defer rows.Close()

	if !rows.Next() {
		return nil, false, nil
	}

	var token SqliteAdminToken
	err = rows.Scan(&token.id, &token.created)
	if err != nil {
		return nil, false, err
	}

	return &token, true, nil
}

func (store *SqliteStore) AdminTokens() ([]state.AdminToken, error) {
	statement, err := store.db.Prepare(`
		SELECT
		id, created
		FROM admin_tokens
	`)
	if err != nil {
		return nil, err
	}
	defer statement.Close()

	rows, err := statement.Query()
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	tokens := make([]state.AdminToken, 0)
	for rows.Next() {
		var token SqliteAdminToken
		err = rows.Scan(&token.id, &token.created)
		if err != nil {
			return nil, err
		}
		tokens = append(tokens, &token)
	}

	return tokens, nil
}
