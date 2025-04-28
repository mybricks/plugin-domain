import type { AxiosResponse, AxiosRequestConfig } from "axios";

type Axios<R = unknown> = (
  config: AxiosRequestConfig<unknown>,
) => Promise<AxiosResponse<{ data: R }, Any>>;

export type { Axios };
