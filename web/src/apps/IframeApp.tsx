export function IframeApp({ src }: { src: string }) {
  return (
    <iframe
      src={src}
      style={{ width: "100%", height: "100%", border: 0 }}
      title="Embedded App"
    />
  );
}
