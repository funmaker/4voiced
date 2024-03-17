import qs, { ParsedQs } from "qs";
import { FilteringStyledOptions } from "@emotion/styled";

export type SetState<T> = React.Dispatch<React.SetStateAction<T>>;

export type ImmutableRef<T> = Readonly<React.MutableRefObject<T>>;

export function classJoin(...classes: Array<string | null | undefined | false>) {
  return classes.filter(x => x).join(" ") || undefined;
}

export function qsStringify(obj: any, options?: qs.IStringifyOptions) {
  return qs.stringify(
    obj,
    {
      arrayFormat: "brackets",
      addQueryPrefix: true,
      ...options,
    },
  );
}

export function qsParse<T extends ParsedQs>(str: string, options?: qs.IParseOptions) {
  return qs.parse(
    str,
    {
      ignoreQueryPrefix: true,
      ...options,
    },
  ) as Partial<T>;
}

type TransientProps = `$${string}`;

export const transientOptions: FilteringStyledOptions<any, TransientProps> = {
  shouldForwardProp: (propName: string): propName is TransientProps => !propName.startsWith('$'),
};
