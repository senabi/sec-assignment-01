import { createRouter } from "./context";
import { z } from "zod";

export const linkRouter = createRouter()
  .query("getAll", {
    async resolve({ ctx }) {
      return await ctx.prisma.link.findMany();
    },
  })
  .mutation("insertLink", {
    input: z.object({
      url: z.string(),
    }),
    async resolve({ input, ctx }) {
      return await ctx.prisma.link.create({
        data: {
          url: input.url,
        },
      });
    },
  })
  .mutation("deleteAll", {
    async resolve({ ctx }) {
      return await ctx.prisma.link.deleteMany();
    },
  });
