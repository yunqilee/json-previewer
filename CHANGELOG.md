# Changelog

All notable changes to the **json-previewer** extension will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.3.0] - 2025-11-16

### Added

- Implemented **column sorting** in table preview.
  - Click a column header to sort ascending/descending.
  - Automatically detects numeric vs text comparison.
- Added **resizable columns**.
  - Drag the right edge of a column header to adjust width.
- Added **pagination** for large datasets.
  - Default page size: 10 rows (configurable in future versions).
  - Includes Previous/Next page navigation.
- Improved search filter behavior to integrate with sorting and pagination.

### Changed

- Refactored preview script into `preview.js` for cleaner separation of logic and HTML.
- Improved preview UI spacing and control layout.

## [0.2.0] - 2025-10-08

### Added

- Implemented **search filter** for previewed tables.
- Added **CSV export** feature:
  - Export current view (filtered rows).
  - Export all rows.

## [0.1.0] - 2025-10-06

### Added

- Initial release of `json-previewer`.
- **Hello World** command.
- Generate JSON table with **rows × cols** and auto-named fields (`col1`, `col2`, ...).
- Support for generating JSON tables with **custom fields** (comma-separated).
- Added **simple table preview** for JSON data inside VS Code.
