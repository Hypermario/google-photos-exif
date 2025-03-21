import { existsSync, readdirSync } from "fs";
import { basename, dirname, extname, resolve } from "path";

export function getCompanionJsonPathForMediaFile(mediaFilePath: string): string | null {
  const directoryPath = dirname(mediaFilePath);
  const fileName = basename(mediaFilePath);          // e.g. "cm-chat-media-video-1_5c789cfe-89d6-4afa-9978-d(1).mov"
  const fileExt = extname(mediaFilePath);              // e.g. ".mov"
  const PREFIX_LENGHT = 46;
  
  const cleanFileName = fileName.replace(/-modifié/gi, '');
  const base = cleanFileName.replace(fileExt, '');       // e.g. "cm-chat-media-video-1_5c789cfe-89d6-4afa-9978-d(1)"

  // Check for a counter at the end, e.g. "(1)"
  const counterMatch = base.match(/(.*)(\(\d+\))$/);
  let withoutCounter = cleanFileName;
  let counter = "";
  if (counterMatch) {
    withoutCounter = counterMatch[1].trim() + fileExt;
    counter = counterMatch[2]; // e.g. "(1)"
  }

  const slicedNameWithoutCounter = `${withoutCounter}.supplemental-metadata`.slice(0, PREFIX_LENGHT);
  const slicedNameWithCounter = `${cleanFileName}.supplemental-metadata`.slice(0, PREFIX_LENGHT);
  const optionA = slicedNameWithoutCounter + counter + ".json";
  const optionB = slicedNameWithoutCounter + ".json";
  const optionC = slicedNameWithCounter + ".json";

  const optionAPath = resolve(directoryPath, optionA);
  if (existsSync(optionAPath)) return optionAPath;

  const optionBPath = resolve(directoryPath, optionB);
  if (existsSync(optionBPath)) return optionBPath;

  const optionCPath = resolve(directoryPath, optionC);
  if (existsSync(optionCPath)) return optionCPath;

  if (fileExt.toLowerCase() === ".mp4") {
    const heicPath = resolve(directoryPath, `${base}.HEIC`);
    if (existsSync(heicPath)) {
      const heicJson = getCompanionJsonPathForMediaFile(heicPath);
      if (heicJson) return heicJson;
    }
  }

  return null;
}
