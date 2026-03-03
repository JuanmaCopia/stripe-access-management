export type SuccessResult<T> = {
  ok: true;
  value: T;
};

export type FailureResult<E> = {
  ok: false;
  error: E;
};

export type Result<T, E> = SuccessResult<T> | FailureResult<E>;

export function success<T>(value: T): SuccessResult<T> {
  return {
    ok: true,
    value
  };
}

export function failure<E>(error: E): FailureResult<E> {
  return {
    ok: false,
    error
  };
}
