declare module "encoding" {
  export function convert(str: string | Buffer, to: string, from: string, useLite?: boolean): Buffer;
}