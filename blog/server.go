package blog

import (
	"encoding/xml"
	"fmt"
	"html/template"
	"io"
	"io/fs"
	"net/http"
	"os"
	"path/filepath"
	"strconv"
	"sync"
	"time"

	"github.com/gorilla/mux"
	"github.com/hack-pad/hackpadfs"
	"github.com/hack-pad/hackpadfs/mem"
	hpos "github.com/hack-pad/hackpadfs/os"
)

type Server struct {
	R      *mux.Router
	Store  hackpadfs.FS
	Static hackpadfs.FS

	Development bool

	page    Page
	funcs   template.FuncMap
	sitemap Sitemap

	m         sync.RWMutex
	templates map[string]*template.Template
	posts     map[string]Post
}

func NewMemoryFS() (hackpadfs.FS, error)            { return mem.NewFS() }
func NewSystemFS(root string) (hackpadfs.FS, error) { return hpos.NewFS().Sub(root) }

func NewServer(store hackpadfs.FS, static, tfs fs.FS) (*Server, error) {
	if static == nil {
		static = Static
	}
	if tfs == nil {
		tfs = Templates
	}
	srv := &Server{
		R:      mux.NewRouter(),
		Store:  store,
		Static: static,
	}
	err := srv.init(tfs)
	if err != nil {
		return nil, err
	}
	return srv, nil
}

func (s *Server) ListenAndServe(addr string) error {
	srv := http.Server{
		Handler:      s.R,
		Addr:         addr,
		WriteTimeout: 10 * time.Second,
		ReadTimeout:  10 * time.Second,
	}
	return srv.ListenAndServe()
}

func (s *Server) wrapCacheHeaders(value string, h http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if !s.Development {
			w.Header().Add("Cache-Control", value)
		}
		h.ServeHTTP(w, r)
	})
}

func (s *Server) init(tfs fs.FS) error {
	s.R.HandleFunc("/", s.handlePageList).Methods("GET").Name("post_list")
	s.R.PathPrefix("/r/").Handler(
		s.wrapCacheHeaders(
			"public, max-age=3600",
			http.StripPrefix("/r/", http.FileServer(http.FS(s.Static))),
		),
	).Name("resource")
	s.R.HandleFunc("/robots.txt", s.handleRobots).Methods("GET")
	s.R.HandleFunc("/sitemap.xml", s.handleSitemap).Methods("GET").Name("sitemap")
	s.R.HandleFunc("/about", s.handleSitemap).Methods("GET").Name("about")
	s.R.HandleFunc("/{year:[1-9][0-9]+}", s.handleRedirectToSlash).Methods("GET")
	s.R.HandleFunc("/{year:[1-9][0-9]+}/", s.handlePageList).Methods("GET").Name("post_list_by_year")
	s.R.HandleFunc("/{year:[1-9][0-9]+}/{slug}", s.handlePageSlug).Methods("GET").Name("post_detail")
	s.R.HandleFunc("/{year:[1-9][0-9]+}/{slug}/{resource}", s.handlePageSlug).Methods("GET").Name("post_detail_resource")
	s.R.HandleFunc("/a/", s.handleAdminIndex)
	s.R.HandleFunc("/a/login", s.handleAdminLogin)
	s.R.HandleFunc("/a/new", s.handleAdminPost)
	s.R.HandleFunc("/a/{slug}", s.handleAdminPost)
	s.sitemap.SetDefaults()

	mustRouteTo := func(name string, args ...string) string {
		url, err := s.R.Get(name).URL(args...)
		if err != nil {
			panic(err)
		}
		return url.String()
	}

	s.page = Page{
		SiteTitle: "jeffhui.net",
		Navigation: []NavLink{
			{Link: mustRouteTo("about"), Title: "about"},
			{Link: mustRouteTo("post_list"), Title: "writings"},
			{Link: "https://micro.jeffhui.net", Rel: "me", Title: "micro"},
			{Link: "https://github.com/jeffh", Rel: "me", Title: "github"},
		},
	}

	if s.funcs == nil {
		s.funcs = template.FuncMap{
			"url": func(routeName string, pairs ...string) (string, error) {
				url, err := s.R.Get(routeName).URL(pairs...)
				if err != nil {
					return "", err
				}
				return url.String(), nil
			},
			"strtime": func(t time.Time, layout string) string {
				return t.Format(layout)
			},
		}
	}
	s.templates = make(map[string]*template.Template)
	entries, err := fs.ReadDir(tfs, ".")
	if err != nil {
		return err
	}
	for _, ent := range entries {
		if ent.IsDir() {
			continue
		}
		tmpl, err := template.New(ent.Name()).Funcs(s.funcs).ParseFS(tfs, ent.Name(), "layout/*.html")
		if err != nil {
			return err
		}
		s.templates[ent.Name()] = tmpl
	}

	if s.posts == nil {
		s.posts = make(map[string]Post)
		hackpadfs.MkdirAll(s.Store, "posts", 0777)
		err = hackpadfs.WalkDir(s.Store, "posts", func(path string, d fs.DirEntry, err error) error {
			if err != nil {
				return err
			}
			return nil
		})
		if err != nil {
			return err
		}
	}
	return err
}

func (s *Server) handleRedirectToSlash(w http.ResponseWriter, req *http.Request) {
	http.Redirect(w, req, req.URL.Path+"/", http.StatusTemporaryRedirect)
}

