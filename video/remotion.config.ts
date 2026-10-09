/**
 * Note: When using the Node.JS APIs, the config file
 * doesn't apply. Instead, pass options directly to the APIs.
 *
 * All configuration options: https://remotion.dev/docs/config
 */

import { Config } from "@remotion/cli/config";

Config.setRspack(true);
Config.setVideoImageFormat("jpeg");
Config.setOverwriteOutput(true);
Config.setPuppeteerTimeout(120000);
Config.setChromiumOptions((options) => [
  ...options,
  "--no-sandbox",
  "--disable-setuid-sandbox",
  "--disable-dev-shm-usage"
]);
