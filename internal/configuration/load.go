package configuration

import (
	"github.com/knadh/koanf"
	"github.com/knadh/koanf/parsers/yaml"
	"github.com/knadh/koanf/providers/confmap"
	"github.com/knadh/koanf/providers/file"
)

func Defaults() *Configuration {
	return &Configuration{
		Address: "",
		Port:    8080,
	}
}

func Load(filePath string) (*Configuration, error) {
	k := koanf.New(".")

	defaults := confmap.Provider(map[string]interface{}{
		"address":          "",
		"port":             "8080",
		"store.adapter":    "memory",
		"server.chunkSize": "1048576", // 1MiB
		"frontend":         "./frontend/dist",
	}, ".")
	err := k.Load(defaults, nil)
	if err != nil {
		return nil, err
	}

	provider := file.Provider(filePath)
	err = k.Load(provider, yaml.Parser())
	if err != nil {
		return nil, err
	}

	config := &Configuration{}
	err = k.UnmarshalWithConf("", &config, koanf.UnmarshalConf{Tag: "koanf"})
	if err != nil {
		return nil, err
	}

	return config, nil
}
