# Work Register query-state contract `v0.1`

Date: 2026-07-15  
Canonical route: `/work/`

## Parameters

| Parameter | Shape | Valid values |
| --- | --- | --- |
| `q` | one bounded string | normalized nonempty text, maximum 120 code units |
| `category` | repeated | `software`, `visual-system`, `art`, `technical-system`, `limited-media` |
| `maintenance` | repeated | content-model maintenance values present in the corpus |
| `evidence` | repeated | `none` or content-model evidence trust values present in the corpus |
| `sort` | one value | `curated`, `recent`, `title` |

Unknown parameters do not enter register state. The first valid `sort` wins;
missing or invalid sort becomes `curated`. Empty query text is omitted.
Duplicate repeated values are removed and values serialize in governed enum
order. Whitespace collapses to one space. The same logical state therefore
produces the same query string.

Example:

```text
/work/?q=local+tool&category=software&category=art&maintenance=active&sort=recent
```

## Retrieval semantics

Search terms combine with AND. Category, maintenance, and evidence groups also
combine with AND. Multiple selected values within a single group combine with
OR. Search normalization is Unicode-safe, case-insensitive, whitespace-safe,
and diacritic-insensitive; source labels remain unmodified for display.

`curated` restores server order. `recent` sorts descending by the public date
key and then curated index/ID. `title` sorts by normalized title and then ID.
All sort functions copy their input and use ASCII comparisons.

## History and controls

Explicit Apply and Reset create one `pushState` entry. Initial URL cleanup uses
`replaceState`. No keypress or checkbox focus changes history. Back and forward
parse the current URL and restore form values, result visibility/order, count,
constraints, and empty state. Focus stays on the control the visitor used.

Reset removes every register parameter, restores curated order, shows the full
corpus, and returns the canonical `/work/` URL. Initial normalization and
history restoration do not throw invalid input into the UI.

## Indexing and no-JavaScript

Query states are interactions rather than indexable documents. The canonical
is always `/work/`. The route remains `noindex` while the corpus is empty or no
valid detail destination exists.

Without JavaScript, query controls are not exposed and all records remain
visible in canonical order. Category links provide basic within-page browsing.
The URL state has no server-side filtering effect and makes no network promise.

## Announcements

The persistent visible summary states total/visible count and active
constraints. A separate `aria-live="polite"` region announces only explicit
Apply, Reset, back, or forward restoration. Initialization, typing, focus,
checkbox navigation, and internal sort work are silent.
