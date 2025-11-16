# JSON Previewer

`json-previewer` is a Visual Studio Code extension designed to make working with JSON data easier and more efficient. With this extension, you can **generate sample JSON tables**, **define custom fields**, and **preview JSON content as a simple table** directly inside VS Code.

## Features

- **Hello World**  
  A simple command to display a “Hello World” message as a demonstration of the extension’s functionality.

- **Generate JSON Data**  
  Quickly generate a JSON array of objects with a specified number of rows and columns, using auto-named fields (`col1`, `col2`, …).

- **Generate Custom JSON Data**  
  Create JSON tables with user-defined field names (comma-separated).

- **Preview JSON as Table**  
  Open any JSON file (or selection) and preview the data in a simple, scrollable table view.

- **Search in Table**  
  Filter rows in the previewed table by typing in the search bar.

- **Export to CSV**  
  Export the previewed data into CSV:

  - Export **current view** (filtered rows).
  - Export **all rows**.

- **Sortable Columns**  
  Click any column header to toggle ascending/descending order.  
  Automatically detects numeric vs. text sorting.

- **Resizable Columns**
  Drag the right edge of a column header to adjust column width.

- **Pagination for Large Tables**
  Improves performance when previewing large datasets:
  - Navigate with **Previous / Next** page controls.
  - Displays row range and total count.
  - Future versions will support adjustable page size.

## How to Use

1. Install the extension from the VS Code Marketplace.
2. Open the Command Palette (`Cmd+Shift+P` on macOS or `Ctrl+Shift+P` on Windows/Linux).
3. Use one of the following commands:
   - `JSON Previewer: Hello World`
   - `JSON Previewer: Generate JSON Data`
   - `JSON Previewer: Generate Custom JSON Data`
   - `JSON Previewer: Preview JSON as Table`

## Requirements

- No additional dependencies required.

## Extension Settings

Currently, this extension does not contribute any settings.  
Future updates may include customizable options (e.g., preview style, default row count, column width).

## Known Issues

- Table preview does not support nested objects/arrays (they are displayed as JSON strings).
- Sorting and advanced filtering are not yet implemented.
- No pagination for very large datasets.

## Release Notes

### 0.3.0

- Added sortable column headers (click to sort).
- Added draggable column width.
- Added pagination for faster rendering of large datasets.
- Improved preview UI layout and performance.

### 0.2.0

- Implemented **search filter** for previewed tables.
- Implemented **CSV export** (current view / all rows).

### 0.1.0

- Initial release with Hello World command and basic JSON table generation.
- Added support for generating JSON tables with custom fields.
- Added simple JSON table preview.

---

## Contributing

Contributions are welcome! Please fork the repository and submit a pull request.

## License

This extension is licensed under the [MIT License](LICENSE).

**Enjoy using JSON Previewer!**
