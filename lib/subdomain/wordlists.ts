import { WordlistSize } from "./config";

export const ENV_TIER_WORDS_COMPACT: readonly string[] = [
  "dev",
  "staging",
  "stg",
  "test",
  "qa",
  "uat",
  "prod",
  "preprod",
  "sandbox",
  "demo",
  "beta",
  "internal",
];

export const ENV_TIER_WORDS_EXTENDED: readonly string[] = [
  ...ENV_TIER_WORDS_COMPACT,
  "dev1",
  "dev2",
  "dev3",
  "corp",
  "integration",
  "preview",
  "canary",
  "alpha",
  "live",
  "release",
  "hotfix",
  "backup",
  "training",
];

export const SERVICE_WORDS_COMPACT: readonly string[] = [
  "api",
  "app",
  "admin",
  "portal",
  "dashboard",
  "vpn",
  "mail",
  "smtp",
  "ns",
  "cdn",
  "static",
  "assets",
  "img",
  "media",
  "auth",
];

export const SERVICE_WORDS_EXTENDED: readonly string[] = [
  ...SERVICE_WORDS_COMPACT,
  "sso",
  "login",
  "git",
  "gitlab",
  "jenkins",
  "ci",
  "jira",
  "confluence",
  "wiki",
  "docs",
  "status",
  "monitor",
  "grafana",
  "s3",
  "storage",
  "ftp",
  "sftp",
  "remote",
  "rdp",
  "ssh",
  "db",
  "redis",
  "proxy",
  "gateway",
  "ws",
  "graphql",
];

export const REGION_WORDS_COMPACT: readonly string[] = [
  "us",
  "eu",
  "uk",
  "asia",
  "apac",
  "us-east",
  "us-west",
  "eu-west",
  "eu-central",
  "dc1",
];

export const REGION_WORDS_EXTENDED: readonly string[] = [
  ...REGION_WORDS_COMPACT,
  "dc2",
  "az",
  "aws",
  "gcp",
  "azure",
  "ca",
  "au",
  "in",
  "jp",
  "sg",
  "de",
  "fr",
  "global",
];

export function getEnvTierWords(size: WordlistSize): readonly string[] {
  return size === "extended" ? ENV_TIER_WORDS_EXTENDED : ENV_TIER_WORDS_COMPACT;
}

export function getServiceWords(size: WordlistSize): readonly string[] {
  return size === "extended" ? SERVICE_WORDS_EXTENDED : SERVICE_WORDS_COMPACT;
}

export function getRegionWords(size: WordlistSize): readonly string[] {
  return size === "extended" ? REGION_WORDS_EXTENDED : REGION_WORDS_COMPACT;
}
