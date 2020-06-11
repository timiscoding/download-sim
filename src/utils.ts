export const assertNever = (_arg: never): never => {
  throw new Error("Assert never");
};
