export default function Loading() {
  return (
    <div className="loader-overlay">
      <div className="loader"></div>
      <p style={{ color: "white", marginTop: "1rem" }}>Loading...</p>
    </div>
  );
}
