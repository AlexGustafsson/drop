package server

import (
	"github.com/AlexGustafsson/drop/internal/server/wrappers"
	"github.com/gofiber/fiber/v2"
)

type ArchiveTokenResponse struct {
	Id        string `json:"id"`
	IssuedAt  int64  `json:"created"`
	ExpiresAt int64  `json:"expires"`
	Token     string `json:"token,omitempty"`
}

type ArchiveTokenListResponse struct {
	Tokens []ArchiveTokenResponse `json:"tokens"`
}

type ArchiveTokenCreateRequest struct {
	Lifetime int `json:"lifetime"`
}

func (server *Server) handleTokenList(ctx *wrappers.Context) error {
	if _, ok := ctx.RequireAdminAuth(); !ok {
		return nil
	}

	archive, ok := ctx.RequestedArchive()
	if !ok {
		return nil
	}

	tokens, err := archive.Tokens()
	if err != nil {
		ctx.Status(fiber.StatusInternalServerError).SendString(InternalServerError)
		return err
	}

	response := ArchiveTokenListResponse{}
	for _, token := range tokens {
		response.Tokens = append(response.Tokens, ArchiveTokenResponse{
			Id:        token.Id(),
			IssuedAt:  token.IssuedAt(),
			ExpiresAt: token.ExpiresAt(),
		})
	}

	err = ctx.JSON(response)
	if err != nil {
		ctx.Status(fiber.StatusInternalServerError).SendString(InternalServerError)
		return err
	}

	return nil
}

func (server *Server) handleTokenCreate(ctx *wrappers.Context) error {
	if _, ok := ctx.RequireAdminAuth(); !ok {
		return nil
	}

	var request ArchiveTokenCreateRequest
	if err := ctx.BodyParser(&request); err != nil {
		ctx.Status(fiber.StatusBadRequest).SendString(BadRequestError)
		return err
	}

	archive, ok := ctx.RequestedArchive()
	if !ok {
		return nil
	}

	token, tokenString, err := archive.CreateToken(request.Lifetime)
	if err != nil {
		ctx.Status(fiber.StatusInternalServerError).SendString(InternalServerError)
		return err
	}

	response := ArchiveTokenResponse{
		Id:        token.Id(),
		IssuedAt:  token.IssuedAt(),
		ExpiresAt: token.ExpiresAt(),
		Token:     tokenString,
	}

	err = ctx.JSON(response)
	if err != nil {
		ctx.Status(fiber.StatusInternalServerError).SendString(InternalServerError)
		return err
	}

	ctx.Status(fiber.StatusCreated)
	return nil
}

func (server *Server) handleTokenGet(ctx *wrappers.Context) error {
	if _, ok := ctx.RequireAdminAuth(); !ok {
		return nil
	}

	archive, ok := ctx.RequestedArchive()
	if !ok {
		return nil
	}

	tokenId := ctx.Params("tokenId")
	token, tokenExists, err := archive.Token(tokenId)
	if err != nil {
		ctx.Status(fiber.StatusInternalServerError).SendString(InternalServerError)
		return err
	}
	if !tokenExists {
		ctx.Status(fiber.StatusNotFound).SendString(NotFoundError)
		return nil
	}

	response := ArchiveTokenResponse{
		Id:        token.Id(),
		IssuedAt:  token.IssuedAt(),
		ExpiresAt: token.ExpiresAt(),
	}

	err = ctx.JSON(response)
	if err != nil {
		ctx.Status(fiber.StatusInternalServerError).SendString(InternalServerError)
		return err
	}

	return nil
}

func (server *Server) handleTokenDelete(ctx *wrappers.Context) error {
	if _, ok := ctx.RequireAdminAuth(); !ok {
		return nil
	}

	archive, ok := ctx.RequestedArchive()
	if !ok {
		return nil
	}

	tokenId := ctx.Params("tokenId")
	tokenExisted, err := archive.DeleteToken(tokenId)
	if err != nil {
		ctx.Status(fiber.StatusInternalServerError).SendString(InternalServerError)
		return err
	}
	if !tokenExisted {
		ctx.Status(fiber.StatusNotFound).SendString(NotFoundError)
		return nil
	}

	return nil
}
