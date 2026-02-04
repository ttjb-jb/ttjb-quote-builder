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

export async function saveAndShareBlob(filename: string, blob: Blob) {
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

  // Android/iOS: write to Documents then share as an attached file
  const b64 = await blobToBase64(blob);

  const result = await Filesystem.writeFile({
    path: filename,
    data: b64,
    directory: Directory.Cache,
    recursive: true
  });

  await Share.share({
    title: filename,
    text: filename,
    files: [result.uri],
    dialogTitle: "Save / Share file"
  });
}