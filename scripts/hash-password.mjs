#!/usr/bin/env node
import { hash } from "bcryptjs";
import { argv, exit } from "node:process";

const password = argv[2];

if (!password) {
  console.error("Usage: node scripts/hash-password.mjs <password>");
  console.error("Outputs the bcrypt hash to stdout. Copy it into ADMIN_PASSWORD_HASH env.");
  exit(1);
}

const result = await hash(password, 12);
process.stdout.write(result + "\n");
