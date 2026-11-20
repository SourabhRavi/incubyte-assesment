import { expect, test } from "@jest/globals";

import { COUNTRIES } from "../../constants/constants.js";
import { countryQuerySchema } from "./analytics.validator.js";

test("accepts every supported country for analytics", () => {
  for (const country of COUNTRIES) {
    expect(countryQuerySchema.parse({ country })).toEqual({ country });
  }
});

test.each([
  {},
  { country: "" },
  { country: "Atlantis" },
  { country: "india" },
  { country: null },
])("rejects an unsupported or missing country query: %p", (input) => {
  expect(countryQuerySchema.safeParse(input).success).toBe(false);
});

test("strips unknown query fields instead of accepting them as filters", () => {
  expect(
    countryQuerySchema.parse({
      country: "India",
      includeDeleted: true,
    }),
  ).toEqual({ country: "India" });
});
