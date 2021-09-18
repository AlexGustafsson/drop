package commands

import (
	"crypto/aes"
	"crypto/cipher"
	"encoding/hex"
	"fmt"
	"io"
	"os"

	"github.com/AlexGustafsson/drop/internal/configuration"
	"github.com/AlexGustafsson/drop/internal/data"
	"github.com/AlexGustafsson/drop/internal/data/local"
	"github.com/AlexGustafsson/drop/internal/state"
	"github.com/AlexGustafsson/drop/internal/state/sqlite"
	log "github.com/sirupsen/logrus"
	"github.com/urfave/cli/v2"
)

const (
	AES_GCM_IV_BYTES  = 12
	AES_GCM_TAG_BYTES = 16
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

	archive, archiveExists, err := stateStore.Archive(archiveId)
	if err != nil {
		return err
	}
	if !archiveExists {
		return fmt.Errorf("the specified archive does not exist")
	}

	file, fileExists, err := archive.File(fileId)
	if err != nil {
		return err
	}
	if !fileExists {
		return fmt.Errorf("the specified file does not exists")
	}

	overhead := file.EncryptedSize() - file.Size()
	chunks := overhead / (AES_GCM_IV_BYTES + AES_GCM_TAG_BYTES)
	encryptedChunkSize := file.EncryptedSize() / chunks
	decryptedChunkSize := file.Size() / chunks
	log.Debugf("File is %dB, overhead %dB. There are %d chunk(s)", file.Size(), overhead, chunks)
	log.Debugf("Encrypted buffer is %dB, decrypted buffer %dB", encryptedChunkSize, decryptedChunkSize)

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

	inputFile, err := dataStore.Reader(archiveId, fileId)
	if err != nil {
		return err
	}

	block, err := aes.NewCipher(sharedSecret)
	if err != nil {
		return err
	}

	aead, err := cipher.NewGCM(block)
	if err != nil {
		return err
	}

	encryptedBuffer := make([]byte, 0, encryptedChunkSize)
	decryptedBuffer := make([]byte, 0, decryptedChunkSize)
	for {
		length, err := io.ReadFull(inputFile, encryptedBuffer[:cap(encryptedBuffer)])
		if err != nil {
			if err == io.EOF {
				break
			}
			if err != io.ErrUnexpectedEOF {
				return err
			}
		}

		log.Debugf("Read %d encrypted bytes", length)
		nonce := encryptedBuffer[length-AES_GCM_IV_BYTES : length]
		ciphertext := encryptedBuffer[:length-AES_GCM_IV_BYTES]

		plaintext, err := aead.Open(decryptedBuffer, nonce, ciphertext, nil)
		if err != nil {
			return err
		}

		_, err = writer.Write(plaintext)
		if err != nil {
			return err
		}
	}

	return nil
}
