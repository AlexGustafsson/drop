package memory

import (
	"github.com/AlexGustafsson/drop/internal/authentication"
	"github.com/AlexGustafsson/drop/internal/store"
	"github.com/google/uuid"
)

type MemoryArchive struct {
	store            *MemoryStore
	id               string
	name             string
	maximumFileCount int
	maximumFileSize  int
	maximumSize      int
	files            map[string]*MemoryFile
	tokens           map[string]bool
}

func (archive *MemoryArchive) Id() string {
	return archive.id
}

func (archive *MemoryArchive) Name() string {
	return archive.name
}

func (archive *MemoryArchive) MaximumFileCount() int {
	return archive.maximumFileCount
}

func (archive *MemoryArchive) MaximumFileSize() int {
	return archive.maximumFileSize
}

func (archive *MemoryArchive) MaximumSize() int {
	return archive.maximumSize
}

func (archive *MemoryArchive) File(id string) (store.File, bool, error) {
	file, ok := archive.files[id]
	return file, ok, nil
}

func (archive *MemoryArchive) HasToken(id string) (bool, error) {
	_, ok := archive.tokens[id]
	return ok, nil
}

func (archive *MemoryArchive) CreateToken(lifetime int) (string, error) {
	token, id, err := authentication.CreateToken(archive.store.secret, archive.id, archive.name, lifetime, archive.maximumFileCount, archive.maximumFileSize, archive.maximumSize)
	if err != nil {
		return "", nil
	}

	archive.tokens[id] = true
	return token, nil
}

func (archive *MemoryArchive) CreateFile(name string, lastModified int, size int, mime string) (store.File, error) {
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
