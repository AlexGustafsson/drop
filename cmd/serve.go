package main

import (
	"fmt"

	"github.com/AlexGustafsson/drop/internal/configuration"
	"github.com/AlexGustafsson/drop/internal/data"
	"github.com/AlexGustafsson/drop/internal/data/local"
	"github.com/AlexGustafsson/drop/internal/server"
	"github.com/AlexGustafsson/drop/internal/state"
	"github.com/AlexGustafsson/drop/internal/state/sqlite"
	log "github.com/sirupsen/logrus"
	"github.com/urfave/cli/v2"
)

func ServeAction(context *cli.Context) error {
	configPath := context.String("config")

	config, err := configuration.Load(configPath)
	if err != nil {
		return err
	}

	errors := configuration.Validate(config)
	if len(errors) != 0 {
		for _, err := range errors {
			log.Error(err)
		}
		return fmt.Errorf("failed to validate the configuration")
	}

	if config.LogAsJSON {
		log.SetFormatter(&log.JSONFormatter{})
	}

	secret, err := config.ConfiguredSecret()
	if err != nil {
		return err
	}

	var stateStore state.Store
	if config.Store.Adapter == "sqlite" {
		sqliteStore := sqlite.New(secret)
		err = sqliteStore.Connect(config.Store.ConnectionString)
		if err != nil {
			return err
		}
		defer sqliteStore.Disconnect()
		stateStore = sqliteStore
	}

	var dataStore data.Store
	if config.Data.Adapter == "local" {
		localStore := local.New(config.Data.Directory)
		err = localStore.Prepare()
		if err != nil {
			return err
		}
		dataStore = localStore
	}

	server := server.NewServer(stateStore, dataStore)
	server.ChunkSize = config.Server.ChunkSize

	err = server.Start(config.Address, config.Port)
	if err != nil {
		return err
	}

	return nil
}
