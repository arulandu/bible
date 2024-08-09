# Bible
Better search for the NRSVCE. 

## Design Decisions
- Footnotes are labeled w.r.t. the verse. 

## Things we found
- Any book with a single chapter gets mishandled by BibleGateway such that Obadiah {x}:{y} will redirect to Obadiah 1:{x} when it should give an error. This is true for Obadiah, Philemon, 2 John, 3 John, and Jude. 