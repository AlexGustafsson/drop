package memory

import (
	"fmt"

	"github.com/AlexGustafsson/drop/internal/authentication"
	"github.com/AlexGustafsson/drop/internal/store"
	"github.com/google/uuid"
)

type MemoryStore struct {
	secret   []byte
	archives map[string]*MemoryArchive
}

func New(secret []byte) store.Store {
	return &MemoryStore{
		secret:   secret,
		archives: make(map[string]*MemoryArchive),
	}
}

func (store *MemoryStore) Secret() []byte {
	return store.secret
}

func (store *MemoryStore) CreateArchive(name string, maximumFileCount int, maximumFileSize int, maximumSize int) (store.Archive, error) {
	rawId, err := uuid.NewRandom()
	if err != nil {
		return nil, err
	}
	id := rawId.String()

	archive := &MemoryArchive{
		id:               id,
		name:             name,
		maximumFileCount: maximumFileCount,
		maximumFileSize:  maximumFileSize,
		maximumSize:      maximumSize,
		files:            make(map[string]*MemoryFile),
		tokens:           make(map[string]bool),
	}

	store.archives[id] = archive

	return archive, nil
}

func (store *MemoryStore) CreateToken(archiveId string, lifetime int) (string, error) {
	archive, ok := store.archives[archiveId]
	if !ok {
		return "", fmt.Errorf("Archive not found")
	}

	token, id, err := authentication.CreateToken(store.secret, archive.id, archive.name, lifetime, archive.maximumFileCount, archive.maximumFileSize, archive.maximumSize)
	if err != nil {
		return "", nil
	}

	archive.tokens[id] = true
	return token, nil
}

func (store *MemoryStore) CreateFile(archiveId string, name string, lastModified int, size int, mime string) (store.File, error) {
	archive, ok := store.archives[archiveId]
	if !ok {
		return nil, fmt.Errorf("Archive not found")
	}

	rawId, err := uuid.NewRandom()
	if err != nil {
		return nil, err
	}
	id := rawId.String()

	file := &MemoryFile{
		id:           id,
		name:         name,
		lastModified: lastModified,
		size:         size,
		mime:         mime,
	}

	archive.files[id] = file

	return file, nil
}

func (store *MemoryStore) Archive(archiveId string) (store.Archive, bool, error) {
	archive, ok := store.archives[archiveId]
	return archive, ok, nil
}
