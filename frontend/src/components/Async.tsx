import type { ReactNode } from "react";
import { ApiError } from "../api/client";
import type { AsyncState } from "../useAsync";

export function Async<T>({ state, children }: { state: AsyncState<T>; children: (data: T) => ReactNode }) {
  if (state.status === "loading") return <p role="status">Loading…</p>;
  if (state.status === "error") {
    const notFound = state.error instanceof ApiError && state.error.status === 404;
    return <p role="alert">{notFound ? "We couldn't find that." : "Something went wrong. Please try again."}</p>;
  }
  return <>{children(state.data)}</>;
}
