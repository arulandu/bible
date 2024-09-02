# Bible
A lightweight, real-time search engine for the NRSVCE bible deployed at [bible.arulandu.com](https://bible.arulandu.com) by Alvan Arulandu.

<div align="center">
<img src="https://github.com/user-attachments/assets/34601905-4ec2-4f7f-b4cf-3d7036afe14e" width="480px">
</div>

## Usage
For local deploy, simply clone the repository and open `index.html` in you browser. Hot-reload with `npx live-server`. 



## Implementation
See `/data/main.json` for a JSON representation of the NRSVCE, scraped from BibleGateway in parallel with Python/Ruby scripts available in `/scripts`. We use [uFuzzy](https://github.com/leeoniya/uFuzzy) for fast, client-side search.  

## Diagnostic
Our engine runs in ~8-18ms per query. With enough traffic, we may switch to proper fuzzy search with Redis and a fast systems language (Rust/Go).

During development, we found a bug in [biblegateway.com](https://biblegateway.com). For any single chapter book (Obadiah, Philemon, 2/3 John, Jude), searches of the form `{Book} {x}:{y}` redirect to `{Book} 1:{x}` instead of Not Found. This means that Obadiah 25:31 "exists"! The BibleGateway team has been alerted of this issue. 

## References
Thanks to `jgclark` for his BibleGateway scraping [tool](https://github.com/jgclark/BibleGateway-to-Markdown).
