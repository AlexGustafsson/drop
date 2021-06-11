package server

import (
	"github.com/AlexGustafsson/drop/internal/server/wrappers"
	"github.com/gofiber/fiber/v2"
)

type ArchiveResponse struct {
	Id               string `json:"id"`
	Created          int64  `json:"created"`
	Name             string `json:"name"`
	MaximumFileCount int    `json:"maximumFileCount"`
	MaximumFileSize  int    `json:"maximumFileSize"`
	MaximumSize      int    `json:"maximumSize"`
}

type ArchiveListResponse struct {
	Archives []ArchiveResponse `json:"archives"`
}

type ArchiveCreateRequest struct {
	Name             string `json:"name"`
	MaximumFileCount int    `json:"maximumFileCount"`
	MaximumFileSize  int    `json:"maximumFileSize"`
	MaximumSize      int    `json:"maximumSize"`
}

func (server *Server) handleArchiveList(ctx *wrappers.Context) error {
	if _, ok := ctx.RequireAdminAuth(); !ok {
		return nil
	}

	archives, err := server.stateStore.Archives()
	if err != nil {
		ctx.Status(fiber.StatusInternalServerError).SendString(InternalServerError)
		return err
	}

	response := ArchiveListResponse{}
	for _, archive := range archives {
		response.Archives = append(response.Archives, ArchiveResponse{
			Id:               archive.Id(),
			Name:             archive.Name(),
			MaximumFileCount: archive.MaximumFileCount(),
			MaximumFileSize:  archive.MaximumFileSize(),
			MaximumSize:      archive.MaximumSize(),
		})
	}

	err = ctx.JSON(response)
	if err != nil {
		ctx.Status(fiber.StatusInternalServerError).SendString(InternalServerError)
		return err
	}

	return nil
}

func (server *Server) handleArchiveCreate(ctx *wrappers.Context) error {
	if _, ok := ctx.RequireAdminAuth(); !ok {
		return nil
	}

	var request ArchiveCreateRequest
	if err := ctx.BodyParser(&request); err != nil {
		ctx.Status(fiber.StatusBadRequest).SendString(BadRequestError)
		return err
	}

	archive, err := server.stateStore.CreateArchive(
		request.Name,
		request.MaximumFileCount,
		request.MaximumFileSize,
		request.MaximumSize,
	)
	if err != nil {
		ctx.Status(fiber.StatusBadRequest).SendString(BadRequestError)
		return err
	}

	response := ArchiveResponse{
		Id:               archive.Id(),
		Created:          archive.Created(),
		Name:             archive.Name(),
		MaximumFileCount: archive.MaximumFileCount(),
		MaximumFileSize:  archive.MaximumFileSize(),
		MaximumSize:      archive.MaximumSize(),
	}

	err = ctx.JSON(response)
	if err != nil {
		ctx.Status(fiber.StatusInternalServerError).SendString(InternalServerError)
		return err
	}

	ctx.Status(fiber.StatusCreated)
	return nil
}

func (server *Server) handleArchiveGet(ctx *wrappers.Context) error {
	if _, ok := ctx.RequireAdminAuth(); !ok {
		return nil
	}

	archive, ok := ctx.RequestedArchive()
	if !ok {
		return nil
	}

	response := ArchiveResponse{
		Id:               archive.Id(),
		Name:             archive.Name(),
		MaximumFileCount: archive.MaximumFileCount(),
		MaximumFileSize:  archive.MaximumFileSize(),
		MaximumSize:      archive.MaximumSize(),
	}

	err := ctx.JSON(response)
	if err != nil {
		ctx.Status(fiber.StatusInternalServerError).SendString(InternalServerError)
		return err
	}

	return nil
}

func (server *Server) handleArchiveDelete(ctx *wrappers.Context) error {
	if _, ok := ctx.RequireAdminAuth(); !ok {
		return nil
	}

	archiveId := ctx.Params("archiveId")
	archiveExisted, err := server.stateStore.DeleteArchive(archiveId)
	if err != nil {
		ctx.Status(fiber.StatusInternalServerError).SendString(InternalServerError)
		return err
	}
	if !archiveExisted {
		ctx.Status(fiber.StatusNotFound).SendString(NotFoundError)
		return nil
	}

	return nil
}
