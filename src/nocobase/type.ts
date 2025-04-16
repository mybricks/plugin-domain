export type DomainModelNocobase = {
  id: string;
  type: "nocobase";
  connect: {
    /** https://xxxx/api */
    baseURL: string;
    token: string;
  };
};
