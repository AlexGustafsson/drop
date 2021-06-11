package sqlite

type SqliteArchiveToken struct {
	id      string
	created int
}

func (token *SqliteArchiveToken) Id() string {
	return token.id
}

func (token *SqliteArchiveToken) Created() int {
	return token.created
}

type SqliteAdminToken struct {
	id      string
	created int
}

func (token *SqliteAdminToken) Id() string {
	return token.id
}

func (token *SqliteAdminToken) Created() int {
	return token.created
}
