// Willow House Budget — the hand-in entrypoint.
//
// This file is the small program that packages the finished site for the
// judge. The site itself is a folder of static files: app/index.html plus
// its scripts and styles, with nothing fetched from the network. What this
// program does is gather that folder, together with a few screenshots of
// the site running, into the output directory, and then leave behind a
// dossier.json there — a summary the scorer reads, built by the vendored
// make.fun library so the summary is byte-identical to the scorer's own
// copy of it.
//
// It runs on plain Node 22 with only the standard library, no install and
// no build step: `node main.ts` from this directory. Outside the grader's
// container the destination can be pointed elsewhere with
// MAKEFUN_OUTPUT_DIR, e.g.:
//
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

// The folder this file sits in, so app/ and screenshots/ are found
// relative to it no matter where the command is run from.
const entryRoot = fileURLToPath(new URL('.', import.meta.url));

// Where the package goes: the grader's /output, or an override for
// local runs.
const destination = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

// The scorer's caps for this bounty (from its gate.json). Only the text
// cap shapes the dossier bytes; the rest make this program refuse an
// entry the scorer would refuse — too many screenshots, one too large,
// or an app/ too big or with too many files.
const dossierCaps = {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  app_max_files: 993,
  app_max_bytes: 16777216,
};

// Copy a folder from the entry into the destination, creating the
// destination side first. Nothing is skipped and nothing is transformed.
function mirrorFolder(name: string): void {
  const source = join(entryRoot, name);
  const target = join(destination, name);
  mkdirSync(target, { recursive: true });
  if (existsSync(source)) {
    cpSync(source, target, { recursive: true });
  }
}

// The site itself is always handed in; the screenshots are too, but only
// when the folder is there (a run without screenshots still leaves the
// empty screenshots/ directory in place).
mkdirSync(destination, { recursive: true });
mirrorFolder('app');
mirrorFolder('screenshots');

// The summary of everything just copied, written last so it describes
// the finished output directory.
writeFileSync(join(destination, 'dossier.json'), buildDossier(destination, dossierCaps));
