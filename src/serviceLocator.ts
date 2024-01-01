export const serviceLocator = {
  dependencies: [] as any,
  get(name) {
    return this.dependencies[name];
  },
  register(name, instance) {
    this.dependencies[name] = instance;
  },
};
