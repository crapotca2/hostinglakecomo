#!/usr/bin/env node
import { Command } from "commander";
import { listProperties } from "../core/tools/list-properties.js";

const program = new Command();

program
  .name("host-como-ops")
  .description("Host Como — Beds24 operations CLI")
  .version("0.0.1");

program
  .command("list-properties")
  .description("List all properties on the Beds24 account")
  .action(async () => {
    try {
      const out = await listProperties();
      console.log(JSON.stringify(out, null, 2));
    } catch (err) {
      console.error("[list-properties] failed:", err instanceof Error ? err.message : err);
      process.exit(1);
    }
  });

program.parseAsync(process.argv);
