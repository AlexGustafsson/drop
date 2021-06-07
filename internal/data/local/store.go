package local

import (
	"fmt"
	"os"
)

type LocalDataStore struct {
	directory string
}

func New(directory string) *LocalDataStore {
	return &LocalDataStore{
		directory: directory,
	}
}

func (store *LocalDataStore) Prepare() error {
	return os.MkdirAll(store.directory, 0771)
}

func (store *LocalDataStore) Write(archiveId string, fileId string, content []byte) error {
	// TODO: properly resolve path
	directoryPath := fmt.Sprintf("%s/%s", store.directory, archiveId)
	err := os.MkdirAll(directoryPath, 0771)
	if err != nil {
		return err
	}

	filePath := fmt.Sprintf("%s/%s/%s", store.directory, archiveId, fileId)
	file, err := os.OpenFile(filePath, os.O_APPEND|os.O_CREATE|os.O_WRONLY, 0660)
	if err != nil {
		return err
	}
	defer file.Close()

	_, err = file.Write(content)
	if err != nil {
		return err
	}

	return nil
}
