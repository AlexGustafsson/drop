package configuration

import "fmt"

func Validate(config *Configuration) []error {
	errors := make([]error, 0)

	if config.Secret.Value != "" && config.Secret.File != "" {
		errors = append(errors, fmt.Errorf("the secret value and secret file are mutually exclusive"))
	}

	secret, err := config.ConfiguredSecret()
	if err != nil {
		errors = append(errors, fmt.Errorf("unable to read secret: %v", err))
	} else {
		if len(secret) != 32 {
			errors = append(errors, fmt.Errorf("the size of the secret must be 32 bytes"))
		}
	}

	if config.Store.Adapter != "sqlite" {
		errors = append(errors, fmt.Errorf("unsupported store adapter '%s'", config.Store.Adapter))
	}

	if config.Store.Adapter != "sqlite" && config.Store.ConnectionString != "" {
		errors = append(errors, fmt.Errorf("specifying a connection string has no use with adapter '%s'", config.Store.Adapter))
	}

	if config.Store.Adapter == "sqlite" && config.Store.ConnectionString == "" {
		errors = append(errors, fmt.Errorf("a connection string must be specified when using adapter '%s'", config.Store.Adapter))
	}

	if config.Server.ChunkSize <= 1024 {
		errors = append(errors, fmt.Errorf("the server chunk size may not be less than 1024"))
	}

	if config.Server.ChunkSize%64 != 0 {
		errors = append(errors, fmt.Errorf("the server chunk size must be evenly divisible by 64"))
	}

	if config.Data.Adapter == "local" && config.Data.Directory == "" {
		errors = append(errors, fmt.Errorf("a directory required for the '%s' adapter", config.Data.Adapter))
	}

	if config.Data.Adapter == "" {
		errors = append(errors, fmt.Errorf("a data adapter must be specified"))
	} else {
		if config.Data.Adapter != "local" {
			errors = append(errors, fmt.Errorf("unsupported data adapter '%s'", config.Data.Adapter))
		}
	}

	return errors
}
