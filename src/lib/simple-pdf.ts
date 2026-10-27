// Dependency-free, paginated text PDF. User content is escaped before PDF syntax.
export function textPDF(title: string, lines: string[]) {
  const escape = (s: string) =>
    s
      .replace(/[^\x20-\x7e]/g, "?")
      .replaceAll("\\", "\\\\")
      .replaceAll("(", "\\(")
      .replaceAll(")", "\\)");
  const all = [title, "", ...lines].flatMap((s) => s.match(/.{1,90}/g) || [""]);
  const pages = [];
  for (let i = 0; i < all.length; i += 48) pages.push(all.slice(i, i + 48));
  const objects: string[] = [
    "",
    "<< /Type /Catalog /Pages 2 0 R >>",
    "",
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
  ];
  const kids = [];
  for (const lines of pages) {
    const n = objects.length;
    kids.push(`${n} 0 R`);
    objects.push(
      `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 3 0 R >> >> /Contents ${n + 1} 0 R >>`,
    );
    const stream =
      "BT /F1 10 Tf 45 790 Td 14 TL " +
      lines.map((l, i) => (i ? "T* " : "") + `(${escape(l)}) Tj`).join("\n") +
      " ET";
    objects.push(
      `<< /Length ${Buffer.byteLength(stream)} >>\nstream\n${stream}\nendstream`,
    );
  }
  objects[2] = `<< /Type /Pages /Count ${pages.length} /Kids [${kids.join(" ")}] >>`;
  let out = "%PDF-1.4\n";
  const offsets = [0];
  for (let i = 1; i < objects.length; i++) {
    offsets.push(Buffer.byteLength(out));
    out += `${i} 0 obj\n${objects[i]}\nendobj\n`;
  }
  const start = Buffer.byteLength(out);
  out +=
    `xref\n0 ${objects.length}\n0000000000 65535 f \n` +
    offsets
      .slice(1)
      .map((n) => String(n).padStart(10, "0") + " 00000 n \n")
      .join("") +
    `trailer\n<< /Size ${objects.length} /Root 1 0 R >>\nstartxref\n${start}\n%%EOF`;
  return Buffer.from(out);
}
