#!/usr/bin/env -S node
import type { Contract as End } from '../../snapshots/5bf9a1554cebb39ebf0b5c47d6685af9b72cf928377c1062d7545dac1c4f4dbb/contract';
import endContract from '../../snapshots/5bf9a1554cebb39ebf0b5c47d6685af9b72cf928377c1062d7545dac1c4f4dbb/contract.json' with { type: 'json' };
import type { Contract as Start } from '../../snapshots/810f342f4e6d9196e4e9f7ac8575456e486f6049647226954560d0f6af927426/contract';
import startContract from '../../snapshots/810f342f4e6d9196e4e9f7ac8575456e486f6049647226954560d0f6af927426/contract.json' with { type: 'json' };
import { Migration, MigrationCLI, placeholder, sql } from '@prisma/orm-postgres/migration';

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.alterColumnType({
        schema: 'public',
        table: 'employees',
        column: 'createdAt',
        type: 'timestamptz(3)',
        using: placeholder('Employee.createdAt:convert'),
      }),
      this.alterColumnType({
        schema: 'public',
        table: 'employees',
        column: 'deletedAt',
        type: 'timestamptz(3)',
        using: placeholder('Employee.deletedAt:convert'),
      }),
      this.alterColumnType({
        schema: 'public',
        table: 'employees',
        column: 'updatedAt',
        type: 'timestamptz(3)',
        using: placeholder('Employee.updatedAt:convert'),
      }),
      this.addCheckConstraint({
        schema: 'public',
        table: 'employees',
        constraint: 'employees_jobTitle_check_a7ee29aa',
        expression: sql`"jobTitle" IN ('Frontend Developer', 'Backend Developer', 'Full Stack Developer', 'Software Engineer', 'QA Engineer', 'DevOps Engineer', 'Data Analyst', 'Product Manager', 'Engineering Manager', 'UI/UX Designer')`,
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
