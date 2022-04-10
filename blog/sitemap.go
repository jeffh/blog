package blog

import (
	"encoding/xml"
	"time"
)

type Sitemap struct {
	XMLName xml.Name `xml:"urlset"`
	Xmlns   string   `xml:"xmlns,attr"`

	URLs []SitemapURL `xml:"url"`
}

type SitemapURL struct {
	Loc        string     `xml:"loc"`
	LastMod    *time.Time `xml:"lastmod,omitempty"`
	ChangeFreq string     `xml:"changefreq,omitempty"`
	Priority   float32    `xml:"priority,omitempty"`
}

// change frequencies
const (
	ChangesAlways  = "always"
	ChangesHourly  = "hourly"
	ChangesDaily   = "daily"
	ChangesWeekly  = "weekly"
	ChangesMonthly = "monthly"
	ChangesYearly  = "yearly"
	ChangesNever   = "never"
)

func (sm *Sitemap) SetDefaults() {
	if sm.Xmlns == "" {
		sm.Xmlns = "http://www.sitemaps.org/schemas/sitemap/0.9"
	}
}
