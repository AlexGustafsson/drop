package state

// File is a
type File interface {
	Id() string
	Name() string
	LastModified() int
	Size() int
	Mime() string
	Nonce() string
	Created() int
}

// AdminToken is an admin token
type AdminToken interface {
	Id() string
	Created() int
}

// ArchiveToken is a token for an archive
type ArchiveToken interface {
	Id() string
	Created() int
}

// Archive is an archive of files
type Archive interface {
	Id() string
	Name() string
	Created() int
	MaximumFileCount() int
	MaximumFileSize() int
	MaximumSize() int
	File(id string) (File, bool, error)
	Files() ([]File, error)
	Token(id string) (ArchiveToken, bool, error)
	Tokens() ([]ArchiveToken, error)
	// CreateToken creates a token for an archive
	CreateToken(lifetime int) (string, error)
	// CreateFile creates a file in an archive
	CreateFile(name string, lastModified int, size int, mime string, nonce string) (File, error)
}

// Store represents a central state store
type Store interface {
	// Secret returns the secret in use by the store
	Secret() []byte
	// CreateArchive creates an archive
	CreateArchive(name string, maximumFileCount int, maximumFileSize int, maximumSize int) (Archive, error)
	// Archive returns an archive by id
	Archive(archiveId string) (Archive, bool, error)
	Archives() ([]Archive, error)
	// CreateAdminToken creates an admin token
	CreateAdminToken(lifetime int) (string, error)
	AdminToken(id string) (AdminToken, bool, error)
	AdminTokens() ([]AdminToken, error)
}
