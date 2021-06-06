package server

import (
	"github.com/AlexGustafsson/drop/internal/authentication"
	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
	log "github.com/sirupsen/logrus"
)

// CreateArchiveRequest is the request for the create archive API.
type CreateArchiveRequest struct {
	Name             string `json:"name"`
	Lifetime         int    `json:"lifetime"`
	MaximumFileCount int    `json:"maximumFileCount"`
	MaximumFileSize  int    `json:"maximumFileSize"`
	MaximumSize      int    `json:"maximumSize"`
}

// CreateArchiveResponse is the response for the create archive API.
type CreateArchiveResponse struct {
	Token string `json:"token"`
	Id    string `json:"id"`
}

func (server *Server) handleArchiveCreation(ctx *fiber.Ctx) error {
	var request CreateArchiveRequest
	if err := ctx.BodyParser(&request); err != nil {
		log.Error("Failed to parse request body", err.Error())
		ctx.Status(fiber.StatusBadRequest).SendString(BadRequestError)
		return nil
	}

	token, tokenId, err := authentication.CreateToken(server.secret, request.Name, request.Lifetime, request.MaximumFileCount, request.MaximumFileSize, request.MaximumSize)
	if err != nil {
		ctx.Status(fiber.StatusInternalServerError).SendString(InternalServerError)
		return nil
	}

	archiveId, err := uuid.NewRandom()
	if err != nil {
		log.Error("Failed to generate archive id", err.Error())
		ctx.Status(fiber.StatusInternalServerError).SendString(InternalServerError)
		return nil
	}

	var response CreateArchiveResponse
	response.Token = token
	response.Id = archiveId.String()

	err = ctx.JSON(response)
	if err != nil {
		log.Error("Failed to encode create archive response", err.Error())
		ctx.Status(fiber.StatusInternalServerError).SendString(InternalServerError)
		return nil
	}

	log.Debugf("Responded with token id %s", tokenId)
	return nil
}
