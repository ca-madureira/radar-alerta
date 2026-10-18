import { environment } from "./src/config/environment.js";
import * as common from "./src/modules/common/index.js";
import * as catalog from "./src/modules/catalog/index.js";
import * as monitors from "./src/modules/monitors/index.js";
import * as notifications from "./src/modules/notifications/index.js";
import * as devices from "./src/modules/devices/index.js";
import * as feedback from "./src/modules/feedback/index.js";
import * as plans from "./src/modules/plans/index.js";
import * as jobs from "./src/modules/jobs/index.js";

const configuration = {
  service: "alertas-monitoramento",
  frameworkVersion: "4",
  useDotenv: true,
  build: {
    esbuild: {
      external: ["@prisma/client"],
      banner: {
        js: "import { createRequire } from 'node:module'; const require = createRequire(import.meta.url);",
      },
    },
  },
  package: {
    patterns: [
      "!.env*",
      "!tests/**",
      "node_modules/.prisma/client/**",
      "!node_modules/.prisma/client/*query_engine*",
      "node_modules/.prisma/client/libquery_engine-rhel-openssl-3.0.x.so.node",
    ],
  },
  provider: {
    name: "aws",
    runtime: "nodejs22.x",
    region: "us-east-2",
    stage: "${opt:stage, 'dev'}",
    memorySize: 512,
    timeout: 28,
    httpApi: {
      cors: {
        allowedOrigins: ["*"],
        allowedHeaders: ["authorization", "content-type"],
        allowedMethods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
      },
    },
    environment,
  },
  functions: {
    ...common,
    ...catalog,
    ...monitors,
    ...notifications,
    ...devices,
    ...feedback,
    ...plans,
    ...jobs,
    // Preserve authenticated 404 responses for unmatched routes.
    api: {
      handler: "src/handlers/api.handler",
      events: [
        { httpApi: { path: "/{proxy+}", method: "ANY" } },
        { httpApi: { path: "/", method: "ANY" } },
      ],
    },
  },
  plugins: ["serverless-offline"],
};
export default configuration;
