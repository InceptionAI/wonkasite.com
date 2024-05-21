import { RegionCode } from "../types/region";
import { headers } from "next/headers";
import { Locale, defaultLanguage, possibleLocales } from "../types/languages";

export async function getLocale() {
  const headersList = headers();
  const clientAddress = headersList.get("x-forwarded-for") ?? "64.228.25.250"; // Default IP if not found
  let countryCode = "CA"; // Default to Canada
  //let regionCode = 'Quebec'; // Example region

  if (process.env.NODE_ENV !== "development") {
    const response = await fetch(`https://ipinfo.io/${clientAddress}/json`);
    const data = await response.json();
    countryCode = data.country || countryCode;
    //regionCode = data.region ?? '';
    // Verify that it exist in RegionCode
    if (!Object.values(RegionCode).includes(countryCode as RegionCode)) {
      countryCode = "CA";
    }
  }
  // Use Accept-Language header to determine browser-set preferred language
  const acceptLanguage = headersList.get("accept-language");
  const preferredLanguage = acceptLanguage
    ? parseAcceptLanguage(acceptLanguage, countryCode)
    : defaultLanguage.path;
  return `/${preferredLanguage}`;
}

const parseAcceptLanguage = (header: string, country: string): string => {
  try {
    const languages = header
      .split(",")
      .map((lang) => lang.split(";")[0].trim());
    const mappedLanguages = languages.map((lang) => {
      if (lang.length === 2) {
        return `${lang}-${country}`;
      } else if (lang.length === 5) {
        return lang;
      } else {
        return null;
      }
    });
    return (
      mappedLanguages.find((locale) =>
        possibleLocales.includes(locale as Locale),
      ) ?? defaultLanguage.path
    );
  } catch (error) {
    console.error(`page.tsx: Error parsing accept-language header: ${error}`);
    return defaultLanguage.path;
  }
};
