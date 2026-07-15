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
export interface ComputedVersions {
  crVersions: string[];
  crVersion: MinecraftVersion;
  pCorVersions: string[];
  pCosVersions: string[];
  pJigVersions: string[];
}

/**
 * Fetch versions used in the template generator.
 */
export async function fetchVersions(): Promise<ComputedVersions> {
  const crVersions = await fetchCosmicVersions();
  const crParsedVersion = parseMinecraftVersion(crVersions[0]);
  const versions = await Promise.all([
    fetchMavenVersions("dev.puzzleshq", "puzzle-loader-core"),
    fetchMavenVersions("dev.puzzleshq", "puzzle-loader-cosmic"),
    fetchMavenVersions("dev.puzzleshq", "jigsaw-suite"),
  ]);
  return {
    crVersions,
    crVersion: crParsedVersion,
    pCorVersions: versions[0],
    pCosVersions: versions[1],
    pJigVersions: versions[2]

  };
}

/**
 * Fetch the list of existing Minecraft releases, new to old.
 * Stops at {@code 1.20.2}.
 */
export async function fetchCosmicVersions(): Promise<string[]> {
  const result = await fetch(
    "https://raw.githubusercontent.com/PuzzlesHQ/CRArchive/refs/heads/main/versions.json",
  );
  const json = await result.json();
  const ret: string[] = [];
  for (const entry of json.versions) {
    if (entry.type !== "release") {
      continue;
    }
    ret.push(entry.id);
  }
  return ret;
}

interface MavenDetailsResponse {
  name: string;
  files: {
    name: string;
    type: "DIRECTORY" | "FILE";
  }[];
}

async function fetchMavenVersions(
  group: string,
  artifact: string
): Promise<string[]> {
  const req = await fetch(
    `https://maven.puzzleshq.dev/api/maven/details/releases/${group.replace(/\./g, "/")}/${artifact}`,
  );

  if (!req.ok) {
    throw new Error(`Failed to fetch versions: ${req.status}`);
  }

  const data: MavenDetailsResponse = await req.json();

  return data.files
    .filter((file) => file.type === "DIRECTORY")
    .map((file) => file.name)
    .reverse();
}
