import { createRouter } from "./context";
import { z } from "zod";
import { urlsValidator } from "../../shared/urls";
import { Link } from "@prisma/client";

export const linkRouter = createRouter()
  .query("getAll", {
    async resolve({ ctx }) {
      return await ctx.prisma.link.findMany();
    },
  })
  .mutation("insertLink", {
    input: urlsValidator,
    async resolve({ input, ctx }) {
      let res = new Array<Link>();
      if (typeof input.url === "string") {
        res.push(
          await ctx.prisma.link.create({
            data: {
              url: input.url,
            },
          })
        );
      }
      if (input.fileUrls !== null) {
        console.log("\n\n\n\n TYPEEE", typeof input.fileUrls);
        console.log("keys", Object.keys(input.fileUrls!));
        console.log("file", input.fileUrls);
        input.fileUrls.map(async url => {
          res.push(
            await ctx.prisma.link.create({
              data: {
                url: url,
              },
            })
          );
        });
      }
      return res.length;
    },
  })
  .mutation("deleteAll", {
    async resolve({ ctx }) {
      return await ctx.prisma.link.deleteMany();
    },
  });
