import { serviceLocator } from "./serviceLocator";

// export async function findOne(schema, args, options?) {
//   const model = serviceLocator.get(schema);
//   let result = model.findOne(args);
//   if (options.select) result = result.select(`+${options.select}`);
//   return result;
// }
// export async function create(schema, args) {
//   const model = serviceLocator.get(schema);
//   let result = model.create(args);
//   return result;
// }

// export async function findById(schema, id) {
//   const model = serviceLocator.get(schema);
//   let result = model.findById(id);
//   return result;
// }

// export async function findByIdAndUpdate(schema, id, updateParams, options) {
//   const model = serviceLocator.get(schema);
//   let result = model.findByIdAndUpdate(id, updateParams, options);
//   return result;
// }

// export async function find(schema,)

export async function execute(schema,method,params,options?){
    const model=serviceLocator.get(schema);
    let result=model[method](...params);
    if(options?.select) result=result.select(`+${options.select}`);
    return result;
}