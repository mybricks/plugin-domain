declare module "*.less" {
  const classes: { [key: string]: string };
  export default classes;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Any = any;

type Schema = Any;

type DomainModelNocobase = {
  type: "nocobase";
  connect: {
    origin: string;
    account: string;
    password: string;
  };
};

type DomainModelOther = {
  type: "other";
};

type Data = {
  domainModels: (DomainModelNocobase | DomainModelOther)[];
};
