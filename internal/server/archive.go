package server

import (
	"github.com/AlexGustafsson/drop/internal/server/wrappers"
	"github.com/gofiber/fiber/v2"
	log "github.com/sirupsen/logrus"
)

// CreateArchiveRequest is the request for the create archive API.
type CreateArchiveRequest struct {
	Name             string `json:"name"`
	MaximumFileCount int    `json:"maximumFileCount"`
	MaximumFileSize  int    `json:"maximumFileSize"`
	MaximumSize      int    `json:"maximumSize"`
}

// CreateArchiveResponse is the response for the create archive API.
type CreateArchiveResponse struct {
	Id string `json:"id"`
}

// CreateArchiveTokenRequest is the request for the create archive token API.
type CreateArchiveTokenRequest struct {
	Lifetime int `json:"lifetime"`
}

// CreateArchiveTokenResponse is the response for the create archive token API.
type CreateArchiveTokenResponse struct {
	Token string `json:"token"`
}

func (server *Server) handleArchiveCreation(ctx *wrappers.Context) {
	if isAdmin, _ := ctx.AdminClaims(); !isAdmin {
		ctx.Status(fiber.StatusForbidden).SendString(ForbiddenError)
		return
	}

	var request CreateArchiveRequest
	if err := ctx.BodyParser(&request); err != nil {
		log.Error("Failed to parse request body", err.Error())
		ctx.Status(fiber.StatusBadRequest).SendString(BadRequestError)
		return
	}

	archive, err := server.stateStore.CreateArchive(
		request.Name,
		request.MaximumFileCount,
		request.MaximumFileSize,
		request.MaximumSize,
	)
	if err != nil {
		log.Error("Failed to create archive", err.Error())
		ctx.Status(fiber.StatusInternalServerError).SendString(InternalServerError)
		return
	}

	var response CreateArchiveResponse
	response.Id = archive.Id()

	err = ctx.JSON(response)
	if err != nil {
		log.Error("Failed to encode create archive response", err.Error())
		ctx.Status(fiber.StatusInternalServerError).SendString(InternalServerError)
		return
	}

	ctx.Status(fiber.StatusCreated)
	return
}

func (server *Server) handleArchiveTokenCreation(ctx *wrappers.Context) {
	if isAdmin, _ := ctx.AdminClaims(); !isAdmin {
		ctx.Status(fiber.StatusForbidden).SendString(ForbiddenError)
		return
	}

	var request CreateArchiveTokenRequest
	if err := ctx.BodyParser(&request); err != nil {
		log.Error("Failed to parse request body", err.Error())
		ctx.Status(fiber.StatusBadRequest).SendString(BadRequestError)
		return
	}

	archiveId := ctx.Params("archiveId")
	archive, archiveExists, err := server.stateStore.Archive(archiveId)
	if err != nil {
		log.Error("Unable to get archive", err.Error())
		ctx.Status(fiber.StatusInternalServerError).SendString(InternalServerError)
		return
	}
	if !archiveExists {
		ctx.Status(fiber.StatusNotFound).SendString(NotFoundError)
		return
	}

	token, err := archive.CreateToken(request.Lifetime)
	if err != nil {
		log.Error("Failed to create token", err.Error())
		ctx.Status(fiber.StatusInternalServerError).SendString(InternalServerError)
		return
	}

	var response CreateArchiveTokenResponse
	response.Token = token

	err = ctx.JSON(response)
	if err != nil {
		log.Error("Failed to encode create archive token response", err.Error())
		ctx.Status(fiber.StatusInternalServerError).SendString(InternalServerError)
		return
	}

	ctx.Status(fiber.StatusCreated)
	return
}

func (server *Server) handleArchiveRetrieval(ctx *wrappers.Context) {
	if isAdmin, _ := ctx.AdminClaims(); !isAdmin {
		ctx.Status(fiber.StatusForbidden).SendString(ForbiddenError)
		return
	}
}
