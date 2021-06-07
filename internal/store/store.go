package store

// File is a
type File interface {
	Id() string
	Name() string
	LastModified() int
	Size() int
	Mime() string
}

// Archive is an archive of files
type Archive interface {
	Id() string
	Name() string
	MaximumFileCount() int
	MaximumFileSize() int
	MaximumSize() int
	File(id string) (File, bool, error)
	HasToken(id string) (bool, error)
}

// Store represents a central state store
type Store interface {
	// Secret returns the secret in use by the store
	Secret() []byte
	// CreateArchive creates an archive
	CreateArchive(name string, maximumFileCount int, maximumFileSize int, maximumSize int) (Archive, error)
	// CreateToken creates a token for an archive
	CreateToken(archiveId string, lifetime int) (string, error)
	// CreateFile creates a file in an archive
	CreateFile(archiveId string, name string, lastModified int, size int, mime string) (File, error)
	// Archive returns an archive by id
	Archive(archiveId string) (Archive, bool, error)
}
