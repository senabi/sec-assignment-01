import type { NextPage } from "next";
import Head from "next/head";
import React from "react";
import { trpc } from "../utils/trpc";
import { useForm, FieldErrorsImpl } from "react-hook-form";
import useCollapse from "react-collapsed";
import { MdUploadFile as UploadFileIcon } from "react-icons/md";
import { MdCached as ProcessingIcon } from "react-icons/md";
import { MdAddLink as LinkIcon } from "react-icons/md";
import { BsMicrosoft as MicrosoftIcon } from "react-icons/bs";
import {
  FaFirefoxBrowser as FirefoxIcon,
  FaChrome as ChromeIcon,
  FaCircleNotch as CircleIcon,
  FaEdge as EdgeIcon,
} from "react-icons/fa";
import { zodResolver } from "@hookform/resolvers/zod";
import Tippy from "@tippyjs/react";
import "tippy.js/dist/tippy.css";

import { UrlsType, urlsValidator } from "../shared/urls";
import { Link } from "@prisma/client";
import { getBreakpointValue } from "../utils/tailwind";

type FormInputType = {
  errors: FieldErrorsImpl<UrlsType>;
  field: keyof UrlsType;
  children: React.ReactElement;
  placement: "top-start" | "right" | "top-end";
};
const FormInput: React.FC<FormInputType> = ({
  errors,
  field,
  children,
  placement,
}) => {
  const [errMsg, setErrMsg] = React.useState(errors[field]?.message);
  React.useEffect(() => {
    if (errors[field]?.message) {
      setErrMsg(errors[field]?.message);
    }
  }, [errors[field]?.message]);
  return (
    <>
      <Tippy
        content={
          <div className="min-w-[1rem] font-medium min-h-[1rem]">{errMsg}</div>
        }
        visible={errors[field] ? true : false}
        placement={placement}
        theme="error"
        inertia
      >
        {children}
      </Tippy>
    </>
  );
};

const UrlsFormContent = () => {
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
  } = useForm<UrlsType>({
    resolver: zodResolver(urlsValidator),
    mode: "onChange",
    defaultValues: {
      url: null,
      fileUrls: null,
    },
  });

  const onSubmit = (data: UrlsType) => {
    console.log("data submitted", data);
    linksMutation.mutate(data);
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col lg:flex-row gap-4 w-full justify-center self-start"
    >
      <FormInput errors={errors} field="url" placement="top-start">
        <div className="w-full relative">
          <span
            className={`absolute inset-y-0 lg:top-3 left-0 flex lg:block items-center pl-2 text-gray-400`}
          >
            <i className="text-xl">
              <LinkIcon />
            </i>
          </span>

          <input
            placeholder="Type URL ..."
            className={`pl-8 outline-none border text-sm rounded-lg block w-full p-2.5 bg-gray-700 dark:border-gray-600 placeholder-gray-400 text-white focus:ring-blue-500 focus:border-blue-500 ${
              errors.url &&
              "focus:border-red-400 focus:ring-red-400 border-red-400"
            }`}
            {...register("url")}
          />
        </div>
      </FormInput>

      <div className="flex w-full lg:w-[40rem] items-start gap-4 justify-between flex-col sm:flex-row">
        <FormInput errors={errors} field="fileUrls" placement="top-end">
          <label className="flex cursor-pointer w-full flex-col">
            <input
              type="file"
              className="file:hidden order-2 text-gray-400 max-w-[12rem] text-sm w-full"
              accept="text/plain"
              {...register("fileUrls")}
            />
            <div
              className={`order-1 bg-gray-700 hover:bg-gray-600 font-semibold border py-2 px-4 rounded-lg w-full flex items-center ${
                errors.fileUrls ? "border-red-400" : "border-gray-500"
              }`}
            >
              <i className="text-xl">
                <UploadFileIcon />
              </i>
              <p className="px-4 whitespace-nowrap overflow-hidden overflow-ellipsis">
                Batch
              </p>
            </div>
          </label>
        </FormInput>

        <button
          type="submit"
          disabled={!isValid}
          className={`${
            !isValid
              ? "bg-gray-600 border-gray-800 text-gray-400"
              : "bg-gray-700 hover:bg-gray-600 border-gray-500"
          } font-semibold py-2 px-4 border rounded-lg w-full flex items-center justify-start`}
        >
          <i className="text-xl">
            <ProcessingIcon />
          </i>
          <p className="px-4 whitespace-nowrap overflow-hidden overflow-ellipsis">
            Verify
          </p>
        </button>
      </div>
    </form>
  );
};

