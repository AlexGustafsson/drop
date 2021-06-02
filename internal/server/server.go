package server

import (
	"fmt"

	log "github.com/sirupsen/logrus"
	"github.com/valyala/fasthttp"
)

type Server struct {
	secret []byte
}

func NewServer(secret []byte) *Server {
	return &Server{
		secret: secret,
	}
}

func (server *Server) Start(address string, port uint16) error {
	log.Infof("Starting server on %s:%d", address, port)
	return fasthttp.ListenAndServe(fmt.Sprintf("%s:%d", address, port), server.handleRequest)
}

func (server *Server) handleRequest(ctx *fasthttp.RequestCtx) {
	ctx.Response.Header.Set(ContentTypeHeader, ApplicationTypeJSON)

	switch string(ctx.Path()) {
	case "/api/v1/token":
		server.handleTokenEndpoint(ctx)
	default:
		ctx.Error(NotFoundError, fasthttp.StatusNotFound)
	}
}
