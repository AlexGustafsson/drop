package server

import (
	"io"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
	log "github.com/sirupsen/logrus"
)

// CreateFileRequest is the request for the create file API.
type CreateFileRequest struct {
	Name         string `json:"name"`
	LastModified int    `json:"lastModified"`
	Size         int    `json:"size"`
	Type         string `json:"type"`
}

// CreateFileResponse is the response for the create file API.
type CreateFileResponse struct {
	Id string `json:"id"`
}

func (server *Server) handleFileCreation(ctx *fiber.Ctx) error {
	claimsLocal := ctx.Locals("claims")
	if claimsLocal == nil {
		ctx.Status(fiber.StatusForbidden).SendString(ForbiddenError)
		return nil
	}

	var request CreateFileRequest
	if err := ctx.BodyParser(&request); err != nil {
		log.Error("Failed to parse request body", err.Error())
		ctx.Status(fiber.StatusBadRequest).SendString(BadRequestError)
		return nil
	}

	fileId, err := uuid.NewRandom()
	if err != nil {
		log.Error("Failed to generate file id", err.Error())
		ctx.Status(fiber.StatusInternalServerError).SendString(InternalServerError)
		return nil
	}

	// TODO: Retain context of created files during the session
	// TODO: Validate that it does not surpass valid size

	log.Infof("Creating file '%s' (%s) of %d bytes", request.Name, request.Type, request.Size)
	response := CreateFileResponse{
		Id: fileId.String(),
	}

	ctx.Status(fiber.StatusCreated).JSON(response)
	return nil
}

func (server *Server) handleFileUpload(ctx *fiber.Ctx) error {
	claimsLocal := ctx.Locals("claims")
	if claimsLocal == nil {
		ctx.Status(fiber.StatusForbidden).SendString(ForbiddenError)
		return nil
	}

	// TODO: Find archive, validate etc.
	reader := ctx.Context().RequestBodyStream()
	buffer := make([]byte, 0, 1024*1024)
	for {
		length, err := io.ReadFull(reader, buffer[:cap(buffer)])
		// TODO: Doesn't this duplicate memory?
		buffer = buffer[:length]
		if err != nil {
			if err == io.EOF {
				break
			}
			if err != io.ErrUnexpectedEOF {
				return err
			}
		}

		log.Debugf("Read %d bytes", length)
	}
	return nil
}
