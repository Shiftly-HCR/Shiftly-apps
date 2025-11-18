/**
 * Utilitaires de géocodage avec l'API Mapbox
 */

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "";

/**
 * Géocodage : Convertit une adresse en coordonnées (latitude, longitude)
 */
export async function geocodeAddress(
  address: string,
  city?: string,
  postalCode?: string
): Promise<{
  latitude: number;
  longitude: number;
  formattedAddress: string;
  city: string;
  postalCode: string;
} | null> {
  if (!MAPBOX_TOKEN) {
    console.warn("Mapbox token non configuré");
    return null;
  }

  try {
    // Construire la requête de recherche
    const searchQuery = [address, city, postalCode].filter(Boolean).join(", ");

    if (!searchQuery.trim()) return null;

    const response = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
        searchQuery
      )}.json?access_token=${MAPBOX_TOKEN}&country=FR&limit=1`
    );

    if (!response.ok) {
      console.error("Erreur géocodage:", response.statusText);
      return null;
    }

    const data = await response.json();

    if (data.features && data.features.length > 0) {
      const feature = data.features[0];
      const [longitude, latitude] = feature.center;

      // Extraire les informations d'adresse
      const context = feature.context || [];
      let extractedCity = city || "";
      let extractedPostalCode = postalCode || "";

      // Parcourir le contexte pour extraire ville et code postal
      context.forEach((item: any) => {
        if (item.id.includes("place")) {
          extractedCity = item.text;
        }
        if (item.id.includes("postcode")) {
          extractedPostalCode = item.text;
        }
      });

      return {
        latitude,
        longitude,
        formattedAddress: feature.place_name,
        city: extractedCity,
        postalCode: extractedPostalCode,
      };
    }

    return null;
  } catch (error) {
    console.error("Erreur lors du géocodage:", error);
    return null;
  }
}

/**
 * Géocodage inversé : Convertit des coordonnées en adresse
 */
export async function reverseGeocode(
  latitude: number,
  longitude: number
): Promise<{
  address: string;
  city: string;
  postalCode: string;
  formattedAddress: string;
} | null> {
  if (!MAPBOX_TOKEN) {
    console.warn("Mapbox token non configuré");
    return null;
  }

  try {
    const response = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${longitude},${latitude}.json?access_token=${MAPBOX_TOKEN}&country=FR&types=address,place,postcode`
    );

    if (!response.ok) {
      console.error("Erreur géocodage inversé:", response.statusText);
      return null;
    }

    const data = await response.json();

    if (data.features && data.features.length > 0) {
      const feature = data.features[0];
      const context = feature.context || [];

      let address = "";
      let city = "";
      let postalCode = "";

      // Extraire le numéro et le nom de rue
      if (feature.properties?.address) {
        address = `${feature.properties.address} ${feature.text}`;
      } else {
        address = feature.text;
      }

      // Parcourir le contexte pour extraire ville et code postal
      context.forEach((item: any) => {
        if (item.id.includes("place")) {
          city = item.text;
        }
        if (item.id.includes("postcode")) {
          postalCode = item.text;
        }
      });

      return {
        address,
        city,
        postalCode,
        formattedAddress: feature.place_name,
      };
    }

    return null;
  } catch (error) {
    console.error("Erreur lors du géocodage inversé:", error);
    return null;
  }
}

/**
 * Debounce utility pour limiter les appels API
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
}
