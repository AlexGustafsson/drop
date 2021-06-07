package server

import (
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

func (server *Server) handleArchiveCreation(ctx *fiber.Ctx) error {
	var request CreateArchiveRequest
	if err := ctx.BodyParser(&request); err != nil {
		log.Error("Failed to parse request body", err.Error())
		ctx.Status(fiber.StatusBadRequest).SendString(BadRequestError)
		return nil
	}

	archive, err := server.store.CreateArchive(
		request.Name,
		request.MaximumFileCount,
		request.MaximumFileSize,
		request.MaximumSize,
	)
	if err != nil {
		log.Error("Failed to create archive", err.Error())
		ctx.Status(fiber.StatusInternalServerError).SendString(InternalServerError)
		return nil
	}

	var response CreateArchiveResponse
	response.Id = archive.Id()

	err = ctx.JSON(response)
	if err != nil {
		log.Error("Failed to encode create archive response", err.Error())
		ctx.Status(fiber.StatusInternalServerError).SendString(InternalServerError)
		return nil
	}

	ctx.Status(fiber.StatusCreated)
	return nil
}

func (server *Server) handleArchiveTokenCreation(ctx *fiber.Ctx) error {
	var request CreateArchiveTokenRequest
	if err := ctx.BodyParser(&request); err != nil {
		log.Error("Failed to parse request body", err.Error())
		ctx.Status(fiber.StatusBadRequest).SendString(BadRequestError)
		return nil
	}

	archiveId := ctx.Params("archiveId")
	_, archiveExists, err := server.store.Archive(archiveId)
	if err != nil {
		log.Error("Unable to get archive", err.Error())
		ctx.Status(fiber.StatusInternalServerError).SendString(InternalServerError)
		return nil
	}
	if !archiveExists {
		ctx.Status(fiber.StatusNotFound).SendString(NotFoundError)
		return nil
	}

	token, err := server.store.CreateToken(archiveId, request.Lifetime)
	if err != nil {
		log.Error("Failed to create token", err.Error())
		ctx.Status(fiber.StatusInternalServerError).SendString(InternalServerError)
		return nil
	}

	var response CreateArchiveTokenResponse
	response.Token = token

	err = ctx.JSON(response)
	if err != nil {
		log.Error("Failed to encode create archive token response", err.Error())
		ctx.Status(fiber.StatusInternalServerError).SendString(InternalServerError)
		return nil
	}

	ctx.Status(fiber.StatusCreated)
	return nil
}