type ScoreContentType = {
  score: number;
  vendor: "Microsoft Edge" | "Google Chrome" | "Mozilla Firefox";
};
const ScoreContent: React.FC<ScoreContentType> = ({ score, vendor }) => {
  return (
    <div className="flex justify-evenly items-center">
      <div className="sm:hidden">
        <p className="text-center">{vendor}</p>
      </div>
      <div className="flex text-4xl items-center justify-center">
        <CircleIcon className={`px-2 ${score >= 1 && "text-green-400"} `} />
        <CircleIcon className={`px-2 ${score >= 2 && "text-green-400"}`} />
        <CircleIcon className={`px-2 ${score === 3 && "text-green-400"} `} />
      </div>
    </div>
  );
};

const Labels = ({ labels }: { labels: string[] }) => (
  <>
    {labels.map(i => (
      <div
        key={i}
        className="hidden sm:flex justify-center items-center font-bold"
      >
        <p className="overflow-hidden whitespace-nowrap text-ellipsis">{i}</p>
      </div>
    ))}
  </>
);

const UrlItem: React.FC<{ link: Link }> = ({ link }) => {
  const { getCollapseProps, getToggleProps, isExpanded } = useCollapse();
  // const React
  React.useEffect(() => {
    console.log(getBreakpointValue("md"));
  }, []);
  return (
    <>
      {/* mobile */}
      <button
        {...getToggleProps()}
        className="bg-gray-700 p-4 rounded-lg text-left select-none sm:hidden"
      >
        <div className="flex flex-col gap-4">
          <div className="flex">
            <a className="truncate block text-sky-400" href={link.url}>
              {link.url}
            </a>
          </div>
          <div {...getCollapseProps()}>
            <ScoreContent vendor="Microsoft Edge" score={1} />
            <ScoreContent vendor="Google Chrome" score={0} />
            <ScoreContent vendor="Mozilla Firefox" score={3} />
          </div>
        </div>
      </button>

      {/* else */}
      <div className="bg-gray-700 p-4 rounded-lg hidden sm:block">
        <div className="flex items-center h-full">
          <a className="truncate block text-sky-400" href={link.url}>
            {link.url}
          </a>
        </div>
      </div>
      <div className="bg-gray-600 p-4 rounded-lg hidden sm:block">
        <ScoreContent score={1} vendor="Microsoft Edge" />
      </div>
      <div className="bg-gray-600 p-4 rounded-lg hidden sm:block">
        <ScoreContent score={1} vendor="Google Chrome" />
      </div>
      <div className="bg-gray-600 p-4 rounded-lg hidden sm:block">
        <ScoreContent score={3} vendor="Mozilla Firefox" />
      </div>
    </>
  );
};

const GridContent: React.FC<{ links: Link[] }> = ({ links }) => {
  return (
    <div className="w-full">
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Labels
          labels={["URL", "Microsoft", "Google Chrome", "Mozilla Firefox"]}
        />
        {links.map(link => (
          <div
            key={link.id}
            className="sm:col-span-4 grid-cols-1 grid sm:grid-cols-4 gap-4"
          >
            <UrlItem link={link} />
          </div>
        ))}
      </div>
    </div>
  );
};

const Test = () => {
  return null;
};

const Home: NextPage = () => {
  const links = trpc.useQuery(["links.getAll"]);
  // links.data

  const clearMutation = trpc.useMutation(["links.deleteAll"], {
    onSuccess: () => {
      window.location.reload();
    },
  });
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
        <UrlsFormContent />
        <Test />
        {links.data && <GridContent links={links.data} />}
        {links.data && links.data.length > 0 && (
          <button
            className={`bg-gray-700 hover:bg-gray-600 border-gray-500 font-semibold py-2 px-4 border rounded-lg`}
            onClick={() => {
              clearMutation.mutate();
            }}
          >
            Clear All
          </button>
        )}
        <TrustStoreInfo />
      </main>
    </>
  );
};

const TrustStoreInfo = () => (
  <div className="flex-1 w-full h-full flex items-end justify-center">
    <div className="flex justify-center sm:justify-between w-full pb-4 flex-col sm:flex-row">
      <u>
        <div className="flex items-center gap-1">
          <FirefoxIcon />
          <p>Mozilla Trust Store</p>
        </div>
      </u>
      <u>
        <div className="flex items-center gap-1">
          <MicrosoftIcon />
          <p>Microsoft Trust Store</p>
        </div>
      </u>
      <u>
        <div className="flex items-center gap-1">
          <ChromeIcon />
          <p>Google Trust Store</p>
        </div>
      </u>
    </div>
  </div>
);

export default Home;
