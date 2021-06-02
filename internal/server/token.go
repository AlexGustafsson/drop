package server

import (
	"encoding/json"

	"github.com/AlexGustafsson/drop/internal/authentication"
	log "github.com/sirupsen/logrus"
	"github.com/valyala/fasthttp"
)

// CreateTokenRequest is the request for the create token API.
type CreateTokenRequest struct {
	Name             string `json:"name"`
	Lifetime         int    `json:"lifetime"`
	MaximumFileCount int    `json:"maximumFileCount"`
	MaximumFileSize  int    `json:"maximumFileSize"`
	MaximumSize      int    `json:"maximumSize"`
}

// CreateTokenResponse is the response for the create token API.
type CreateTokenResponse struct {
	Token string `json:"token"`
}

func (server *Server) handleTokenEndpoint(ctx *fasthttp.RequestCtx) {
	switch string(ctx.Method()) {
	case fasthttp.MethodPost:
		server.handleTokenCreation(ctx)
	default:
		ctx.Error(NotFoundError, fasthttp.StatusNotFound)
	}
}

func (server *Server) handleTokenCreation(ctx *fasthttp.RequestCtx) {
	var request CreateTokenRequest
	err := json.Unmarshal(ctx.PostBody(), &request)
	if err != nil {
		log.Error("Failed to parse request body", err.Error())
		ctx.Error(BadRequestError, fasthttp.StatusBadRequest)
		return
	}

	token, id, err := authentication.CreateToken(server.secret, request.Name, request.Lifetime, request.MaximumFileCount, request.MaximumFileSize, request.MaximumSize)
	if err != nil {
		ctx.Error(InternalServerError, fasthttp.StatusInternalServerError)
	}

	var response CreateTokenResponse
	response.Token = token

	ctx.SetStatusCode(fasthttp.StatusCreated)
	err = json.NewEncoder(ctx).Encode(response)
	if err != nil {
		log.Error("Failed to encode create token response", err.Error())
		ctx.Error(InternalServerError, fasthttp.StatusInternalServerError)
	}

	log.Debugf("Responded with token id %s", id)
}