func (s *Server) handleIndex(w http.ResponseWriter, req *http.Request) {
	url, err := s.R.Get("post_list").URL()
	if err == nil {
		w.Header().Add("Location", url.String())
	} else {
		panic(fmt.Errorf("unreachable: %w", err))
	}
	w.WriteHeader(http.StatusTemporaryRedirect)
}
func (s *Server) handlePageList(w http.ResponseWriter, req *http.Request) {
	var posts []Post
	s.m.Lock()
	for _, post := range s.posts {
		posts = append(posts, post)
	}
	s.m.Unlock()

	w.Header().Add("Content-Type", "text/html; charset=UTF-8")
	w.WriteHeader(http.StatusOK)

	type Content struct {
		PostsBySection Index
	}

	pg := s.page
	pg.Content = Content{
		PostsBySection: IndexPosts(time.Now(), posts),
	}

	if err := s.templates["post_list.html"].Execute(w, pg); err != nil {
		fmt.Fprintf(os.Stderr, "failed to render template(list): %s", err.Error())
	}
}
func (s *Server) handlePageSlug(w http.ResponseWriter, req *http.Request) {
	vars := mux.Vars(req)
	slug := vars["slug"]
	resource := vars["resource"]

	if !isValidSlug(slug) || !isValidSlug(resource) {
		http.Error(w, "no such post exists", http.StatusBadRequest)
		return
	}

	post, ok := s.posts[slug]
	if !ok {
		http.Error(w, "no such post exist", http.StatusNotFound)
		return
	}

	header := w.Header()
	header.Add("Content-Type", "text/html; charset=UTF-8")
	w.WriteHeader(http.StatusOK)

	type Content struct {
		Post    Post
		Section Section
	}

	pg := s.page
	pg.Content = Content{
		Post: post,
		Section: Section{
			Slug:      strconv.Itoa(post.PubDate.Year()),
			SortOrder: post.PubDate.Year(),
		},
	}
	if err := s.templates["post_detail.html"].Execute(w, pg); err != nil {
		fmt.Fprintf(os.Stderr, "failed to render template(detail): %s", err.Error())
	}
}
func (s *Server) handleAdminIndex(w http.ResponseWriter, req *http.Request) {}
func (s *Server) handleAdminLogin(w http.ResponseWriter, req *http.Request) {}

func (s *Server) handleAdminPost(w http.ResponseWriter, req *http.Request) {
	const maxAllowedSize = 1024 * 1024 * 1 // 1 MB
	// TODO(jeff): auth

	if req.Method != "POST" {
		http.Error(w, "only POST is allowed", http.StatusMethodNotAllowed)
		return
	}
	if req.Body == nil {
		http.Error(w, "missing post data", http.StatusBadRequest)
		return
	}

	if err := req.ParseMultipartForm(maxAllowedSize); err != nil {
		http.Error(w, "upload too large: "+err.Error(), http.StatusBadRequest)
		return
	}

	file, handler, err := req.FormFile("file")
	if err != nil {
		http.Error(w, "upload too large: "+err.Error(), http.StatusBadRequest)
		return
	}
	defer file.Close()

	if err := hackpadfs.MkdirAll(s.Store, "posts", 0666); err != nil {
		http.Error(w, "failed to create dir: "+err.Error(), http.StatusInternalServerError)
		return
	}

	fpath := filepath.Join("posts", handler.Filename)
	f, err := hackpadfs.Create(s.Store, fpath)
	if err != nil {
		http.Error(w, "failed to write file: "+err.Error(), http.StatusInternalServerError)
		return
	}
	defer f.Close()

	_, err = io.Copy(f.(io.Writer), file)
	if err != nil {
		http.Error(w, "failed to write file: "+err.Error(), http.StatusInternalServerError)
		return
	}

	post, err := ReadMarkdown(s.Store, fpath)
	if err != nil {
		hackpadfs.Remove(s.Store, fpath)
		http.Error(w, "failed to parse file: "+err.Error(), http.StatusBadRequest)
		return
	}

	s.m.Lock()
	{
		s.posts[post.Slug] = post
	}
	s.m.Unlock()

	url, err := s.R.Get("post_detail").URL("year", strconv.Itoa(post.PubDate.Year()), "slug", post.Slug)
	var path string
	if err != nil {
		fmt.Fprintf(os.Stderr, "err getting url: %s\n", err.Error())
		path = "/"
	} else {
		path = url.String()
	}
	http.Redirect(w, req, path, http.StatusSeeOther)
}

func (s *Server) handleRobots(w http.ResponseWriter, req *http.Request) {
	w.Header().Add("Content-Type", "text/plain; charset=UTF-8")
	w.WriteHeader(http.StatusOK)

	_, err := fmt.Fprintf(w, `
User-agent: *
Disallow: /a/*
`)
	fmt.Fprintf(os.Stderr, "failed to write response: %s", err)
}
func (s *Server) handleSitemap(w http.ResponseWriter, req *http.Request) {
	w.Header().Add("Content-Type", "text/xml; charset=UTF-8")
	w.WriteHeader(http.StatusOK)
	w.Write([]byte(xml.Header))
	en := xml.NewEncoder(w)
	en.Indent("", "  ")
	if err := en.Encode(s.sitemap); err != nil {
		fmt.Fprintf(os.Stderr, "failed to encode xml: %s", err)
	}
	en.Flush()
	w.Write([]byte{'\n'})
}

func isValidSlug(slug string) bool {
	for _, c := range slug {
		if ('a' <= c && c <= 'z') || ('A' <= c && c <= 'Z') || ('0' <= c && c <= '9') || c == '-' || c == '.' {
		} else {
			return false
		}
	}
	return true
}

type Page struct {
	SiteTitle  string
	Navigation []NavLink
	Content    interface{}
	LoggedIn   bool
}

func (pg Page) Now() time.Time   { return time.Now() }
func (pg Page) ThisYear() string { return strconv.Itoa(time.Now().Year()) }

type NavLink struct {
	Link  string
	Rel   string
	Title string
}
