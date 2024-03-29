package server

import (
	"fmt"
	"io"

	"github.com/AlexGustafsson/drop/internal/server/wrappers"
	"github.com/gofiber/fiber/v2"
	log "github.com/sirupsen/logrus"
)

type FileResponse struct {
	Id            string `json:"id"`
	Created       int64  `json:"created"`
	Name          string `json:"name"`
	LastModified  int64  `json:"lastModified"`
	Size          int    `json:"size"`
	EncryptedSize int    `json:"encryptedSize"`
	Mime          string `json:"mime"`
}

type FileListResponse struct {
	Files []FileResponse `json:"files"`
}

type FileCreateRequest struct {
	Name          string `json:"name"`
	LastModified  int64  `json:"lastModified"`
	Size          int    `json:"size"`
	EncryptedSize int    `json:"encryptedSize"`
	Mime          string `json:"mime"`
}

func (server *Server) handleAllFileList(ctx *wrappers.Context) error {
	if _, ok := ctx.RequireAdminAuth(); !ok {
		return nil
	}

	files, err := server.stateStore.Files()
	if err != nil {
		ctx.Status(fiber.StatusInternalServerError).SendString(InternalServerError)
		return err
	}

	response := FileListResponse{
		Files: make([]FileResponse, 0),
	}
	for _, file := range files {
		response.Files = append(response.Files, FileResponse{
			Id:           file.Id(),
			Created:      file.Created(),
			Name:         file.Name(),
			LastModified: file.LastModified(),
			Size:         file.Size(),
			Mime:         file.Mime(),
		})
	}

	err = ctx.JSON(response)
	if err != nil {
		ctx.Status(fiber.StatusInternalServerError).SendString(InternalServerError)
		return err
	}

	return nil
}

func (server *Server) handleFileList(ctx *wrappers.Context) error {
	if _, ok := ctx.RequireAdminAuth(); !ok {
		return nil
	}

	archive, ok := ctx.RequestedArchive()
	if !ok {
		return nil
	}

	files, err := archive.Files()
	if err != nil {
		ctx.Status(fiber.StatusInternalServerError).SendString(InternalServerError)
		return err
	}

	response := FileListResponse{}
	for _, file := range files {
		response.Files = append(response.Files, FileResponse{
			Id:           file.Id(),
			Created:      file.Created(),
			Name:         file.Name(),
			LastModified: file.LastModified(),
			Size:         file.Size(),
			Mime:         file.Mime(),
		})
	}

	err = ctx.JSON(response)
	if err != nil {
		ctx.Status(fiber.StatusInternalServerError).SendString(InternalServerError)
		return err
	}

	return nil
}

func (server *Server) handleFileCreate(ctx *wrappers.Context) error {
	if _, ok := ctx.RequireArchiveAuth(); !ok {
		return nil
	}

	var request FileCreateRequest
	if err := ctx.BodyParser(&request); err != nil {
		ctx.Status(fiber.StatusBadRequest).SendString(BadRequestError)
		return err
	}

	archive, ok := ctx.RequestedArchive()
	if !ok {
		return nil
	}

	// TODO: Validate size restrictions etc.

	file, err := archive.CreateFile(
		request.Name,
		request.LastModified,
		request.Size,
		request.EncryptedSize,
		request.Mime,
	)
	if err != nil {
		ctx.Status(fiber.StatusInternalServerError).SendString(InternalServerError)
		return err
	}

	err = server.dataStore.Touch(archive.Id(), file.Id(), uint64(request.Size))
	if err != nil {
		ctx.Status(fiber.StatusInternalServerError).SendString(InternalServerError)
		return fmt.Errorf("failed to touch file: %s/%s", archive.Id(), file.Id())
	}

	response := FileResponse{
		Id:            file.Id(),
		Created:       file.Created(),
		Name:          file.Name(),
		LastModified:  file.LastModified(),
		Size:          file.Size(),
		EncryptedSize: file.EncryptedSize(),
		Mime:          file.Mime(),
	}

	err = ctx.JSON(response)
	if err != nil {
		ctx.Status(fiber.StatusInternalServerError).SendString(InternalServerError)
		return err
	}

	return nil
}

