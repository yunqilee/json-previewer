// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import { openJsonDoc, getWebviewHtml } from "./utils";

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated
  console.log(
    'Congratulations, your extension "json-previewer" is now active!'
  );

  // The command has been defined in the package.json file
  // Now provide the implementation of the command with registerCommand
  // The commandId parameter must match the command field in package.json
  const disposable = vscode.commands.registerCommand(
    "json-previewer.helloWorld",
    () => {
      // The code you place here will be executed every time your command is executed
      // Display a message box to the user
      vscode.window.showInformationMessage("Hello World from json-previewer!");
    }
  );

  context.subscriptions.push(disposable);

  const generateDisposable = vscode.commands.registerCommand(
    "json-previewer.generateJSON",
    async () => {
      const rowsStr = await vscode.window.showInputBox({
        prompt: "Enter the number of rows",
        validateInput: (v) =>
          /^\d+$/.test(v) && Number(v) > 0
            ? null
            : "Please enter a positive integer",
      });
      if (!rowsStr) {
        return;
      }

      const colsStr = await vscode.window.showInputBox({
        prompt: "Enter the number of columns",
        validateInput: (v) =>
          /^\d+$/.test(v) && Number(v) > 0
            ? null
            : "Please enter a positive integer",
      });
      if (!colsStr) {
        return;
      }

      const rows = Number(rowsStr);
      const cols = Number(colsStr);

      const fields = Array.from({ length: cols }, (_, i) => `col${i + 1}`);
      const data = Array.from({ length: rows }, (_, r) => {
        const obj: Record<string, string> = {};
        fields.forEach((f, c) => {
          obj[f] = `r${r + 1}c${c + 1}`;
        });
        return obj;
      });

      openJsonDoc(data);
    }
  );

  context.subscriptions.push(generateDisposable);

  const generateCustomDisposable = vscode.commands.registerCommand(
    "json-previewer.generateCustomJSON",
    async () => {
      const fieldStr = await vscode.window.showInputBox({
        prompt: "Enter field names (comma separated), e.g., id, name, age",
        placeHolder: "id, name, age",
        validateInput: (v) => {
          const parts = v
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean);
          if (!parts.length) {
            return "Please provide at least one field name";
          }
          if (parts.some((p) => /[\s]/.test(p))) {
            return "Field names should not contain whitespace (please separate with commas)";
          }
          return null;
        },
      });
      if (!fieldStr) {
        return;
      }

      const rowsStr = await vscode.window.showInputBox({
        prompt: "Enter the number of rows",
        validateInput: (v) =>
          /^\d+$/.test(v) && Number(v) > 0
            ? null
            : "Please enter a positive integer",
      });
      if (!rowsStr) {
        return;
      }
      const rows = Number(rowsStr);

      const fields = fieldStr
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      const data = Array.from({ length: rows }, (_, r) => {
        const obj: Record<string, string | number | boolean | null> = {};
        fields.forEach((f) => {
          obj[f] = `r${r + 1}-${f}`;
        });
        return obj;
      });

      await openJsonDoc(data);
    }
  );
  context.subscriptions.push(generateCustomDisposable);

  const previewTableDisposable = vscode.commands.registerCommand(
    "json-previewer.previewTable",
    async () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) {
        vscode.window.showErrorMessage(
          "No active editor found. Unable to read JSON."
        );
        return;
      }

      const sel = editor.selection;
      const raw =
        sel && !sel.isEmpty
          ? editor.document.getText(sel)
          : editor.document.getText();

      let data: any;
      try {
        data = JSON.parse(raw);
      } catch {
        vscode.window.showErrorMessage(
          "The current content is not valid JSON. Please select or open a valid JSON."
        );
        return;
      }

      if (!Array.isArray(data)) {
        data = [data];
      }

      const headersSet = new Set<string>();
      for (const row of data) {
        if (Array.isArray(row)) {
          row.forEach((_, idx) => headersSet.add(String(idx)));
        } else if (row && typeof row === "object") {
          Object.keys(row).forEach((k) => headersSet.add(k));
        } else {
          headersSet.add("value");
        }
      }
      const headers = Array.from(headersSet);

      const panel = vscode.window.createWebviewPanel(
        "jsonPreviewerTable",
        "JSON Table Preview",
        vscode.ViewColumn.Beside,
        { enableScripts: true, retainContextWhenHidden: true }
      );

      panel.webview.html = getWebviewHtml(
        panel.webview,
        context.extensionUri,
        headers,
        data
      );
    }
  );

  context.subscriptions.push(previewTableDisposable);
}

// This method is called when your extension is deactivated
export function deactivate() {}
