package logging

import (
	"encoding/json"
	"fmt"
	"time"
)

//go:generate stringer -type=LogLevel
type LogLevel uint16

const (
	INFO LogLevel = iota
	WARN
	ERROR
)

func Log(msg string, level LogLevel) error {
	output_dict := map[string]any{
		"timestamp": time.Now().Format(time.RFC3339),
		"level":     level.String(),
		"msg":       msg,
	}

	json_bytes, err := json.Marshal(output_dict)
	msg_string := string(json_bytes)

	fmt.Println(msg_string)

	return err
}
