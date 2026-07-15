import Mustache from "mustache";
import type { ComputedVersions } from "./versions.ts";

export interface Settings {
  modName: string;
  modId: string;
  modAuthors: string;
  modDescription: string;
  packageName: string;
  crVersion: string;
  pCosVersion: string;
  pCorVersion: string;
  pJigVersion: string;
  chmodGradlewStep: boolean;
  mixins: boolean;
}

/**
 * Maps a template file name to its contents.
 */
export type GeneratedTemplate = Record<string, Uint8Array>;

export interface TemplateInputs {
  raw: Record<string, Uint8Array>;
  interpolated: Record<string, Uint8Array>;
}

/**
 * Main entrypoint of template generation.
 */
export async function generateTemplate(
  inputs: TemplateInputs,
  settings: Settings,
  versions: ComputedVersions,
): Promise<GeneratedTemplate> {
  const ret: GeneratedTemplate = {};

  generateRaw(inputs, ret);
  generateInterpolated(inputs, settings, versions, ret);

  return ret;
}

function iterateGlob(
  globResult: Record<string, Uint8Array>,
  folderMarker: string,
  callback: (file: string, contents: Uint8Array) => void,
) {
  for (let key in globResult) {
    const rawStart = key.indexOf(folderMarker);
    if (rawStart === -1) {
      throw new Error(`Missing ${folderMarker} in ${key}`);
    }
    const filePath = key.substring(rawStart + folderMarker.length);
    callback(filePath, globResult[key]);
  }
}

function interpolateTemplate(
  template: string,
  view: any,
  partials?: any,
): string {
  return Mustache.render(template, view, partials, {
    // No escaping since we're not rendering to HTML.
    // TODO: double check since there is a TS "unused property escape" warning
    escape: (value: any) => value,
  });
}

/* RAW FILES - included as is */

function generateRaw(inputs: TemplateInputs, ret: GeneratedTemplate) {
  iterateGlob(inputs.raw, "raw/", (filePath, contents) => {
    ret[filePath] = contents;
  });
}

import en_us_json from "../assets/template/special/en_us.json?raw";
import mixins_json from "../assets/template/special/mixins.json?raw";
import Config_java from "../assets/template/special/Config.java?raw";
import ModClass_java from "../assets/template/special/ModClass.java?raw";
import ModClassClient_java from "../assets/template/special/ModClassClient.java?raw";
import mdg_block_gradle from "../assets/template/special/mdg_block.gradle?raw";
import ng_block_gradle from "../assets/template/special/ng_block.gradle?raw";
import neoforge_mods_toml from "../assets/template/special/neoforge.mods.toml?raw";

function generateInterpolated(
  inputs: TemplateInputs,
  settings: Settings,
  versions: ComputedVersions,
  ret: GeneratedTemplate,
) {
  const modClassName = settings.modName.replace(/[^A-Za-z0-9]/g, "");
  const view: Record<string, any> = {
    cosmic_reach_version: settings.crVersion,
    puzzle_loader_cosmic_version: settings.pCosVersion,
    puzzle_loader_core_version: settings.pCorVersion,
    puzzle_jigsaw_suite: settings.pJigVersion,
    mod_id: settings.modId,
    mod_name: settings.modName,
    mod_authors: settings.modAuthors,
    mod_description: settings.modDescription ?? "Example mod description.",
    mod_group_id: settings.packageName,
    package_name: settings.packageName,
    mod_class_name: modClassName,
    chmod_gradlew_step: settings.chmodGradlewStep,
    mixins: settings.mixins,
  };

  let seenCurrentCRVersion = false;
  for (const version of versions.crVersions) {
    if (version === settings.crVersion) {
      seenCurrentCRVersion = true;
    }
    const templateVersion = version.replace(/\./g, "_");
    view[`before_${templateVersion}`] = !seenCurrentCRVersion;
    view[`from_${templateVersion}`] = seenCurrentCRVersion;
  }

  iterateGlob(inputs.interpolated, "interpolated/", (filePath, contents) => {
    const textContent = new TextDecoder().decode(contents);
    ret[filePath] = encodeUtf8(
      interpolateTemplate(textContent, view),
    );
  });

  ret[`src/common/resources/assets/${settings.modId}/lang/en_us.json`] =
    encodeUtf8(interpolateTemplate(en_us_json, view));

  const commonFolder = `src/common/java/${settings.packageName.replace(/\./g, "/")}`;
  const clientFolder = `src/common/java/${settings.packageName.replace(/\./g, "/")}`;


  ret[`${commonFolder}/${modClassName}.java`] = encodeUtf8(
    interpolateTemplate(ModClass_java, view),
  );

  ret[`${clientFolder}/${modClassName}Client.java`] = encodeUtf8(
    interpolateTemplate(ModClassClient_java, view),
  );

  if (settings.mixins) {
    ret[`src/common/resources/${settings.modId}.common.mixins.json`] = encodeUtf8(
      interpolateTemplate(mixins_json, view),
    );
  }

  return ret;
}

function encodeUtf8(content: string): Uint8Array {
  return new TextEncoder().encode(content);
}
