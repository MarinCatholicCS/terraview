export default function StatusBar({ statusText }) {
  return (
    <div className="status-bar">
      <div className="status-dot" />
      <span>{statusText}</span>
    </div>
  );
}
