/**
 * Utilitaires de géocodage avec l'API Mapbox
 */

interface GeocodeResult {
  latitude: number;
  longitude: number;
  address: string;
  city: string;
  postalCode: string;
  formattedAddress: string;
}

/**
 * Géocodage : Convertit une adresse en coordonnées (latitude, longitude)
 * @param address - Numéro et nom de rue
 * @param city - Ville
 * @param postalCode - Code postal
 * @param mapboxToken - Token d'API Mapbox
 * @returns Les coordonnées et informations d'adresse formatées
 */
export async function geocodeAddress(
  address: string,
  city: string,
  postalCode: string,
  mapboxToken: string
): Promise<GeocodeResult | null> {
  if (!mapboxToken) {
    console.error("Token Mapbox non configuré");
    return null;
  }

  const query = encodeURIComponent(`${address}, ${postalCode} ${city}, France`);
  const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${query}.json?access_token=${mapboxToken}&country=FR&language=fr`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data.features && data.features.length > 0) {
      const feature = data.features[0];
      const [longitude, latitude] = feature.center;
      const context = feature.context || [];

      // Extraire les composants de l'adresse
      const foundCity =
        context.find((c: any) => c.id.startsWith("place."))?.text || city;
      const foundPostalCode =
        context.find((c: any) => c.id.startsWith("postcode."))?.text ||
        postalCode;

      return {
        latitude,
        longitude,
        address: feature.place_name.split(",")[0] || address,
        city: foundCity,
        postalCode: foundPostalCode,
        formattedAddress: feature.place_name,
      };
    }
  } catch (error) {
    console.error("Erreur lors du géocodage:", error);
  }

  return null;
}

/**
 * Géocodage inverse : Convertit des coordonnées en adresse
 * @param latitude - Latitude
 * @param longitude - Longitude
 * @param mapboxToken - Token d'API Mapbox
 * @returns L'adresse et les informations de localisation
 */
export async function reverseGeocode(
  latitude: number,
  longitude: number,
  mapboxToken: string
): Promise<GeocodeResult | null> {
  if (!mapboxToken) {
    console.error("Token Mapbox non configuré");
    return null;
  }

  const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${longitude},${latitude}.json?access_token=${mapboxToken}&country=FR&language=fr`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data.features && data.features.length > 0) {
      const feature = data.features[0];
      const context = feature.context || [];

      // Extraire les composants de l'adresse
      const city =
        context.find((c: any) => c.id.startsWith("place."))?.text || "";
      const postalCode =
        context.find((c: any) => c.id.startsWith("postcode."))?.text || "";

      return {
        latitude,
        longitude,
        address: feature.place_name.split(",")[0] || "",
        city,
        postalCode,
        formattedAddress: feature.place_name,
      };
    }
  } catch (error) {
    console.error("Erreur lors du géocodage inverse:", error);
  }

  return null;
}

/**
 * Fonction de debounce générique
 * Limite le nombre d'appels d'une fonction pendant une période donnée
 * @param func - Fonction à "débouncer"
 * @param delay - Délai en millisecondes
 * @returns Fonction débouncée
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return (...args: Parameters<T>) => {
    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(() => {
      func(...args);
      timeout = null;
    }, delay);
  };
}

