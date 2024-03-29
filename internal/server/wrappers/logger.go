package wrappers

import (
	log "github.com/sirupsen/logrus"
)

func extractFields(ctx *Context, fields log.Fields) {
	fields["method"] = ctx.Method()
	fields["path"] = ctx.Path()

	if claims, isAdmin := ctx.AdminClaims(); isAdmin {
		fields["admin"] = isAdmin
		fields["token"] = claims.ID
	} else {
		fields["admin"] = false
	}

	if claims, isArchive := ctx.ArchiveClaims(); isArchive {
		fields["token"] = claims.ID
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
