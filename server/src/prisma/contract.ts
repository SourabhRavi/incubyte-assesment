import {
  check,
  defineContract,
  enumType,
  member,
  sql,
} from "@prisma/orm-postgres/contract-builder";

const Country = enumType(
  "Country",
  { codecId: "pg/text@1" } as const,
  member("India", "India"),
  member("UnitedStates", "United States"),
  member("UnitedKingdom", "United Kingdom"),
  member("Germany", "Germany"),
  member("Canada", "Canada"),
);

const Currency = enumType(
  "Currency",
  { codecId: "pg/text@1" } as const,
  member("INR", "INR"),
  member("USD", "USD"),
  member("GBP", "GBP"),
  member("EUR", "EUR"),
  member("CAD", "CAD"),
);

const JobTitle = enumType(
  "JobTitle",
  { codecId: "pg/text@1" } as const,
  member("FrontendDeveloper", "Frontend Developer"),
  member("BackendDeveloper", "Backend Developer"),
  member("FullStackDeveloper", "Full Stack Developer"),
  member("SoftwareEngineer", "Software Engineer"),
  member("QAEngineer", "QA Engineer"),
  member("DevOpsEngineer", "DevOps Engineer"),
  member("DataAnalyst", "Data Analyst"),
  member("ProductManager", "Product Manager"),
  member("EngineeringManager", "Engineering Manager"),
  member("UIUXDesigner", "UI/UX Designer"),
);

export const contract = defineContract({}, ({ field, model, type, gen }) => {
  const Employee = model("Employee", {
    fields: {
      id: field.column(type.Uuid()).id().onCreate(gen.uuid(7)),

      fullName: field.column(type.String()),

      email: field.column(type.String()).unique(),

      jobTitle: field.namedType(JobTitle),

      country: field.namedType(Country),

      salary: field.column(type.Decimal()),

      currency: field.namedType(Currency),

      createdAt: field.column(type.temporal.CreatedAt()),

      updatedAt: field.column(type.temporal.UpdatedAt()),

      deletedAt: field.column(type.DateTime()).optional(),
    },
  });

  return {
    enums: {
      Country,
      Currency,
      JobTitle,
    },

    models: {
      Employee: Employee.sql(({ cols, constraints }) => ({
        table: "employees",

        indexes: [
          constraints.index([cols.country], {
            name: "employees_country_idx",
          }),

          constraints.index([cols.country, cols.jobTitle], {
            name: "employees_country_job_title_idx",
          }),
        ],

        checks: [
          check({
            expression: sql`salary >= 0`,
            name: "employees_salary_nonnegative",
          }),

          check({
            expression: sql`(
                ("country" = 'India' AND "currency" = 'INR')
                OR ("country" = 'United States' AND "currency" = 'USD')
                OR ("country" = 'United Kingdom' AND "currency" = 'GBP')
                OR ("country" = 'Germany' AND "currency" = 'EUR')
                OR ("country" = 'Canada' AND "currency" = 'CAD')
              )`,
            name: "employees_country_currency_match",
          }),
        ],
      })),
    },
  };
});
