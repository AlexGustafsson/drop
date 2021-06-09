package data

import "io"

// Store represents a central data store
type Store interface {
	// Write writes a set of bytes
	Write(archiveId string, fileId string, content []byte, offset uint64) error
	// Exists checks whether or not a file exists
	Exists(archiveId string, fileId string) (bool, error)
	// Touch creates an empty file
	Touch(archiveId string, fileId string, size uint64) error
	// Reader returns a reader for the file
	Reader(archiveId string, fileId string) (io.Reader, error)
}
