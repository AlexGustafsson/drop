package data

// Store represents a central data store
type DataStore interface {
	// Write writes a set of bytes
	Write(archiveId string, fileId string, content []byte) error
}
