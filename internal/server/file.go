package server

import (
	"io"

	"github.com/AlexGustafsson/drop/internal/authentication"
	"github.com/gofiber/fiber/v2"
	log "github.com/sirupsen/logrus"
)

// CreateFileRequest is the request for the create file API.
type CreateFileRequest struct {
	Name         string `json:"name"`
	LastModified int    `json:"lastModified"`
	Size         int    `json:"size"`
	Mime         string `json:"mime"`
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
	claims := claimsLocal.(*authentication.TokenClaims)

	archiveId := ctx.Params("archiveId")
	if claims.ArchiveId != archiveId {
		log.WithFields(log.Fields{
			"archiveId": archiveId,
			"tokenId":   claims.ArchiveId,
		}).Error("Attempt at targeting a non-permitted archive")
		ctx.Status(fiber.StatusForbidden).SendString(ForbiddenError)
		return nil
	}

	var request CreateFileRequest
	if err := ctx.BodyParser(&request); err != nil {
		log.Error("Failed to parse request body", err.Error())
		ctx.Status(fiber.StatusBadRequest).SendString(BadRequestError)
		return nil
	}

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

	file, err := server.store.CreateFile(archiveId, request.Name, request.LastModified, request.Size, request.Mime)
	if err != nil {
		ctx.Status(fiber.StatusInternalServerError).SendString(InternalServerError)
		return nil
	}

	// TODO: Retain context of created files during the session
	// TODO: Validate that it does not surpass valid size

	log.Infof("Creating file '%s' (%s) of %d bytes", request.Name, request.Mime, request.Size)
	response := CreateFileResponse{
		Id: file.Id(),
	}

	err = ctx.JSON(response)
	if err != nil {
		log.Error("Failed to encode create file response", err.Error())
		ctx.Status(fiber.StatusInternalServerError).SendString(InternalServerError)
		return nil
	}

	ctx.Status(fiber.StatusCreated)
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
	buffer := make([]byte, 0, server.ChunkSize)
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