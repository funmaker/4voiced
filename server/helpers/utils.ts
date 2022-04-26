import HTTPError from "./HTTPError";

interface StringArgs<Req extends boolean = boolean, Null extends boolean = boolean> {
  max?: number;
  min?: number;
  trim?: boolean;
  allowNull?: Null;
  required?: Req;
}

export function checkString(string: string | null | undefined, name: string, args?: StringArgs<true>): string;
export function checkString(string: string | null, name: string, args: StringArgs<boolean, true>): string;
export function checkString(string: string | null | undefined, name: string, args: StringArgs<boolean, true>): string | undefined;
export function checkString<Str extends string | null | undefined>(string: Str, name: string, args: StringArgs): Str;
export function checkString(string: any, name: string, { max = -1, min = 1, trim = false, allowNull = false, required = true }: StringArgs = {}): string | null | undefined {
  if(required && !string) throw new HTTPError(400, `Field ${name} is required`);
  if(allowNull && string === null) return null;
  if(string === undefined) return undefined;
  if(typeof string !== "string") throw new HTTPError(400, `Field ${name} should be a string`);
  if(min > 0 && string.length === 0) throw new HTTPError(400, `Field ${name} cannot be empty`);
  if(min > 0 && string.length < min) throw new HTTPError(400, `Field ${name} should have at least ${min} characters`);
  if(max > -1 && string.length > max) throw new HTTPError(400, `Field ${name} can have at most ${max} characters`);
  
  if(trim) return string.trim();
  else return string;
}
