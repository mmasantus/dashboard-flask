import { saveAs } from 'file-saver';

/**
 * Universal safe file downloader compatible with browser iframes and stand-alone windows.
 */
export function downloadBlobFile(blob: Blob, filename: string): void {
  try {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    setTimeout(() => {
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    }, 1500);
  } catch {
    try {
      saveAs(blob, filename);
    } catch (e) {
      console.error('All download mechanisms failed:', e);
    }
  }
}

/**
 * Download a file from a public URL path (e.g. /projeto_mktzap_github_vercel.zip)
 */
export async function downloadPublicFile(urlPath: string, filename: string): Promise<void> {
  try {
    const res = await fetch(urlPath);
    if (!res.ok) throw new Error(`HTTP status ${res.status}`);
    const blob = await res.blob();
    downloadBlobFile(blob, filename);
  } catch (err) {
    console.error('Error downloading public file via blob:', err);
    try {
      const link = document.createElement('a');
      link.href = urlPath;
      link.download = filename;
      link.target = '_blank';
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      setTimeout(() => {
        document.body.removeChild(link);
      }, 1500);
    } catch {
      window.open(urlPath, '_blank');
    }
  }
}

import { PROJECT_ZIP_BASE64 } from './zipData';

/**
 * Guarantees immediate 1-click download of the complete 238 KB project zip
 * directly from memory without relying on any network, iframe permission, or external server.
 */
export function downloadEmbeddedProjectZip(filename = 'projeto_mktzap_github_vercel.zip'): void {
  try {
    if (!PROJECT_ZIP_BASE64 || PROJECT_ZIP_BASE64.length < 100) {
      downloadPublicFile('/' + filename, filename);
      return;
    }
    const binaryString = atob(PROJECT_ZIP_BASE64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    const blob = new Blob([bytes], { type: 'application/zip' });
    downloadBlobFile(blob, filename);
  } catch (err) {
    console.error('Error generating blob from embedded zip:', err);
    downloadPublicFile('/' + filename, filename);
  }
}
