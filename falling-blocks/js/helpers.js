export const deepClone = obj => JSON.parse(JSON.stringify(obj));

export const arrayRandom = (...arrays) =>
  arrays.flat().sort(() => Math.random() - 0.5);
