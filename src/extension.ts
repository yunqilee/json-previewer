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
        prompt: "请输入行数",
        validateInput: (v) =>
          /^\d+$/.test(v) && Number(v) > 0 ? null : "必须输入正整数",
      });
      if (!rowsStr) {
        return;
      }

      const colsStr = await vscode.window.showInputBox({
        prompt: "请输入列数",
        validateInput: (v) =>
          /^\d+$/.test(v) && Number(v) > 0 ? null : "必须输入正整数",
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
        prompt: "输入字段名（用英文逗号分隔），例如：id, name, age",
        placeHolder: "id, name, age",
        validateInput: (v) => {
          const parts = v
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean);
          if (!parts.length) {
            return "至少提供一个字段名";
          }
          if (parts.some((p) => /[\s]/.test(p))) {
            return "字段名不要包含空白字符（请用逗号分隔）";
          }
          return null;
        },
      });
      if (!fieldStr) {
        return;
      }

      const rowsStr = await vscode.window.showInputBox({
        prompt: "请输入行数",
        validateInput: (v) =>
          /^\d+$/.test(v) && Number(v) > 0 ? null : "必须输入正整数",
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
        vscode.window.showErrorMessage("没有活动的编辑器，无法读取 JSON。");
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
          "当前内容不是合法的 JSON。请选中或打开一个有效的 JSON。"
        );
        return;
      }

      if (!Array.isArray(data)) {
        data = [data];
      }

      // 计算表头（合并所有对象/数组的 key）
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

      panel.webview.html = getWebviewHtml(panel.webview, headers, data);
    }
  );

  context.subscriptions.push(previewTableDisposable);
}

// This method is called when your extension is deactivated
export function deactivate() {}