func (server *Server) handleFileGet(ctx *wrappers.Context) error {
	if _, ok := ctx.RequireAdminAuth(); !ok {
		return nil
	}

	archive, ok := ctx.RequestedArchive()
	if !ok {
		return nil
	}

	fileId := ctx.Get("fileId")
	file, fileExists, err := archive.File(fileId)
	if err != nil {
		ctx.Status(fiber.StatusInternalServerError).SendString(InternalServerError)
		return err
	}
	if !fileExists {
		ctx.Status(fiber.StatusNotFound).SendString(NotFoundError)
		return nil
	}

	response := FileResponse{
		Id:           file.Id(),
		Created:      file.Created(),
		Name:         file.Name(),
		LastModified: file.LastModified(),
		Size:         file.Size(),
		Mime:         file.Mime(),
	}

	err = ctx.JSON(response)
	if err != nil {
		ctx.Status(fiber.StatusInternalServerError).SendString(InternalServerError)
		return err
	}

	return nil
}

func (server *Server) handleFileDownload(ctx *wrappers.Context) error {
	ctx.SendStatus(fiber.StatusNotImplemented)
	return nil
}

func (server *Server) handleFileUpload(ctx *wrappers.Context) error {
	if _, ok := ctx.RequireArchiveAuth(); !ok {
		return nil
	}

	archive, ok := ctx.RequestedArchive()
	if !ok {
		return nil
	}

	fileId := ctx.Params("fileId")
	file, fileExists, err := archive.File(fileId)
	if err != nil {
		ctx.Status(fiber.StatusInternalServerError).SendString(InternalServerError)
		return err
	}

	if !fileExists {
		ctx.Status(fiber.StatusNotFound).SendString(NotFoundError)
		return nil
	}

	fileExists, err = server.dataStore.Exists(archive.Id(), fileId)
	if err != nil {
		ctx.Status(fiber.StatusInternalServerError).SendString(InternalServerError)
		return fmt.Errorf("failed to check if file exists: %s/%s", archive.Id(), fileId)
	}
	if !fileExists {
		ctx.Status(fiber.StatusInternalServerError).SendString(InternalServerError)
		return fmt.Errorf("file is tracked in state but does not exist in the store: %s/%s", archive.Id(), fileId)
	}

	contentRangeHeader := ctx.Get("Content-Range")
	rangeStart := uint64(0)
	rangeEnd := uint64(file.Size())

	if contentRangeHeader != "" {
		var rangeUnit string
		var rangeSize uint64
		rangeUnit, rangeStart, rangeEnd, rangeSize, err = parseContentRange(contentRangeHeader)
		if err != nil {
			ctx.Status(fiber.StatusBadRequest).SendString(BadRequestError)
			return err
		}

		// Only bytes are supported
		if rangeUnit != "bytes" {
			log.Debugf("Got bad range unit '%s'", rangeUnit)
			ctx.Status(fiber.StatusBadRequest).SendString(BadRequestError)
			return nil
		}

		// Incoherent sizes
		if rangeSize != uint64(file.EncryptedSize()) {
			log.Debugf("Got bad range size %d - expected %d", rangeSize, file.EncryptedSize())
			ctx.Status(fiber.StatusBadRequest).SendString(BadRequestError)
			return nil
		}
	}

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
				return nil
			}
		}

		log.Debugf("Wrote %d bytes for file '%s'", length, file.Name())
		err = server.dataStore.Write(archive.Id(), fileId, buffer, rangeStart)
		if err != nil {
			ctx.Status(fiber.StatusInternalServerError).SendString(InternalServerError)
			return err
		}
	}

	return nil
}
