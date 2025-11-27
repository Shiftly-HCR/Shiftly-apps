"use client";

export default function PlaygroundSimplePage() {
  return (
    <div style={{ padding: "20px", fontFamily: "system-ui, sans-serif" }}>
      <h1>Shiftly UI Playground - Version Simple</h1>

      <div style={{ marginBottom: "40px" }}>
        <h2>Boutons</h2>
        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
          <button
            style={{
              backgroundColor: "#782478",
              color: "white",
              padding: "12px 24px",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
            }}
          >
            Bouton Principal
          </button>
          <button
            style={{
              backgroundColor: "transparent",
              color: "#782478",
              padding: "12px 24px",
              border: "2px solid #782478",
              borderRadius: "8px",
              cursor: "pointer",
            }}
          >
            Bouton Secondaire
          </button>
          <button
            style={{
              backgroundColor: "transparent",
              color: "#782478",
              padding: "12px 24px",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
            }}
          >
            Bouton Ghost
          </button>
        </div>
      </div>

      <div style={{ marginBottom: "40px" }}>
        <h2>Cartes</h2>
        <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
          <div
            style={{
              border: "1px solid #e5e7eb",
              borderRadius: "12px",
              padding: "20px",
              backgroundColor: "white",
              boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
              minWidth: "200px",
            }}
          >
            <h3 style={{ margin: "0 0 8px 0", fontSize: "18px" }}>
              Carte Simple
            </h3>
            <p style={{ margin: "0 0 12px 0", color: "#6b7280" }}>
              Description de la carte
            </p>
            <p style={{ margin: "0" }}>Contenu de la carte</p>
          </div>

          <div
            style={{
              border: "1px solid #e5e7eb",
              borderRadius: "12px",
              padding: "20px",
              backgroundColor: "white",
              boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
              minWidth: "200px",
            }}
          >
            <p
              style={{
                margin: "0 0 8px 0",
                color: "#6b7280",
                fontSize: "14px",
              }}
            >
              Gains Totaux
            </p>
            <h3
              style={{
                margin: "0 0 4px 0",
                fontSize: "24px",
                color: "#782478",
              }}
            >
              €1,250.00
            </h3>
            <p style={{ margin: "0", color: "#6b7280", fontSize: "12px" }}>
              Ce mois
            </p>
          </div>
        </div>
      </div>

      <div style={{ marginBottom: "40px" }}>
        <h2>Badges</h2>
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          <span
            style={{
              backgroundColor: "#f3f4f6",
              color: "#374151",
              padding: "6px 12px",
              borderRadius: "6px",
              fontSize: "14px",
              border: "1px solid #d1d5db",
            }}
          >
            Cuisine
          </span>
          <span
            style={{
              backgroundColor: "#f3f4f6",
              color: "#374151",
              padding: "6px 12px",
              borderRadius: "6px",
              fontSize: "14px",
              border: "1px solid #d1d5db",
            }}
          >
            Service
          </span>
          <span
            style={{
              backgroundColor: "#f3f4f6",
              color: "#374151",
              padding: "6px 12px",
              borderRadius: "6px",
              fontSize: "14px",
              border: "1px solid #d1d5db",
            }}
          >
            Bartender
          </span>
        </div>
      </div>

      <div style={{ marginBottom: "40px" }}>
        <h2>Barre de Recherche</h2>
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
            placeholder="Rechercher une mission..."
            style={{
              flex: 1,
              border: "none",
              backgroundColor: "transparent",
              outline: "none",
              fontSize: "16px",
            }}
          />
          <button
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
        </div>
      </div>

      <div style={{ marginBottom: "40px" }}>
        <h2>Cartes de Mission</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div
            style={{
              border: "1px solid #e5e7eb",
              borderRadius: "12px",
              padding: "20px",
              backgroundColor: "white",
              boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
            }}
          >
            <div
              style={{
                height: "120px",
                width: "100%",
                borderRadius: "8px",
                backgroundImage:
                  "url(https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=200&fit=crop)",
                backgroundSize: "cover",
                backgroundPosition: "center",
                marginBottom: "16px",
              }}
            />
            <h3 style={{ margin: "0 0 12px 0", fontSize: "18px" }}>
              Chef de Partie
            </h3>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                marginBottom: "8px",
              }}
            >
              <span>📍</span>
              <span style={{ color: "#6b7280", fontSize: "14px" }}>
                Paris, France
              </span>
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                marginBottom: "8px",
              }}
            >
              <span>🕐</span>
              <span style={{ color: "#6b7280", fontSize: "14px" }}>
                12:00 - 16:00
              </span>
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                marginBottom: "16px",
              }}
            >
              <span>💰</span>
              <span
                style={{
                  color: "#782478",
                  fontSize: "16px",
                  fontWeight: "600",
                }}
              >
                120€/jour
              </span>
            </div>
            <button
              style={{
                backgroundColor: "#782478",
                color: "white",
                padding: "12px 24px",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                width: "100%",
              }}
            >
              Postuler
            </button>
          </div>
        </div>
      </div>

      <div style={{ marginBottom: "40px" }}>
        <h2>Navigation</h2>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-around",
            padding: "12px",
            backgroundColor: "white",
            borderTop: "1px solid #e5e7eb",
          }}
        >
          {[
            { id: "home", icon: "🏠", label: "Accueil" },
            { id: "missions", icon: "💼", label: "Missions" },
            { id: "chat", icon: "💬", label: "Chat" },
            { id: "profile", icon: "👤", label: "Profil" },
          ].map((tab) => (
            <button
              key={tab.id}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "4px",
                backgroundColor: "transparent",
                border: "none",
                cursor: "pointer",
                padding: "8px",
                borderRadius: "8px",
                flex: 1,
              }}
            >
              <span
                style={{
                  fontSize: "18px",
                  color: tab.id === "home" ? "#782478" : "#6b7280",
                }}
              >
                {tab.icon}
              </span>
              <span
                style={{
                  fontSize: "12px",
                  color: tab.id === "home" ? "#782478" : "#6b7280",
                  fontWeight: tab.id === "home" ? "600" : "400",
                }}
              >
                {tab.label}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
