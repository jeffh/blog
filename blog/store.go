package blog

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"html/template"
	"path/filepath"
	"sort"
	"strconv"
	"strings"
	"time"

	"github.com/hack-pad/hackpadfs"
	"github.com/yuin/goldmark"
	highlighting "github.com/yuin/goldmark-highlighting"
	meta "github.com/yuin/goldmark-meta"
	"github.com/yuin/goldmark/extension"
	"github.com/yuin/goldmark/parser"
	"github.com/yuin/goldmark/renderer/html"

	"github.com/alecthomas/chroma"
	fhtml "github.com/alecthomas/chroma/formatters/html"
	"github.com/alecthomas/chroma/styles"
)

type Index struct {
	Sections []Section `json:"sections"`
	Drafts   []Post
}

func IndexPosts(now time.Time, posts []Post) Index {
	idx := Index{}
	sections := make(map[int]Section)
	for _, post := range posts {
		if post.PubDate.After(now) {
			idx.Drafts = append(idx.Drafts, post)
		} else {
			year := post.PubDate.Year()
			sec, ok := sections[year]
			if !ok {
				sec = Section{
					Slug:      strconv.Itoa(year),
					SortOrder: year,
					Posts:     nil,
				}
			}
			sec.Posts = append(sec.Posts, post)
			sections[year] = sec
		}
	}
	idx.Sections = make([]Section, 0, len(sections))
	for _, sec := range sections {
		idx.Sections = append(idx.Sections, sec)
	}
	sort.Reverse(sectionSlice(idx.Sections))
	return idx
}

type sectionSlice []Section

func (s sectionSlice) Len() int           { return len(s) }
func (s sectionSlice) Less(i, j int) bool { return s[i].SortOrder < s[j].SortOrder }
func (s sectionSlice) Swap(i, j int)      { s[i], s[j] = s[j], s[i] }

type Section struct {
	Slug      string `json:"slug"`
	SortOrder int    `json:"sort_order"`
	Posts     []Post `json:"posts"`
}

type Author struct {
	Name    string
	Website string
}

type Post struct {
	Id      int           `json:"id"`
	Slug    string        `json:"slug"`
	Title   string        `json:"title"`
	PubDate time.Time     `json:"pub_date"`
	Summary string        `json:"summary"`
	Content string        `json:"content"`
	HTML    template.HTML `json:"html"`
	Author  *Author       `json:"author"`

	Tags     []string `json:"tags"`
	FilePath string   `json:"source"`
}

func (p Post) PubDateForAttribute() string { return p.PubDate.Format("2006-01-02") }
func (p Post) PubDateOnlyMonthDay() string { return p.PubDate.Format("Jan 2") }
func (p Post) PubDateString() string       { return p.PubDate.Format("January 2, 2006") }

func WriteJSON(ctx context.Context, s hackpadfs.FS, path string, value interface{}) error {
	buf, err := json.Marshal(value)
	if err != nil {
		return err
	}
	f, err := hackpadfs.Create(s, path)
	if err != nil {
		return err
	}
	_, err = hackpadfs.WriteFile(f, buf)
	return err
}

func ReadJSON(ctx context.Context, s hackpadfs.FS, path string, out interface{}) error {
	buf, err := hackpadfs.ReadFile(s, path)
	if err != nil {
		return err
	}
	return json.Unmarshal(buf, out)
}

func mustBuildStyle(s *chroma.StyleBuilder) *chroma.Style {
	out, err := s.Build()
	if err != nil {
		panic(err)
	}
	return out
}

var markdown = goldmark.New(
	goldmark.WithExtensions(
		extension.GFM,
		extension.DefinitionList,
		extension.Footnote,
		meta.Meta,
		highlighting.NewHighlighting(
			highlighting.WithCustomStyle(mustBuildStyle(styles.GitHub.Builder().AddAll(
				chroma.StyleEntries{
					chroma.Background: "bg:#ffe",
				},
			))),
			highlighting.WithFormatOptions(
				fhtml.WithLineNumbers(true),
			),
			highlighting.WithGuessLanguage(true),
		),
	),
	goldmark.WithRendererOptions(
		html.WithUnsafe(),
	),
)

func ParseMarkdown(path string, p []byte) (Post, error) {
	var buf bytes.Buffer
	context := parser.NewContext()
	if err := markdown.Convert([]byte(p), &buf, parser.WithContext(context)); err != nil {
		panic(err)
	}
	md := meta.Get(context)
	var author *Author
	if auth, ok := md["author"]; ok {
		if auth, ok := auth.(map[interface{}]interface{}); ok {
			getStringI := func(m map[interface{}]interface{}, key string) string {
				if v, ok := m[key]; ok {
					if v, ok := v.(string); ok {
						return v
					}
				}
				return ""
			}
			author = &Author{
				Name:    getStringI(auth, "name"),
				Website: getStringI(auth, "Website"),
			}
		}
	}
	var date time.Time
	if value, ok := md["date"]; ok {
		if value, ok := value.(string); ok {
			var err error
			date, err = time.Parse("2006-1-2", value)
			if err != nil {
				return Post{}, fmt.Errorf("failed to parse 'date' in metadata: %w", err)
			}
		} else {
			return Post{}, fmt.Errorf("failed to parse 'date' in metadata: value should be a string")
		}
	}

	getString := func(m map[string]interface{}, key string) string {
		if v, ok := m[key]; ok {
			if v, ok := v.(string); ok {
				return v
			}
		}
		return ""
	}

	getStrings := func(m map[string]interface{}, key string) []string {
		if v, ok := m[key]; ok {
			if v, ok := v.([]string); ok {
				return v
			}
		}
		return nil
	}
	title := getString(md, "title")
	slug := getString(md, "slug")
	if slug == "" {
		slug = filepath.Base(path)
		i := strings.LastIndex(slug, ".")
		if i != -1 {
			slug = slug[:i]
		}
	}
	post := Post{
		Title:   title,
		Slug:    slug,
		Author:  author,
		Summary: getString(md, "summary"),
		PubDate: date,
		Content: string(p),
		HTML:    template.HTML(buf.String()),
		Tags:    getStrings(md, "tags"),
	}
	fmt.Printf("POST: %#v -- %#v\n", md, post.PubDate)
	return post, nil
}

func ReadMarkdown(s hackpadfs.FS, path string) (Post, error) {
	p, err := hackpadfs.ReadFile(s, path)
	if err != nil {
		return Post{}, err
	}
	return ParseMarkdown(path, p)
}
