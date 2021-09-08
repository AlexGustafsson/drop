export const English = {
  "errors.messages.not-found": "Not found",
  "errors.descriptions.not-found": "The resource you tried to access does not exist",

  "errors.messages.unauthorized": "Unauthorized",
  "errors.descriptions.unauthorized-upload": "Make sure you used the provided link",

  "actions.take-me-home": "Take me home",
  "actions.create": "Create",
  "actions.login": "Login",
  "actions.copy": "Copy and share this link",

  "archive-name": "Archive name",
  "max-size": "Maximum size",
  "max-file-size": "Maximum file size",
  "max-file-count": "Maximum file count",
  "welcome": "Welcome",
  "authenticate": "Authenticate yourself to continue",
};

export const Swedish = {
  "errors.messages.not-found": "Ej funnen",
  "errors.descriptions.not-found": "Resursen du försökte nå finns inte",

  "errors.messages.unauthorized": "Otillåten",
  "errors.descriptions.unauthorized-upload": "Kontrollera att du använde den givna länken",

  "actions.take-me-home": "Ta mig hem",
  "actions.create": "Skapa",
  "actions.login": "Logga in",
  "actions.copy": "Kopiera och dela denna länk",

  "archive-name": "Arkivnamn",
  "max-size": "Maximal storlek",
  "max-file-size": "Maximal filstorlek",
  "max-file-count": "Maximalt antal filer",
  "welcome": "Välkommen",
  "authenticate": "Logga in för att fortsätta",
};

export function translationsForLanguage(language: string) {
  if (language === "sv-se")
    return Swedish;
  if (language.startsWith("en-"))
    return English;
  return English;
}
