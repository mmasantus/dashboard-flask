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
export function downloadPublicFile(urlPath: string, filename: string): void {
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
  } catch (err) {
    console.error('Error downloading public file:', err);
    window.open(urlPath, '_blank');
  }
}
