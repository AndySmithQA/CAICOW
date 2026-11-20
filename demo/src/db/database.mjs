import { existsSync, readFileSync, writeFileSync } from "node:fs";

const seedFile = new URL("../../data/seed.json", import.meta.url);

const idPrefixes = { requests: "REQ-" };

export function openDatabase({ file } = {}) {
  const source = file && existsSync(file) ? file : seedFile;
  const tables = JSON.parse(readFileSync(source, "utf8"));

  function save() {
    if (file) writeFileSync(file, `${JSON.stringify(tables, null, 2)}\n`);
  }

  function nextId(table) {
    const prefix = idPrefixes[table];
    const highest = tables[table].reduce((max, row) => Math.max(max, Number(row.id.slice(prefix.length))), 1000);
    return `${prefix}${highest + 1}`;
  }

  return {
    all(table) {
      return structuredClone(tables[table]);
    },
    find(table, id) {
      const row = tables[table].find((candidate) => candidate.id === id);
      return row ? structuredClone(row) : undefined;
    },
    insert(table, values) {
      const row = { id: nextId(table), ...values };
      tables[table].push(row);
      save();
      return structuredClone(row);
    },
    update(table, id, changes) {
      const row = tables[table].find((candidate) => candidate.id === id);
      Object.assign(row, changes);
      save();
      return structuredClone(row);
    },
  };
}
