import api from "@/lib/api";

/** Fetches a prescription PDF with the user's token and opens (or downloads) it. */
export async function openPrescriptionPdf(id: string, opts: { download?: string } = {}) {
  const res = await api.get(`/pdf/prescription/${id}`, { responseType: "blob" });
  const url = URL.createObjectURL(new Blob([res.data], { type: "application/pdf" }));
  if (opts.download) {
    const a = document.createElement("a");
    a.href = url;
    a.download = opts.download;
    a.click();
  } else {
    window.open(url, "_blank");
  }
  setTimeout(() => URL.revokeObjectURL(url), 60_000);
}
