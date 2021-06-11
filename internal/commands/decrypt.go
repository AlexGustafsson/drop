package commands

import (
	"encoding/hex"
	"fmt"
	"io"
	"os"

	"golang.org/x/crypto/chacha20"

	"github.com/AlexGustafsson/drop/internal/configuration"
	"github.com/AlexGustafsson/drop/internal/data"
	"github.com/AlexGustafsson/drop/internal/data/local"
	"github.com/AlexGustafsson/drop/internal/state"
	"github.com/AlexGustafsson/drop/internal/state/sqlite"
	log "github.com/sirupsen/logrus"
	"github.com/urfave/cli/v2"
)

func decryptCommand(context *cli.Context) error {
	configPath := context.String("config")
	archiveId := context.String("archive")
	fileId := context.String("file")
	outputFilePath := context.String("output")
	sharedSecretHex := context.String("secret")

	sharedSecret, err := hex.DecodeString(sharedSecretHex)
	if err != nil {
		return err
	}

	config, err := configuration.Load(configPath)
	if err != nil {
		return err
	}

	errors := configuration.Validate(config)
	if len(errors) != 0 {
		for _, err := range errors {
			log.Error(err)
		}
		return fmt.Errorf("Failed to validate the configuration")
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

	archive, archiveExists, err := stateStore.Archive(archiveId)
	if err != nil {
		return err
	}
	if !archiveExists {
		return fmt.Errorf("The specified archive does not exist")
	}

	file, fileExists, err := archive.File(fileId)
	if err != nil {
		return err
	}
	if !fileExists {
		return fmt.Errorf("The specified file does not exists")
	}

	nonce := file.Nonce()
	nonceBytes, err := hex.DecodeString(nonce)
	if err != nil {
		return err
	}

	var writer io.Writer

	if outputFilePath == "" {
		writer = os.Stdout
	} else {
		file, err := os.OpenFile(outputFilePath, os.O_CREATE|os.O_WRONLY, 0660)
		if err != nil {
			return err
		}
		defer file.Close()
		writer = file
	}

	cipher, err := chacha20.NewUnauthenticatedCipher(sharedSecret, nonceBytes)
	if err != nil {
		return err
	}

	inputFile, err := dataStore.Reader(archiveId, fileId)
	if err != nil {
		return err
	}

	chunkSize := 1024 * 1024
	buffer := make([]byte, 0, chunkSize)
	offset := 0
	for {
		length, err := io.ReadFull(inputFile, buffer[:cap(buffer)])
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

		// TODO: What if a block is cut off between chunks?
		cipher.SetCounter(1 + uint32(offset/64))
		plaintext := make([]byte, length)
		cipher.XORKeyStream(plaintext, buffer)
		offset += length
		_, err = writer.Write(plaintext)
		if err != nil {
			return err
		}
	}

	return nil
}

func min(a, b int) int {
	if a < b {
		return a
	}
	return b
}
