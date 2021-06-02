package configuration

import (
	"bytes"
	"crypto/rand"
	"io/ioutil"
)

type Configuration struct {
	Address string `koanf:"address"`
	Port    uint16 `koanf:"port"`
	secret  struct {
		value string `koanf:"value"`
		file  string `koanf:"file"`
		cache []byte
	} `koanf:"secret"`
}

// Secret returns the configured secret
func (config *Configuration) Secret() ([]byte, error) {
	if config.secret.cache != nil {
		return config.secret.cache, nil
	}

	if config.secret.value != "" {
		config.secret.cache = []byte(config.secret.value)
		return config.secret.cache, nil
	}

	if config.secret.file != "" {
		buffer, err := ioutil.ReadFile(config.secret.file)
		if err != nil {
			return nil, err
		}

		config.secret.cache = bytes.TrimSpace(buffer)
		return config.secret.cache, nil
	}

	buffer := make([]byte, 32)
	rand.Read(buffer)
	config.secret.cache = buffer
	return config.secret.cache, nil
}
