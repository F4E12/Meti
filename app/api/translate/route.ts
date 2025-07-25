import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { AzureOpenAI } from "openai";

// Load environment variables
const apiKey = process.env.AZURE_OPENAI_API_KEY;
const endpoint = process.env.AZURE_OPENAI_ENDPOINT;
const deployment = process.env.AZURE_OPENAI_DEPLOYMENT_NAME;
const apiVersion = "2024-12-01-preview";
const modelName = "gpt-4o";

if (!apiKey || !endpoint || !deployment) {
  throw new Error("Missing Azure OpenAI configuration in .env");
}

// Initialize Azure OpenAI client
const client = new AzureOpenAI({ endpoint, apiKey, deployment, apiVersion });

const supportedLanguages = [
  "Indonesia",
  "Jawa",
  "Sunda",
  "Batak",
  "Betawi",
  "Minang",
  "Bugis",
  "Madura",
  "Bali",
  "English",
] as const;

// Create a type from supportedLanguages
type SupportedLanguage = (typeof supportedLanguages)[number];

// Define languageCodes with a type that matches supportedLanguages
const languageCodes: Record<SupportedLanguage, string> = {
  Indonesia: "id",
  Jawa: "jv", // Javanese
  Sunda: "su", // Sundanese
  Batak: "id", // Approximate (no direct code, use "id" as fallback)
  Betawi: "id", // Use Indonesian as fallback
  Minang: "id", // Use Indonesian as fallback
  Bugis: "id", // Use Indonesian as fallback
  Madura: "id", // Use Indonesian as fallback
  Bali: "id", // Use Indonesian as fallback
  English: "en",
};

async function translateText(text: string, targetLanguage: SupportedLanguage) {
  try {
    const targetCode = languageCodes[targetLanguage] || "en"; // Default to English if not found
    console.log(
      `Translating text: "${text}" to ${targetLanguage} (${targetCode})`
    );

    const response = await client.chat.completions.create({
      messages: [
        {
          role: "system",
          content:
            "You are a professional translator. Translate the provided text into the specified language accurately, preserving the meaning and context. If the source language is unclear, make a reasonable attempt to detect it.",
        },
        {
          role: "user",
          content: `Translate the following text into ${targetLanguage} (${targetCode}): "${text}"`,
        },
      ],
      max_tokens: 200,
      temperature: 0.7,
      top_p: 1.0,
      frequency_penalty: 0,
      presence_penalty: 0,
      model: modelName,
    });

    if (!response) {
      throw new Error("Response error");
    }

    if (!response.choices || !response.choices[0]?.message?.content) {
      throw new Error("Invalid response format from Azure OpenAI");
    }

    const translatedText = response.choices[0].message.content.trim();
    console.log("Translated text:", translatedText);
    return translatedText;
  } catch (error) {
    console.error("Translation error details:", error);
    throw new Error(`Failed to translate text: ${error}`);
  }
}

export async function POST(request: Request) {
  const supabase = createClient();
  let body;
  try {
    body = await request.json();
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Invalid JSON payload" },
      { status: 400 }
    );
  }
  const { messageId, targetLanguage } = body;

  if (
    !messageId ||
    !targetLanguage ||
    !supportedLanguages.includes(targetLanguage as SupportedLanguage)
  ) {
    return NextResponse.json(
      { error: "Invalid messageId or unsupported target language" },
      { status: 400 }
    );
  }

  // Check if translation exists
  const { data: messageData, error: fetchError } = await (await supabase)
    .from("messages")
    .select("content, translated_content")
    .eq("message_id", messageId)
    .single();

  if (fetchError || !messageData) {
    return NextResponse.json({ error: "Message not found" }, { status: 404 });
  }

  const existingTranslations = messageData.translated_content
    ? JSON.parse(messageData.translated_content)
    : {};
  if (existingTranslations[targetLanguage as SupportedLanguage]) {
    return NextResponse.json(
      {
        translatedText:
          existingTranslations[targetLanguage as SupportedLanguage],
      },
      { status: 200 }
    );
  }

  // Translate if not exists
  try {
    const originalText = messageData.content;
    const translatedText = await translateText(
      originalText,
      targetLanguage as SupportedLanguage
    );

    // Update translated_content with new translation
    existingTranslations[targetLanguage as SupportedLanguage] = translatedText;
    const { error: updateError } = await (
      await supabase
    )
      .from("messages")
      .update({
        translated_content: JSON.stringify(existingTranslations),
      })
      .eq("message_id", messageId);

    if (updateError) {
      throw updateError;
    }

    return NextResponse.json({ translatedText }, { status: 200 });
  } catch (error) {
    console.error("Error processing translation:", error);
    return NextResponse.json(
      { error: `Translation failed: ${error}` },
      { status: 500 }
    );
  }
}
