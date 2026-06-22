export function redirectBrowser(path: string) {
  if (window.location.pathname !== path) window.location.assign(path)
}
