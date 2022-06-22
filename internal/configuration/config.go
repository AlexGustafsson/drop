package configuration

import (
	"bytes"
	"crypto/rand"
	"encoding/hex"
	"io/ioutil"

	log "github.com/sirupsen/logrus"
)

type Configuration struct {
	Address   string `koanf:"address"`
	Port      uint16 `koanf:"port"`
	LogAsJSON bool   `koanf:"logAsJSON"`
	Secret    struct {
		Value string `koanf:"value"`
		File  string `koanf:"file"`
		cache []byte
	} `koanf:"secret"`
	Store struct {
		Adapter          string `koanf:"adapter"`
		ConnectionString string `koanf:"connectionString"`
	} `koanf:"store"`
	Server struct {
		ChunkSize int `koanf:"chunkSize"`
	} `koanf:"server"`
	Data struct {
		Adapter   string `koanf:"adapter"`
		Directory string `koanf:"directory"`
	} `koanf:"data"`
}

// ConfiguredSecret returns the configured secret
func (config *Configuration) ConfiguredSecret() ([]byte, error) {
	if config.Secret.cache != nil {
		return config.Secret.cache, nil
	}

	if config.Secret.Value != "" {
		secret, err := hex.DecodeString(config.Secret.Value)
		if err != nil {
			return nil, err
		}

		config.Secret.cache = secret
		log.Debug("Configured secret by value")
		return config.Secret.cache, nil
	}

	if config.Secret.File != "" {
		buffer, err := ioutil.ReadFile(config.Secret.File)
		if err != nil {
			return nil, err
		}

		config.Secret.cache = bytes.TrimSpace(buffer)
		secret, err := hex.DecodeString(config.Secret.Value)
		if err != nil {
			return nil, err
		}

		config.Secret.cache = secret
		log.Debug("Configured secret from file")
		return config.Secret.cache, nil
	}

	buffer := make([]byte, 32)
	rand.Read(buffer)
	config.Secret.cache = buffer
	log.Debug("Generated secret")
	return config.Secret.cache, nil
}
