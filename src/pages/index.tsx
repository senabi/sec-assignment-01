import type { NextPage } from "next";
import Head from "next/head";
import React, { useEffect } from "react";
import { trpc } from "../utils/trpc";
import { useForm, Resolver } from "react-hook-form";
import { ErrorMessage } from "@hookform/error-message";
import { MdUploadFile as UploadFileIcon } from "react-icons/md";
import { MdCached as ProcessingIcon } from "react-icons/md";
import { MdAddLink as LinkIcon } from "react-icons/md";
import { BsMicrosoft as MicrosoftIcon } from "react-icons/bs";
import {
  FaFirefoxBrowser as FirefoxIcon,
  FaChrome as ChromeIcon,
} from "react-icons/fa";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

type FormValues = {
  url: string;
  files: FileList;
};

const schema = z.object({
  url: z
    .string()
    // .min(1, { message: "URL is required" })
    .optional()
    .refine(
      url => {
        if (url) {
          return /[(http(s)?):\/\/(www\.)?a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/.test(
            url
          );
        }
        return true;
      },
      { message: "Invalid URL" }
    ),
  files: z
    .any()
    .optional()
    .refine(
      (files: FileList) => {
        console.log("AAAAAAAAAAAAAAAAAAAAAAAAA");
        for (let i = 0; i < files.length; i++) {
          if (
            !"text/plain".includes(files.item(i)!.type) ||
            !files.item(i)!.name.includes(".txt")
          ) {
            return false;
          }
        }
        return true;
        // }, "Only plain text files are accepted")
      },
      { message: "Only plain text files are accepted" }
    ),
});

const resolver: Resolver<FormValues> = async values => {
  return { values, errors: "1" };
};

const Home: NextPage = () => {
  const links = trpc.useQuery(["links.getAll"]);
  const linksMutation = trpc.useMutation(["links.insertLink"], {
    onSuccess: () => {
      window.location.reload();
    },
  });
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isValid },
  } = useForm<FormValues>({ resolver: zodResolver(schema), mode: "onChange" });
  // } = useForm<FormValues>();
  const files = watch("files");
  const url = watch("url");
  const [disableSubmit, setDisableSubmit] = React.useState(true);

  React.useEffect(() => {
    if (!files && !url) {
      setDisableSubmit(true);
      return;
    }
    if (!files.length && !url) {
      setDisableSubmit(true);
      return;
    }
    if (url || files.length > 0) {
      setDisableSubmit(false);
      return;
    }
  }, [files, url]);

  const onSubmit = (data: FormValues) => {
    console.log("data submitted", data);
    if (data.url) {
      linksMutation.mutate({ url: data.url });
    }
  };

  return (
    <>
      <Head>
        <title>Digital Certificates Trust Verifier</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="container mx-auto flex flex-col items-center min-h-screen px-8 gap-4">
        <h1 className="text-4xl lg:text-6xl leading-normal font-extrabold w-full py-8">
          <p>Digital Certificates</p>
          <p>Trust Verifier</p>
        </h1>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col lg:flex-row gap-4 w-full justify-center self-start"
        >
          <div className="w-full relative">
            <span
              className={`absolute inset-y-0 lg:top-3 ${
                errors.url && "bottom-6 lg:bottom-0"
              } left-0 flex lg:block items-center pl-2 text-gray-500`}
            >
              <i className="text-xl">
                <LinkIcon />
              </i>
            </span>
            <input
              type="url"
              placeholder="Type URL ..."
              className={`placeholder:italic placeholder:text-gray-500 rounded py-2 px-3 border text-gray-500 w-full focus:outline-none focus:ring-1 focus:border-sky-500 focus:ring-sky-500 pl-8 ${
                errors.url &&
                "focus:border-red-400 focus:ring-red-400 border-red-400"
              }`}
              {...register("url")}
            />
            <ErrorMessage
              errors={errors}
              name="url"
              render={({ message }) => (
                <span className="text-sm text-red-400">{message}</span>
              )}
            />
          </div>
          <div className="flex w-full lg:w-[40rem] items-start gap-4 justify-between">
            <label className="flex cursor-pointer w-full flex-col">
              <input
                type="file"
                className="file:hidden order-2 text-gray-400 max-w-[12rem] text-sm"
                // accept="text/plain, .md"
                accept="text/plain"
                multiple
                {...register("files")}
              />
              <div
                className={`order-1 bg-gray-700 hover:bg-gray-600 font-semibold border  py-2 px-4 rounded w-full flex items-center ${
                  errors.files ? "border-red-400" : "border-gray-500"
                }`}
              >
                <i className="text-xl">
                  <UploadFileIcon />
                </i>
                <p className="px-4">Load Batch</p>
              </div>
              <ErrorMessage
                errors={errors}
                name="files"
                render={({ message }) => (
                  <span className="order-3 text-sm text-red-400">
                    {message}
                  </span>
                )}
              />
            </label>
            <button
              type="submit"
              disabled={!isValid || disableSubmit}
              className={`${
                !isValid || disableSubmit
                  ? "bg-gray-600 border-gray-800 text-gray-400"
                  : "bg-gray-700 hover:bg-gray-600 border-gray-500"
              } font-semibold py-2 px-4 border  rounded w-full flex items-center justify-start`}
            >
              <i className="text-xl">
                <ProcessingIcon />
              </i>
              <p className="px-4">Verify URLs</p>
            </button>
          </div>
        </form>
        <div className="flex flex-col gap-4">
          {links.data?.map(link => (
            <div key={link.id} className="p-4 rounded bg-gray-600">
              <p>{link.url}</p>
            </div>
          ))}
        </div>
        <TrustStoreInfo />
      </main>
    </>
  );
};

const TrustStoreInfo: React.FC = () => (
  <div className="flex-1 w-full h-full flex items-end">
    <div className="flex justify-between w-full pb-4">
      <u>
        <div className="flex items-center gap-1">
          <i className="text-base">
            <FirefoxIcon />
          </i>
          <p>Mozilla Trust Store</p>
        </div>
      </u>
      <u>
        <div className="flex items-center gap-1">
          <i className="text-sm">
            <MicrosoftIcon />
          </i>
          <p>Microsoft Trust Store</p>
        </div>
      </u>
      <u>
        <div className="flex items-center gap-1">
          <i className="text-base">
            <ChromeIcon />
          </i>
          <p>Google Trust Store</p>
        </div>
      </u>
    </div>
  </div>
);

export default Home;
