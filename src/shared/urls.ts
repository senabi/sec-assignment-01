import { z } from "zod";

const sslTlsUrlValidator = z
  .string()
  .trim()
  .url()
  .startsWith("https", { message: "URL doesn't implement https protocol" })
  .nullable()
  .or(z.literal("").transform(() => null));

const sslTlsUrlArrayValidator = z
  .string()
  .trim()
  .url({ message: "File contains invalid URLs" })
  .startsWith("https", { message: "Some URLs don't implement https protocol" })
  .array()
  .max(100, { message: "There are more than 100 URLs" })
  .nullable();

const parseTextFileUrls = async (f: File) => {
  const value = (await f.text()).split("\n");
  if (value.length > 1 && value[value.length - 1]!.trim() === "") {
    value.splice(value.length - 1, 1);
  }
  return sslTlsUrlArrayValidator.safeParse(value);
};

const fileUrlsValidator =
  typeof window === "undefined"
    ? sslTlsUrlArrayValidator
    : z
        .instanceof(FileList)
        .transform(async (fileList, ctx) => {
          const f = fileList.item(0);
          console.log({ "f result": f });
          if (f === null) {
            return null;
          }
          const isTextFile =
            "text/plain".includes(f.type) && f.name.includes(".txt");
          if (!isTextFile) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: "Only .txt files are allowed",
            });
            return null;
          }
          const mxsz = 128;
          if (f.size / 1024 > mxsz) {
            console.log("size KB", f.size / 1024);
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: `Max size is ${mxsz}KB`,
            });
            return null;
          }
          const parsed = await parseTextFileUrls(f);
          if (!parsed.success) {
            const errMsg = new Set(parsed.error.errors.map(err => err.message));
            errMsg.forEach(err => {
              ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: err,
              });
            });
            return null;
          }
          return parsed.data;
        })
        .nullable();

export const urlsValidator = z
  .object({
    url: sslTlsUrlValidator,
    fileUrls: fileUrlsValidator,
  })
  .refine(
    data => {
      return !(data.fileUrls === null && data.url === null);
    },
    {
      message: "You have to type at least 1 url",
      path: ["url"],
    }
  );

export type UrlsType = z.infer<typeof urlsValidator>;
