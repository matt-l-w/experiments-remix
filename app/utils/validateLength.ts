export function validateLength(thing: string, msg: string) {
  if (thing.length < 3)
    return msg;
}
