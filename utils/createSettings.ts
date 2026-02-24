export default function createSettings(list: any[]): Record<string, string> {
  const result = list.map((item) => ({
    [item.key]: item.value,
  }));
  return Object.assign({}, ...result);
}
