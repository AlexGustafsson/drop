package wrappers

import (
	"fmt"
	"strings"

	"github.com/AlexGustafsson/drop/internal/auth"
	"github.com/AlexGustafsson/drop/internal/state"
	"github.com/gofiber/fiber/v2"
	log "github.com/sirupsen/logrus"
)

type Context struct {
	adminTokenClaims   *auth.AdminTokenClaims
	archiveTokenClaims *auth.ArchiveTokenClaims
	stateStore         state.Store
	*fiber.Ctx
}

func NewContext(ctx *fiber.Ctx, stateStore state.Store) *Context {
	return &Context{
		adminTokenClaims:   nil,
		archiveTokenClaims: nil,
		stateStore:         stateStore,
		Ctx:                ctx,
	}
}

func (ctx *Context) parseAdminToken(bearerToken string) error {
	claims, err := auth.ValidateAdminToken(ctx.stateStore.Secret(), bearerToken)
	if err != nil {
		ctx.Status(fiber.StatusForbidden).SendString(ForbiddenError)
		return err
	}

	_, tokenExists, err := ctx.stateStore.AdminToken(claims.Id)
	if err != nil {
		ctx.Status(fiber.StatusInternalServerError).SendString(InternalServerError)
		return err
	}

	if !tokenExists {
		ctx.Status(fiber.StatusForbidden).SendString(ForbiddenError)
		return fmt.Errorf("The specified admin token does not exist")
	}

	ctx.adminTokenClaims = claims
	return nil
}

func (ctx *Context) parseArchiveToken(bearerToken string) error {
	claims, err := auth.ValidateArchiveToken(ctx.stateStore.Secret(), bearerToken)
	if err != nil {
		ctx.Status(fiber.StatusForbidden).SendString(ForbiddenError)
		return err
	}

	archive, archiveExists, err := ctx.stateStore.Archive(claims.ArchiveId)
	if err != nil {
		ctx.Status(fiber.StatusInternalServerError).SendString(InternalServerError)
		return err
	}

	if !archiveExists {
		ctx.Status(fiber.StatusForbidden).SendString(ForbiddenError)
		return err
	}

	_, tokenExists, err := archive.Token(claims.Id)
	if err != nil {
		ctx.Status(fiber.StatusInternalServerError).SendString(InternalServerError)
		return err
	}

	if !tokenExists {
		ctx.Status(fiber.StatusForbidden).SendString(ForbiddenError)
		return fmt.Errorf("The specified archive token does not exist")
	}

	ctx.archiveTokenClaims = claims
	return nil
}

func (ctx *Context) Parse() error {
	bearerToken := ctx.Get("Authorization")
	bearerToken = strings.TrimPrefix(bearerToken, "Bearer ")

	if bearerToken != "" {
		err := ctx.parseAdminToken(bearerToken)
		if err != nil {
			err = ctx.parseArchiveToken(bearerToken)
			if err != nil {
				return err
			}
		}
	}

	return nil
}

func (ctx *Context) AdminClaims() (*auth.AdminTokenClaims, bool) {
	return ctx.adminTokenClaims, ctx.adminTokenClaims != nil
}

func (ctx *Context) ArchiveClaims() (*auth.ArchiveTokenClaims, bool) {
	return ctx.archiveTokenClaims, ctx.archiveTokenClaims != nil
}

func (ctx *Context) RequestedArchive() (state.Archive, bool) {
	archiveId := ctx.Params("archiveId")
	archive, archiveExists, err := ctx.stateStore.Archive(archiveId)
	if err != nil {
		log.Error(err)
		ctx.Status(fiber.StatusInternalServerError).SendString(InternalServerError)
		return nil, false
	}
	if !archiveExists {
		ctx.Status(fiber.StatusNotFound).SendString(NotFoundError)
		return nil, false
	}

	return archive, true
}

func (ctx *Context) RequestedFile() (state.File, state.Archive, bool) {
	archive, ok := ctx.RequestedArchive()
	if !ok {
		return nil, nil, false
	}

	fileId := ctx.Params("fileId")
	file, fileExists, err := archive.File(fileId)
	if err != nil {
		log.Error(err)
		ctx.Status(fiber.StatusInternalServerError).SendString(InternalServerError)
		return nil, nil, false
	}
	if !fileExists {
		ctx.Status(fiber.StatusNotFound).SendString(NotFoundError)
		return nil, nil, false
	}

	return file, archive, true
}

func (ctx *Context) RequireAdminAuth() (*auth.AdminTokenClaims, bool) {
	claims, isAdmin := ctx.AdminClaims()
	if !isAdmin {
		ctx.Status(fiber.StatusForbidden).SendString(ForbiddenError)
		return nil, false
	}

	return claims, true
}

func (ctx *Context) RequireArchiveAuth() (*auth.ArchiveTokenClaims, bool) {
	claims, isArchive := ctx.ArchiveClaims()
	if !isArchive {
		ctx.Status(fiber.StatusForbidden).SendString(ForbiddenError)
		return nil, false
	}

	archiveId := ctx.Params("archiveId")
	if archiveId != claims.ArchiveId {
		ctx.Status(fiber.StatusForbidden).SendString(ForbiddenError)
		return nil, false
	}

	return claims, true
}
