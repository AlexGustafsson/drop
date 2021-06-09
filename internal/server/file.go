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
	Nonce        string `json:"nonce"`
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

	archive, archiveExists, err := server.stateStore.Archive(archiveId)
	if err != nil {
		log.Error("Unable to get archive: ", err.Error())
		ctx.Status(fiber.StatusInternalServerError).SendString(InternalServerError)
		return nil
	}

	if !archiveExists {
		ctx.Status(fiber.StatusNotFound).SendString(NotFoundError)
		return nil
	}

	hasToken, err := archive.HasToken(claims.Id)
	if err != nil {
		log.Error("Unable to check if token exists for archive: ", err.Error())
		ctx.Status(fiber.StatusInternalServerError).SendString(InternalServerError)
		return nil
	}

	if !hasToken {
		log.WithFields(log.Fields{
			"tokenId": claims.Id,
		}).Error("Attempt at using bad or revoked token")
		ctx.Status(fiber.StatusForbidden).SendString(ForbiddenError)
		return nil
	}

	file, err := archive.CreateFile(request.Name, request.LastModified, request.Size, request.Mime, request.Nonce)
	if err != nil {
		log.Error("Unable to create file: ", err.Error())
		ctx.Status(fiber.StatusInternalServerError).SendString(InternalServerError)
		return nil
	}

	err = server.dataStore.Touch(archiveId, file.Id(), uint64(file.Size()))
	if err != nil {
		log.Error("Unable to touch file: ", err.Error())
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

	archive, archiveExists, err := server.stateStore.Archive(archiveId)
	if err != nil {
		log.Error("Unable to get archive: ", err.Error())
		ctx.Status(fiber.StatusInternalServerError).SendString(InternalServerError)
		return nil
	}

	if !archiveExists {
		ctx.Status(fiber.StatusNotFound).SendString(NotFoundError)
		return nil
	}

	hasToken, err := archive.HasToken(claims.Id)
	if err != nil {
		log.Error("Unable to check if token exists for archive: ", err.Error())
		ctx.Status(fiber.StatusInternalServerError).SendString(InternalServerError)
		return nil
	}

	if !hasToken {
		log.WithFields(log.Fields{
			"tokenId": claims.Id,
		}).Error("Attempt at using bad or revoked token")
		ctx.Status(fiber.StatusForbidden).SendString(ForbiddenError)
		return nil
	}

	fileId := ctx.Params("fileId")
	file, fileExists, err := archive.File(fileId)
	if err != nil {
		log.Error("Unable to get file: ", err.Error())
		ctx.Status(fiber.StatusInternalServerError).SendString(InternalServerError)
		return nil
	}

	if !fileExists {
		ctx.Status(fiber.StatusNotFound).SendString(NotFoundError)
		return nil
	}

	fileExists, err = server.dataStore.Exists(archiveId, fileId)
	if !fileExists {
		log.Errorf("File is tracked in state but does not exist in the store: %s/%s", archiveId, fileId)
		ctx.Status(fiber.StatusInternalServerError).SendString(InternalServerError)
		return nil
	}

	contentRangeHeader := ctx.Get("Content-Range")
	rangeStart := uint64(0)
	rangeEnd := uint64(file.Size())

	if contentRangeHeader != "" {
		var rangeUnit string
		var rangeSize uint64
		rangeUnit, rangeStart, rangeEnd, rangeSize, err = parseContentRange(contentRangeHeader)
		if err != nil {
			log.Errorf("Unable to parse Content-Range header: ", err.Error())
			ctx.Status(fiber.StatusBadRequest).SendString(BadRequestError)
			return nil
		}

		// Only bytes are supported
		if rangeUnit != "bytes" {
			ctx.Status(fiber.StatusBadRequest).SendString(BadRequestError)
			return nil
		}

		// Incoherent sizes
		if rangeSize != uint64(file.Size()) {
			ctx.Status(fiber.StatusBadRequest).SendString(BadRequestError)
			return nil
		}
	}

	// TODO: Validate sizes and range
	log.Debugf("Got request to write from %d-%d", rangeStart, rangeEnd)

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

		// TODO: Validate sizes
		log.Debugf("Read %d bytes for file '%s'", length, file.Name())
		err = server.dataStore.Write(archiveId, fileId, buffer, rangeStart)
		if err != nil {
			log.Error("Unable to write to file: ", err.Error())
			ctx.Status(fiber.StatusInternalServerError).SendString(InternalServerError)
			return nil
		}
	}

	return nil
}
