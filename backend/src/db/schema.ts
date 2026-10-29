import {
  pgTable,
  pgEnum,
  uuid,
  text,
  timestamp,
  index,
} from "drizzle-orm/pg-core";

export const role = pgEnum("Role", ["USER"]);

export const tokenType = pgEnum("TokenType", [
  "REFRESH",
  "EMAIL_VERIFY",
]);

export const users = pgTable("users", {
  id: uuid("id")
    .primaryKey()
    .defaultRandom(),

    name: text("name")
    .notNull(),
    
  email: text("email")
    .notNull()
    .unique(),

  passwordHash: text("password_hash")
    .notNull(),

  role: role("role")
    .default("USER")
    .notNull(),

  phoneNumber: text("phone_number")
    .notNull(),

  countryCode: text("country_code")
    .notNull(),

  city: text("city")
    .notNull(),

  createdAt: timestamp("created_at", {
    withTimezone: true,
  })
    .notNull()
    .defaultNow(),

  updatedAt: timestamp("updated_at", {
    withTimezone: true,
  })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const tokens = pgTable("token", {
  id: uuid("id")
    .primaryKey()
    .defaultRandom(),

  type: tokenType("type")
    .notNull(),

  token: text("token")
    .unique()
    .notNull(),

  expiresAt: timestamp("expires_at", {
    withTimezone: true,
    mode: "string",
  })
    .notNull(),

  createdAt: timestamp("created_at", {
    withTimezone: true,
    mode: "string",
  })
    .notNull()
    .defaultNow(),

  consumedAt: timestamp("consumed_at", {
    withTimezone: true,
    mode: "string",
  }),

  revokedAt: timestamp("revoked_at", {
    withTimezone: true,
    mode: "string",
  }),

  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, {
      onDelete: "cascade",
    }),
}, (table) => [
  index("token_owner_type_idx").on(
    table.userId,
    table.type,
  ),
  
]);