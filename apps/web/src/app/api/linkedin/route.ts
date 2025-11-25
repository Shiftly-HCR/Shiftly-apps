import { NextRequest, NextResponse } from "next/server";

/**
 * Route API pour importer un profil LinkedIn via SerpAPI
 * POST /api/linkedin
 * Body: { linkedinUrl: string }
 */

interface SerpAPIResponse {
  profile?: {
    name?: string;
    headline?: string;
    location?: string;
    profile_pic_url?: string;
    summary?: string;
  };
  experiences?: Array<{
    title?: string;
    company?: string;
    date_range?: string;
    location?: string;
    description?: string;
  }>;
  education?: Array<{
    school?: string;
    degree?: string;
    field_of_study?: string;
    date_range?: string;
  }>;
  skills?: string[];
  error?: string;
}

interface NormalizedLinkedInProfile {
  fullName: string;
  headline?: string;
  location?: string;
  photoUrl?: string;
  summary?: string;
  experiences: Array<{
    title: string;
    company: string;
    startDate?: string;
    endDate?: string;
    isCurrent: boolean;
    location?: string;
    description?: string;
  }>;
  educations: Array<{
    school: string;
    degree?: string;
    field?: string;
    startDate?: string;
    endDate?: string;
  }>;
  skills: string[];
}

/**
 * Parse une date range au format SerpAPI (ex: "Jan 2020 - Present" ou "2020 - 2022")
 */
function parseDateRange(dateRange?: string): {
  startDate?: string;
  endDate?: string;
  isCurrent: boolean;
} {
  if (!dateRange) {
    return { isCurrent: false };
  }

  const lowerDateRange = dateRange.toLowerCase();
  const isCurrent =
    lowerDateRange.includes("present") ||
    lowerDateRange.includes("aujourd'hui") ||
    lowerDateRange.includes("actuel");

  // Extraire les années (format: "2020 - 2022" ou "Jan 2020 - Dec 2022")
  const yearPattern = /(\d{4})/g;
  const years = dateRange.match(yearPattern);

  if (years && years.length >= 1) {
    const startYear = years[0];
    const endYear = isCurrent ? undefined : years[1] || years[0];

    return {
      startDate: `${startYear}-01-01`,
      endDate: endYear ? `${endYear}-12-31` : undefined,
      isCurrent,
    };
  }

  return { isCurrent };
}

/**
 * Normalise la réponse de SerpAPI vers notre format
 */
function normalizeSerpAPIData(
  data: SerpAPIResponse
): NormalizedLinkedInProfile {
  const profile = data.profile || {};

  // Construire le nom complet
  const fullName = profile.name || "";

  // Normaliser les expériences
  const experiences = (data.experiences || []).map((exp) => {
    const dateInfo = parseDateRange(exp.date_range);

    return {
      title: exp.title || "",
      company: exp.company || "",
      startDate: dateInfo.startDate,
      endDate: dateInfo.endDate,
      isCurrent: dateInfo.isCurrent,
      location: exp.location,
      description: exp.description,
    };
  });

  // Normaliser les formations
  const educations = (data.education || []).map((edu) => {
    const dateInfo = parseDateRange(edu.date_range);

    return {
      school: edu.school || "",
      degree: edu.degree,
      field: edu.field_of_study,
      startDate: dateInfo.startDate,
      endDate: dateInfo.endDate,
    };
  });

  return {
    fullName,
    headline: profile.headline,
    location: profile.location,
    photoUrl: profile.profile_pic_url,
    summary: profile.summary,
    experiences,
    educations,
    skills: data.skills || [],
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { linkedinUrl } = body;

    // Validation de l'URL
    if (!linkedinUrl || typeof linkedinUrl !== "string") {
      return NextResponse.json(
        { error: "L'URL LinkedIn est requise" },
        { status: 400 }
      );
    }

    // Validation basique du format LinkedIn
    if (!linkedinUrl.includes("linkedin.com/in/")) {
      return NextResponse.json(
        {
          error:
            "L'URL LinkedIn n'est pas valide. Format attendu: https://www.linkedin.com/in/...",
        },
        { status: 400 }
      );
    }

    // Récupérer la clé API SerpAPI
    const apiKey = process.env.SERPAPI_KEY;
    if (!apiKey) {
      console.error(
        "SERPAPI_KEY n'est pas définie dans les variables d'environnement"
      );
      return NextResponse.json(
        {
          error:
            "Configuration serveur manquante. Veuillez contacter l'administrateur.",
        },
        { status: 500 }
      );
    }

    // Construire l'URL SerpAPI
    const serpApiUrl = "https://serpapi.com/search.json";
    const urlWithParams = new URL(serpApiUrl);
    urlWithParams.searchParams.append("engine", "linkedin");
    urlWithParams.searchParams.append("linkedin_url", linkedinUrl);
    urlWithParams.searchParams.append("api_key", apiKey);

    // Appel à l'API SerpAPI
    const response = await fetch(urlWithParams.toString(), {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("Erreur SerpAPI:", errorData);

      if (response.status === 400) {
        return NextResponse.json(
          {
            error:
              "URL LinkedIn invalide ou profil introuvable. Vérifiez que l'URL est correcte.",
          },
          { status: 400 }
        );
      }

      if (response.status === 401 || response.status === 403) {
        return NextResponse.json(
          {
            error:
              "Erreur d'authentification API. Veuillez contacter l'administrateur.",
          },
          { status: 500 }
        );
      }

      return NextResponse.json(
        {
          error:
            "Erreur lors de la récupération du profil LinkedIn. Veuillez réessayer plus tard.",
        },
        { status: 500 }
      );
    }

    const serpApiData: SerpAPIResponse = await response.json();

    // Vérifier si SerpAPI a retourné une erreur
    if (serpApiData.error) {
      console.error("Erreur SerpAPI:", serpApiData.error);
      return NextResponse.json(
        {
          error:
            serpApiData.error ||
            "Erreur lors de la récupération du profil LinkedIn",
        },
        { status: 500 }
      );
    }

    // Vérifier que des données de profil sont présentes
    if (
      !serpApiData.profile &&
      (!serpApiData.experiences || serpApiData.experiences.length === 0)
    ) {
      return NextResponse.json(
        {
          error:
            "Aucune donnée trouvée pour ce profil LinkedIn. Le profil est peut-être privé ou l'URL est incorrecte.",
        },
        { status: 404 }
      );
    }

    // Normaliser les données
    const normalizedData = normalizeSerpAPIData(serpApiData);

    return NextResponse.json(normalizedData, { status: 200 });
  } catch (error) {
    console.error("Erreur lors de l'import LinkedIn:", error);
    return NextResponse.json(
      {
        error:
          "Une erreur est survenue lors de l'import du profil LinkedIn. Veuillez réessayer plus tard.",
      },
      { status: 500 }
    );
  }
}
