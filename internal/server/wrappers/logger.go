package wrappers

import (
	log "github.com/sirupsen/logrus"
)

func extractFields(ctx *Context, fields log.Fields) {
	fields["method"] = ctx.Method()
	fields["path"] = ctx.Path()

	if isAdmin, claims := ctx.AdminClaims(); isAdmin {
		fields["admin"] = isAdmin
		fields["token"] = claims.Id
	} else {
		fields["admin"] = false
	}

	if isArchive, claims := ctx.AdminClaims(); isArchive {
		fields["token"] = claims.Id
	}
}

func logBefore(ctx *Context) {
	fields := log.Fields{}
	extractFields(ctx, fields)
	log.WithFields(fields).Debug("Handling request")
}

func logAfter(ctx *Context) {
	fields := log.Fields{}
	extractFields(ctx, fields)
	fields["status"] = ctx.Response().StatusCode()
	log.WithFields(fields).Info("Handled request")
}
