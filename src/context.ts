class Cache {
  private _domainModelsMap: Record<string, DomainModel[]> = {};
  constructor() {}

  getDomainModels(domainModelId: string) {
    return this._domainModelsMap[domainModelId];
  }

  setDomainModels(domainModelId: string, domainModels: DomainModel[]) {
    this._domainModelsMap[domainModelId] = domainModels;
  }

  clearDomainModels(domainModelId: string) {
    Reflect.deleteProperty(this._domainModelsMap, domainModelId);
  }
}

const context = {
  cache: new Cache(),
};

export default context;
