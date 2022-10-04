import { z, ZodError, ZodType } from "zod";

const urlsArrayValidator = z.string().url().array();

const parseTextFileUrls = async (f: File) => {
  const value = (await f.text()).split("\n");
  if (value.length > 1 && value[value.length - 1]!.trim() === "") {
    value.splice(value.length - 1, 1);
  }
  return urlsArrayValidator.safeParse(value);
};

const fileUrlsValidator =
  typeof window === "undefined"
    ? z.string().url().array().max(100).nullable()
    : z
        .instanceof(FileList)
        .transform(async (fileList, ctx) => {
          const f = fileList.item(0);
          console.log({ "f result": f });
          if (f === null) {
            // nullish
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
          const mxsz = 256;
          if (f.size / 1024 > mxsz) {
            console.log("size KB", f.size / 1024);
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: `Max size is ${mxsz}KB`,
            });
            return null;
          }
          // const txt = (await f.text()).split(/\r?\n/);
          // console.log(txt);
          const parsed = await parseTextFileUrls(f);
          // console.log({ x: parsed.success ? parsed.data : null });
          if (!parsed.success) {
            console.log("invalid urls");
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: "File contains invalid url",
            });
            return null;
          }
          if (parsed.data.length > 100) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: "There are more than 100 urls",
            });
            return null;
          }
          return parsed.data;
        })
        .nullable();

export const urlsValidator = z
  .object({
    url: z
      .string()
      .trim()
      .url()
      .nullable()
      .or(z.literal("").transform(() => null)),
    fileUrls: fileUrlsValidator,
  })
  .refine(
    data => {
      // console.log("refine", data);
      return !(data.fileUrls === null && data.url === null);
    },
    {
      message: "You have to type at least 1 url",
      path: ["url"],
    }
  );

export type UrlsType = z.infer<typeof urlsValidator>;
