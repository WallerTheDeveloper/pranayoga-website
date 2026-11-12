/**
 * What the mocked `next/headers` returns in integration tests. Tests flip `draftMode` and set
 * `headers` (e.g. an admin's auth cookie) to exercise the content layer's read modes.
 */
export const nextState = {
  draftMode: false,
  headers: new Headers(),
}

export function resetNextState(): void {
  nextState.draftMode = false
  nextState.headers = new Headers()
}
