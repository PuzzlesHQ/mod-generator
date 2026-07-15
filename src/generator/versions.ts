import type { Settings } from "./index.ts";

export interface MinecraftVersion {
  major: number;
  minor: number;
  patch: number;
}

export function parseMinecraftVersion(version: string): MinecraftVersion {
  const mcSplit = version.split(".");
  return {
    major: parseInt(mcSplit[0]),
    minor: parseInt(mcSplit[1]),
    patch: mcSplit.length == 3 ? parseInt(mcSplit[2]) : 0,
  };
}

export function compareMinecraftVersions(
  v1: MinecraftVersion,
  v2: MinecraftVersion,
): number {
  if (v1.major !== v2.major) {
    return v1.major - v2.major;
  }
  if (v1.minor !== v2.minor) {
    return v1.minor - v2.minor;
  }
  return v1.patch - v2.patch;
}

export interface ComputedVersions {
  crVersions: string[];
  crVersion: MinecraftVersion;
  pCorVersion: string;
  pCosVersion: string;
  pJigVersion: string;
}

/**
 * Fetch versions used in the template generator.
 */
export async function fetchVersions(
  settings: Settings,
  xmlParser: () => DOMParser | import("@xmldom/xmldom").DOMParser,
  crVersions?: string[],
): Promise<ComputedVersions> {
  const crParsedVersion = parseMinecraftVersion(settings.crVersion);

  if (!crVersions) {
    crVersions = await fetchMinecraftVersions();
  }
  const versions = await Promise.all([
    fetchLatestMavenVersion("dev.puzzleshq", "puzzle-lodaer-core"),
    fetchLatestMavenVersion("dev.puzzleshq", "puzzle-lodaer-cosmic"),
    fetchLatestMavenVersion("dev.puzzleshq", "jigsaw-suite"),
  ]);
  return {
    crVersions,
    crVersion: crParsedVersion,
    pCorVersion: versions[0],
    pCosVersion: versions[1],
    pJigVersion: versions[2]

  };
}

/**
 * Fetch the list of existing Minecraft releases, new to old.
 * Stops at {@code 1.20.2}.
 */
export async function fetchMinecraftVersions(): Promise<string[]> {
  const result = await fetch(
    "https://piston-meta.mojang.com/mc/game/version_manifest_v2.json",
  );
  const json = await result.json();
  const ret: string[] = [];
  for (const entry of json.versions) {
    if (entry.type !== "release") {
      continue;
    }
    ret.push(entry.id);
    if (entry.id === "1.20.4") {
      break; // We don't support releases older than 1.20.4.
    }
  }
  return ret;
}

async function fetchLatestMavenVersion(
  group: string,
  artifact: string
): Promise<string> {
  const req = await fetch(
    `https://maven.puzzleshq.dev/#/releases/${group.replace(/\./g, "/")}/${artifact}`,
  );
  return (await req.json()).version;
}
