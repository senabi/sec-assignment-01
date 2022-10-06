import { createRouter } from "./context";
import { urlsValidator } from "../../shared/urls";
import { Link } from "@prisma/client";
import * as tls from "tls";

const testUrl = (url: string) => {
  return new Promise<tls.PeerCertificate>(resolve => {
    // const host =
    //   url.slice(-1) === "/" ? url.substring(8).slice(0, -1) : url.substring(8);
    const { hostname } = new URL(url);
    console.log("\n\n\n\n\n\n HOSTNAME", hostname);
    // urlObj.
    const socket = tls.connect(
      {
        port: 443,
        host: hostname,
        servername: hostname,
      },
      () => {
        resolve(socket.getPeerCertificate());
      }
    );
  });
};

export const linkRouter = createRouter()
  .query("getAll", {
    async resolve({ ctx }) {
      return await ctx.prisma.link.findMany();
    },
  })
  .mutation("insertLink", {
    input: urlsValidator,
    async resolve({ input, ctx }) {
      const res = new Array<Link>();
      if (typeof input.url === "string") {
        const resUrl = await testUrl(input.url);
        console.log("\n\n\n\n res", resUrl);
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
