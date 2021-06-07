package memory

import (
	"github.com/AlexGustafsson/drop/internal/store"
)

type MemoryArchive struct {
	store            string
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
