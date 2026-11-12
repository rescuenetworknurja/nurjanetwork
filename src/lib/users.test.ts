import { describe, expect, it } from "vitest";
import { filterUsers, isMinor, seedUsers, userDossierCsv, usersToCsv } from "./users";

describe("filterUsers", () => {
  it("searches by name, phone, ID number and user ID", () => {
    expect(filterUsers(seedUsers, "nadia", "all").map((u) => u.id)).toEqual(["self"]);
    expect(filterUsers(seedUsers, "01712001122", "all").map((u) => u.id)).toEqual(["u2"]);
    expect(filterUsers(seedUsers, "20101234567890123", "all").map((u) => u.id)).toEqual(["u8"]);
    expect(filterUsers(seedUsers, "u7", "all").map((u) => u.id)).toEqual(["u7"]);
  });
  it("filters minors and adults by calculated age", () => {
    expect(filterUsers(seedUsers, "", "minor").every(isMinor)).toBe(true);
    expect(filterUsers(seedUsers, "", "adult").every((u) => !isMinor(u))).toBe(true);
  });
  it("filters suspended/banned and false-SOS-flagged accounts", () => {
    expect(filterUsers(seedUsers, "", "banned").map((u) => u.id)).toEqual(["u7"]);
    expect(filterUsers(seedUsers, "", "false").map((u) => u.id)).toEqual(["u3", "u7"]);
  });
  it("combines search and filter", () => {
    expect(filterUsers(seedUsers, "akter", "banned").map((u) => u.id)).toEqual(["u7"]);
  });
});

describe("CSV exports", () => {
  it("exports a header plus one row per user", () => {
    const lines = usersToCsv(seedUsers).split("\n");
    expect(lines).toHaveLength(seedUsers.length + 1);
    expect(lines[0]).toContain("Last Latitude");
  });
  it("quotes cells containing commas", () => {
    expect(usersToCsv(seedUsers)).toContain('"Shantinagar, Dhaka"');
  });
  it("dossier includes ban reason and SOS history", () => {
    const csv = userDossierCsv(seedUsers[6]!, [{ id: "SOS-1", date: "Nov 09", area: "Kakrail", outcome: "False alarm", duration: "1m" }]);
    expect(csv).toContain("Repeated False / Prank SOS Alerts");
    expect(csv).toContain("SOS-1");
  });
});
