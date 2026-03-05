import { z } from "zod";

export const AuthSchemas = {
  register: z.object({
    uuid: z.string().uuid(),
    username: z.string().min(3).max(50),
    keyHash: z.string().length(64),
  }),
  token: z.object({
    type: z.enum(["human", "agent"]),
    uuid: z.string().uuid().optional(),
    keyHash: z.string().length(64).optional(),
    ownerKey: z.string().optional(),
  }),
};

export const BookmarkSchemas = {
  create: z.object({
    id: z.string().uuid().optional(),
    url: z.string().url(),
    title: z.string().min(1).max(255),
    description: z.string().max(1000).optional(),
    favicon: z.string().url().optional().or(z.literal("")),
    tags: z.array(z.string()).max(20).optional(),
    folderId: z.string().uuid().optional().nullable(),
    starred: z.boolean().optional(),
    archived: z.boolean().optional(),
    color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional().nullable(),
    createdAt: z.string().datetime().optional(),
  }),
  update: z.object({
    url: z.string().url().optional(),
    title: z.string().min(1).max(255).optional(),
    description: z.string().max(1000).optional(),
    favicon: z.string().url().optional().or(z.literal("")),
    tags: z.array(z.string()).max(20).optional(),
    folderId: z.string().uuid().optional().nullable(),
    starred: z.boolean().optional(),
    archived: z.boolean().optional(),
    color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional().nullable(),
  }),
};

export const FolderSchemas = {
  create: z.object({
    id: z.string().uuid().optional(),
    name: z.string().min(1).max(100),
    parentId: z.string().uuid().optional().nullable(),
    color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  }),
  update: z.object({
    name: z.string().min(1).max(100).optional(),
    parentId: z.string().uuid().optional().nullable(),
    color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional().nullable(),
  }),
};

export const AgentKeySchemas = {
  create: z.object({
    id: z.string().uuid().optional(),
    name: z.string().min(1).max(100),
    description: z.string().max(500).optional().nullable(),
    apiKey: z.string().optional(),
    permissions: z.object({
      canRead: z.boolean().optional(),
      canWrite: z.boolean().optional(),
      canEdit: z.boolean().optional(),
      canMove: z.boolean().optional(),
      canDelete: z.boolean().optional(),
      level: z.string().optional(),
    }).optional(),
    expirationType: z.enum(["never", "30d", "60d", "90d", "custom"]).optional(),
    expirationDate: z.string().datetime().optional().nullable(),
    rateLimit: z.number().int().min(1).max(10000).optional().nullable(),
  }),
};
