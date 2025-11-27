interface SearchBarProps {
  placeholder?: string;
  value?: string;
  onChangeText?: (text: string) => void;
  onSearch?: () => void;
}

export function SearchBar({
  placeholder = "Rechercher...",
  value,
  onChangeText,
  onSearch,
}: SearchBarProps) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "8px",
        padding: "12px",
        backgroundColor: "#f9fafb",
        borderRadius: "8px",
        border: "1px solid #d1d5db",
        maxWidth: "400px",
      }}
    >
      <span style={{ fontSize: "16px" }}>🔍</span>
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChangeText?.(e.target.value)}
        style={{
          flex: 1,
          border: "none",
          backgroundColor: "transparent",
          outline: "none",
          fontSize: "16px",
        }}
      />
      {onSearch && (
        <button
          onClick={onSearch}
          style={{
            backgroundColor: "#782478",
            color: "white",
            padding: "8px 16px",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
            fontSize: "14px",
          }}
        >
          Rechercher
        </button>
      )}
    </div>
  );
}
