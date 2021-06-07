package memory

import (
	"github.com/AlexGustafsson/drop/internal/state"
	"github.com/google/uuid"
)

type MemoryStore struct {
	secret   []byte
	archives map[string]*MemoryArchive
}

func New(secret []byte) *MemoryStore {
	return &MemoryStore{
		secret:   secret,
		archives: make(map[string]*MemoryArchive),
	}
}

func (store *MemoryStore) Secret() []byte {
	return store.secret
}

func (store *MemoryStore) CreateArchive(name string, maximumFileCount int, maximumFileSize int, maximumSize int) (state.Archive, error) {
	rawId, err := uuid.NewRandom()
	if err != nil {
		return nil, err
	}
	id := rawId.String()

	archive := &MemoryArchive{
		store:            store,
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

func (store *MemoryStore) Archive(archiveId string) (state.Archive, bool, error) {
	archive, ok := store.archives[archiveId]
	return archive, ok, nil
}
