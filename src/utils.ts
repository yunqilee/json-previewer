import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";

export async function openJsonDoc(data: unknown) {
  const pretty = JSON.stringify(data, null, 2);
  const doc = await vscode.workspace.openTextDocument({
    content: pretty,
    language: "json",
  });
  await vscode.window.showTextDocument(doc, { preview: false });
}

export function getWebviewHtml(
  webview: vscode.Webview,
  extensionUri: vscode.Uri,
  headers: string[],
  rows: any[]
): string {
  const nonce = String(Math.random()).slice(2);

  const escape = (s: unknown) => {
    const str = s === null || s === undefined ? "" : String(s);
    return str
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#39;");
  };

  // 预生成表头与行（最小实现）
  const thead = headers.map((h) => `<th>${escape(h)}</th>`).join("");
  const tbody = rows
    .map((row) => {
      // 支持对象或数组；其他原始类型放在 "value" 列
      const tds = headers
        .map((h) => {
          let v: any;
          if (Array.isArray(row)) {
            v = row[Number(h)];
          } else if (row && typeof row === "object") {
            v = row[h as keyof typeof row];
          } else {
            v = row;
          }
          if (v !== null && typeof v === "object") {
            v = JSON.stringify(v);
          }
          return `<td title="${escape(v)}">${escape(v)}</td>`;
        })
        .join("");
      return `<tr>${tds}</tr>`;
    })
    .join("");

  const htmlPath = vscode.Uri.joinPath(
    extensionUri,
    "media",
    "preview.html"
  ).fsPath;
  let html = fs.readFileSync(htmlPath, "utf8");

  html = html
    .replace(/{{cspSource}}/g, webview.cspSource)
    .replace(/{{nonce}}/g, nonce)
    .replace(/{{rowCount}}/g, String(rows.length))
    .replace(/{{colCount}}/g, String(headers.length))
    .replace("{{thead}}", thead)
    .replace("{{tbody}}", tbody);

  return html;
}
