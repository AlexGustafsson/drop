package configuration

import "fmt"

func Validate(config *Configuration) []error {
	errors := make([]error, 0)

	if config.Secret.Value != "" && config.Secret.File != "" {
		errors = append(errors, fmt.Errorf("The secret value and secret file are mutually exclusive"))
	}

	secret, err := config.ConfiguredSecret()
	if err != nil {
		errors = append(errors, fmt.Errorf("Unable to read secret: %v", err))
	} else {
		if len(secret) < 32 {
			errors = append(errors, fmt.Errorf("The size of the secret must not be less then 32 bytes"))
		}
	}

	if config.Store.Adapter != "memory" && config.Store.Adapter != "sqlite" {
		errors = append(errors, fmt.Errorf("Unsupported store adapter '%s'", config.Store.Adapter))
	}

	if config.Store.Adapter != "sqlite" && config.Store.ConnectionString != "" {
		errors = append(errors, fmt.Errorf("Specifying a connection string has no use with adapter '%s'", config.Store.Adapter))
	}

	if config.Store.Adapter == "sqlite" && config.Store.ConnectionString == "" {
		errors = append(errors, fmt.Errorf("A connection string must be specified when using adapter '%s'", config.Store.Adapter))
	}

	if config.Server.ChunkSize <= 1024 {
		errors = append(errors, fmt.Errorf("The server chunk size may not be less than 1024"))
	}

	if config.Server.ChunkSize%64 != 0 {
		errors = append(errors, fmt.Errorf("The server chunk size must be evenly divisible by 64"))
	}

	return errors
}
