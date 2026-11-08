import { Container } from "@cloudflare/containers";

const CPU_LIMIT = 10 * 10 ** 9; // 10s
const MEMORY_LIMIT = 256 * 2 ** 20; // 256 MiB
const PROC_LIMIT = 50;
const OUTPUT_LIMIT = 64 * 2 ** 10; // 64 KiB

export class Sandbox extends Container {
  defaultPort = 5050;

  async language(lang: string) {
    // A run just to look up how to run the language.
    const res = await this.containerFetch("http://sandbox/run", {
      method: "POST",
      body: JSON.stringify({
        cmd: [
          {
            args: ["/usr/bin/env"],
            cpuLimit: CPU_LIMIT,
            memoryLimit: MEMORY_LIMIT,
            procLimit: PROC_LIMIT,
            copyIn: { "languages.json": { src: "/languages.json" } },
            copyOut: ["languages.json"],
          },
        ],
      }),
    });
    const [{ files }] = await res.json<any[]>();
    return JSON.parse(files["languages.json"])[lang];
  }

  async run(lang: string, code: string, stdin: string) {
    // Wait up to 60s for a cold start (@cloudflare/containers default is 20s).
    await this.startAndWaitForPorts({
      cancellationOptions: { portReadyTimeoutMS: 60000 },
    });

    const { source, run, env } = await this.language(lang);
    const res = await this.containerFetch("http://sandbox/run", {
      method: "POST",
      body: JSON.stringify({
        cmd: [
          {
            args: run,
            env,
            cpuLimit: CPU_LIMIT,
            memoryLimit: MEMORY_LIMIT,
            procLimit: PROC_LIMIT,
            files: [
              { content: stdin },
              { name: "stdout", max: OUTPUT_LIMIT },
              { name: "stderr", max: OUTPUT_LIMIT },
            ],
            copyIn: { [source]: { content: code } },
          },
        ],
      }),
    });
    const [
      {
        status,
        files: { stdout, stderr },
      },
    ] = await res.json<any[]>();
    return { status, stdout, stderr };
  }
}
