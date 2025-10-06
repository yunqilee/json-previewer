import * as vscode from "vscode";

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

  return /* html */ `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8" />
  <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline' ${webview.cspSource}; script-src 'nonce-${nonce}';">
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>JSON Table Preview</title>
  <style>
    :root { color-scheme: light dark; }
    body { font-family: system-ui, -apple-system, Segoe UI, Roboto, sans-serif; margin: 0; padding: 12px; }
    .wrap { overflow:auto; border: 1px solid rgba(127,127,127,.3); max-height: 80vh; }
    table { border-collapse: collapse; width: 100%; table-layout: fixed; }
    th, td { border: 1px solid rgba(127,127,127,.3); padding: 6px 8px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    th { position: sticky; top: 0; background: rgba(127,127,127,.15); }
    tbody tr:nth-child(odd) { background: rgba(127,127,127,.06); }
    .meta { margin: 6px 0 8px; opacity: .7; font-size: 12px; }
  </style>
</head>
<body>
  <div class="meta">${rows.length} rows • ${headers.length} columns</div>
  <div class="wrap">
    <table>
      <thead><tr>${thead}</tr></thead>
      <tbody>${tbody}</tbody>
    </table>
  </div>
</body>
</html>`;
}
