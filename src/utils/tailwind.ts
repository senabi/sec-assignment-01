import resolveConfig from "tailwindcss/resolveConfig";
import tailwindConfig from "../../tailwind.config.cjs"; // Fix the path

// Resolvev
// ResolvableTo<ScreensCon

const fullConfig = resolveConfig(tailwindConfig);

export const getBreakpointValue = (value: string): number =>
  // @ts-ignore
  parseInt(fullConfig.theme.screens[value]!.replace("px", ""), 10);

export const getCurrentBreakpoint = (): string => {
  let currentBreakpoint: string = "";
  let biggestBreakpointValue = 0;
  for (const breakpoint of Object.keys(fullConfig.theme!.screens!)) {
    const breakpointValue = getBreakpointValue(breakpoint);
    if (
      breakpointValue > biggestBreakpointValue &&
      window.innerWidth >= breakpointValue
    ) {
      biggestBreakpointValue = breakpointValue;
      currentBreakpoint = breakpoint;
    }
  }
  return currentBreakpoint;
};
