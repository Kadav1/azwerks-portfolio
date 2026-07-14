# Project relation reference v0.1

Relations are strict JSON entries with `schemaVersion`, `id`, `from`, `to`, `type`, `direction`, `summary`, `visibility`, and `synthetic`. IDs and endpoints are stable lowercase kebab-case. The summary is a required rationale; visual weights and atlas coordinates are prohibited.

Directed types are `lineage`, `dependency`, `supersedes`, and `supports`. Undirected types are `related`, `shared-method`, and `family`. Self-relations, missing endpoints, duplicate IDs, duplicate directed edges, and reversed duplicate undirected edges fail. Public relations cannot expose private endpoints.

Typed helpers provide incoming relations, outgoing relations, undirected neighbors, labels, deterministic sorting, and public filtering. Relations do not prescribe UI geometry.
