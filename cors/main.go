package main

import (
	"net/http"

	"github.com/rs/cors"
)

func main() {
	mux := http.NewServeMux()
	mux.Handle("/", http.FileServer(http.Dir("./docs")))
	http.ListenAndServe(":80", cors.AllowAll().Handler(mux))
}
