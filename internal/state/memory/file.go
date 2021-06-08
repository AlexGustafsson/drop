package memory

type MemoryFile struct {
	id           string
	name         string
	lastModified int
	size         int
	mime         string
	nonce        string
}

func (file *MemoryFile) Id() string {
	return file.id
}

func (file *MemoryFile) Name() string {
	return file.name
}

func (file *MemoryFile) LastModified() int {
	return file.lastModified
}

func (file *MemoryFile) Size() int {
	return file.size
}

func (file *MemoryFile) Mime() string {
	return file.mime
}

func (file *MemoryFile) Nonce() string {
	return file.nonce
}
