package main

import (
	"fmt"

	"github.com/jeffh/blog/blog"
)

func main() {
	fs, err := blog.NewMemoryFS()
	if err != nil {
		panic(err)
	}
	srv, err := blog.NewServer(fs, nil, nil)
	if err != nil {
		panic(err)
	}
	const addr = ":7777"
	fmt.Printf("Listening on %s\n", addr)
	srv.ListenAndServe(addr)
}
