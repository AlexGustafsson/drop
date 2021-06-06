package server

var (
	NotFoundError       = "{\"error\": \"Not Found\"}"
	BadRequestError     = "{\"error\": \"Bad Request\"}"
	InternalServerError = "{\"error\": \"Internal Server Error\"}"
	ForbiddenError      = "{\"error\": \"Forbidden\"}"
)

var (
	ContentTypeHeader   = "Content-Type"
	ApplicationTypeJSON = "application/json"
)

var (
	AuthorizationHeader = "Authorization"
)
