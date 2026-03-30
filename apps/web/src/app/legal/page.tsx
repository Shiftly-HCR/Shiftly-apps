"use client";

import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { ScrollView, Text, YStack } from "tamagui";
import { colors } from "@shiftly/ui";
import { PublicLayout } from "@/components";
import { PageHeader } from "@/components/ui/PageHeader";

type ContentBlock =
  | { type: "title"; text: string }
  | { type: "article"; text: string }
  | { type: "subsection"; text: string }
  | { type: "paragraph"; text: string }
  | { type: "separator" };

function parseLegalContent(content: string): ContentBlock[] {
  const normalized = content.replace(/^\uFEFF/, "");
  const lines = normalized.split(/\r?\n/);
  const blocks: ContentBlock[] = [];
  let paragraphBuffer: string[] = [];

  const flushParagraph = () => {
    const text = paragraphBuffer.join(" ").trim();
    if (text) {
      blocks.push({ type: "paragraph", text });
    }
    paragraphBuffer = [];
  };

  for (const rawLine of lines) {
    const line = rawLine.trim();

    if (!line) {
      flushParagraph();
      continue;
    }

    if (/^━{10,}$/.test(line)) {
      flushParagraph();
      blocks.push({ type: "separator" });
      continue;
    }

    if (/^MENTIONS\s+LÉGALES$/i.test(line)) {
      flushParagraph();
      blocks.push({ type: "title", text: line });
      continue;
    }

    if (/^ARTICLE\s+\d+/.test(line)) {
      flushParagraph();
      blocks.push({ type: "article", text: line });
      continue;
    }

    if (/^\d+(\.\d+)?\s+—\s+.+/.test(line)) {
      flushParagraph();
      blocks.push({ type: "subsection", text: line });
      continue;
    }

    paragraphBuffer.push(line);
  }

  flushParagraph();
  return blocks;
}

const LINK_REGEX =
  /(https?:\/\/[^\s]+|www\.[^\s]+|[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,})/gi;
const SINGLE_LINK_REGEX =
  /^(https?:\/\/[^\s]+|www\.[^\s]+|[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,})$/i;

function sanitizeUrl(raw: string) {
  return raw.replace(/[),.;]+$/, "");
}

function toHref(token: string) {
  const clean = sanitizeUrl(token);
  if (/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(clean)) {
    return `mailto:${clean}`;
  }
  if (clean.startsWith("http://") || clean.startsWith("https://")) {
    return clean;
  }
  if (clean.startsWith("www.")) {
    return `https://${clean}`;
  }
  return clean;
}

function renderTextWithLinks(text: string): ReactNode[] {
  const parts = text.split(LINK_REGEX);
  return parts.map((part, index) => {
    if (!part) {
      return null;
    }
    if (SINGLE_LINK_REGEX.test(part)) {
      const clean = sanitizeUrl(part);
      const suffix = part.slice(clean.length);
      return (
        <span key={`link-${index}`}>
          <a
            href={toHref(part)}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: colors.shiftlyViolet, textDecoration: "underline" }}
          >
            {clean}
          </a>
          {suffix}
        </span>
      );
    }
    return <span key={`text-${index}`}>{part}</span>;
  });
}

export default function LegalPage() {
  const [legalContent, setLegalContent] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadLegal = async () => {
      try {
        const response = await fetch("/mention_legal.txt");
        if (!response.ok) {
          throw new Error("Impossible de charger les mentions légales.");
        }
        const text = await response.text();
        setLegalContent(text);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erreur de chargement.");
      } finally {
        setIsLoading(false);
      }
    };

    void loadLegal();
  }, []);

  const blocks = useMemo(() => parseLegalContent(legalContent), [legalContent]);

  return (
    <PublicLayout>
      <ScrollView flex={1}>
        <YStack maxWidth={1000} width="100%" alignSelf="center" padding="$6" gap="$6">
          <PageHeader
            title="Mentions légales"
            description="Document officiel SAS SHIFTLY"
          />

          <YStack
            padding="$6"
            backgroundColor="white"
            borderRadius="$4"
            borderWidth={1}
            borderColor={colors.gray200}
            gap="$4"
          >
            {isLoading && (
              <Text fontSize={14} color={colors.gray700} lineHeight={24}>
                Chargement des mentions légales...
              </Text>
            )}

            {!isLoading && error && (
              <Text fontSize={14} color="#DC2626" lineHeight={24}>
                {error}
              </Text>
            )}

            {!isLoading && !error && blocks.length > 0 && (
              <YStack gap="$4">
                {blocks.map((block, index) => {
                  if (block.type === "separator") {
                    return (
                      <YStack
                        key={`separator-${index}`}
                        borderTopWidth={1}
                        borderTopColor={colors.gray200}
                        marginVertical="$2"
                      />
                    );
                  }

                  if (block.type === "title") {
                    return (
                      <Text
                        key={`title-${index}`}
                        fontSize={22}
                        fontWeight="700"
                        color={colors.gray900}
                      >
                        {renderTextWithLinks(block.text)}
                      </Text>
                    );
                  }

                  if (block.type === "article") {
                    return (
                      <Text
                        key={`article-${index}`}
                        fontSize={18}
                        fontWeight="700"
                        color={colors.gray900}
                        marginTop="$2"
                      >
                        {renderTextWithLinks(block.text)}
                      </Text>
                    );
                  }

                  if (block.type === "subsection") {
                    return (
                      <Text
                        key={`subsection-${index}`}
                        fontSize={15}
                        fontWeight="600"
                        color={colors.gray900}
                        marginTop="$1"
                      >
                        {renderTextWithLinks(block.text)}
                      </Text>
                    );
                  }

                  return (
                    <Text
                      key={`paragraph-${index}`}
                      fontSize={14}
                      color={colors.gray800}
                      lineHeight={24}
                    >
                      {renderTextWithLinks(block.text)}
                    </Text>
                  );
                })}
              </YStack>
            )}
          </YStack>
        </YStack>
      </ScrollView>
    </PublicLayout>
  );
}
