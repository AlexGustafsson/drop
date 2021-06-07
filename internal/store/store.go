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
	// CreateToken creates a token for an archive
	CreateToken(lifetime int) (string, error)
	// CreateFile creates a file in an archive
	CreateFile(name string, lastModified int, size int, mime string) (File, error)
}

// Store represents a central state store
type Store interface {
	// Secret returns the secret in use by the store
	Secret() []byte
	// CreateArchive creates an archive
	CreateArchive(name string, maximumFileCount int, maximumFileSize int, maximumSize int) (Archive, error)
	// Archive returns an archive by id
	Archive(archiveId string) (Archive, bool, error)
}
