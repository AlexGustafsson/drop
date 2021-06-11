package wrappers

import (
	"fmt"
	"strings"

	"github.com/AlexGustafsson/drop/internal/authentication"
	"github.com/AlexGustafsson/drop/internal/state"
	"github.com/gofiber/fiber/v2"
)

type Context struct {
	adminTokenClaims   *authentication.AdminTokenClaims
	archiveTokenClaims *authentication.ArchiveTokenClaims
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

func (context *Context) parseAdminToken(bearerToken string) error {
	claims, err := authentication.ValidateAdminToken(context.stateStore.Secret(), bearerToken)
	if err != nil {
		context.Status(fiber.StatusForbidden).SendString(ForbiddenError)
		return err
	}

	_, tokenExists, err := context.stateStore.AdminToken(claims.Id)
	if err != nil {
		context.Status(fiber.StatusInternalServerError).SendString(InternalServerError)
		return err
	}

	if !tokenExists {
		context.Status(fiber.StatusForbidden).SendString(ForbiddenError)
		return fmt.Errorf("The specified admin token does not exist")
	}

	context.adminTokenClaims = claims
	return nil
}

func (context *Context) parseArchiveToken(bearerToken string) error {
	claims, err := authentication.ValidateArchiveToken(context.stateStore.Secret(), bearerToken)
	if err != nil {
		context.Status(fiber.StatusForbidden).SendString(ForbiddenError)
		return err
	}

	archive, archiveExists, err := context.stateStore.Archive(claims.ArchiveId)
	if err != nil {
		context.Status(fiber.StatusInternalServerError).SendString(InternalServerError)
		return err
	}

	if !archiveExists {
		context.Status(fiber.StatusForbidden).SendString(ForbiddenError)
		return err
	}

	_, tokenExists, err := archive.Token(claims.Id)
	if err != nil {
		context.Status(fiber.StatusInternalServerError).SendString(InternalServerError)
		return err
	}

	if !tokenExists {
		context.Status(fiber.StatusForbidden).SendString(ForbiddenError)
		return fmt.Errorf("The specified archive token does not exist")
	}

	context.archiveTokenClaims = claims
	return nil
}

func (context *Context) Parse() error {
	bearerToken := context.Get("Authorization")
	bearerToken = strings.TrimPrefix(bearerToken, "Bearer ")

	if bearerToken != "" {
		err := context.parseAdminToken(bearerToken)
		if err != nil {
			err = context.parseArchiveToken(bearerToken)
			if err != nil {
				return err
			}
		}
	}

	return nil
}

func (context *Context) AdminClaims() (bool, *authentication.AdminTokenClaims) {
	return context.adminTokenClaims != nil, context.adminTokenClaims
}

func (context *Context) ArchiveClaims() (bool, *authentication.ArchiveTokenClaims) {
	return context.archiveTokenClaims != nil, context.archiveTokenClaims
}
