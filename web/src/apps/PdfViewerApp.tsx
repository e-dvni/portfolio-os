export function PdfViewerApp({ src }: { src: string }) {
  return (
    <iframe
      src={src}
      style={{ width: "100%", height: "100%", border: 0, background: "white" }}
      title="Resume PDF"
    />
  );
}
