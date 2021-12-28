import sortJson from "sort-json";

export const getJsonString = (object: any) => {
  return JSON.stringify(sortJson(object));
};
