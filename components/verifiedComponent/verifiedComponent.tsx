import { VerifiedIcon } from "components/icons";

export default function VerifiedComponent() {
  return (
    <span
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: "16px",
        height: "16px",
        flexShrink: 0,
      }}
    >
      <VerifiedIcon />
    </span>
  );
}
