// src/utils/deviceDownload.ts
import { Capacitor } from "@capacitor/core";
import { Filesystem, Directory } from "@capacitor/filesystem";
import { Share } from "@capacitor/share";

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onerror = () => reject(new Error("Failed to read file"));
    r.onload = () => {
      const res = String(r.result || "");
      const comma = res.indexOf(",");
      resolve(comma >= 0 ? res.slice(comma + 1) : res);
    };
    r.readAsDataURL(blob);
  });
}

/**
 * Save a Blob then open the native share sheet (Android/iOS).
 * On web it triggers a normal browser download.
 *
 * @param filename e.g. "Q-0001-project.pdf"
 * @param blob the file contents
 * @param mime optional but recommended ("application/pdf", "text/csv", "application/zip")
 */
export async function saveAndShareBlob(filename: string, blob: Blob, mime?: string) {
  const platform = Capacitor.getPlatform();

  // Browser fallback
  if (platform === "web") {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    return;
  }

  // Native (Android/iOS)
  const b64 = await blobToBase64(blob);

  // Write to app Documents (persistent). Cache also works, but Documents is fine if you want it kept.
  const writeRes = await Filesystem.writeFile({
    path: filename,
    data: b64,
    directory: Directory.Documents,
    recursive: true
    // NOTE: some Capacitor versions accept `contentType`; others ignore it.
    // We'll pass MIME to Share, which is the important part.
  });

  // Convert URI to something the WebView + Share plugin can reliably hand off
  // (Capacitor.convertFileSrc turns file URIs into a usable URL)
  const shareUrl = Capacitor.convertFileSrc(writeRes.uri);

  // Share sheet
  await Share.share({
    title: filename,
    text: filename,
    url: shareUrl,
    dialogTitle: "Save / Share file"
  });
}
