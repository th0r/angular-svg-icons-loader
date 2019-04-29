import {
  dirname,
  resolve
} from "path";

export function resolveComponentTemplateUrl(componentFilePath: string, templateUrl: string): string {
  const componentDir = dirname(componentFilePath);
  return resolve(componentDir, templateUrl);
}
