export const deepClone = obj => JSON.parse(JSON.stringify(obj));

export const arrayRandom = arr => [...arr].sort(() => Math.random() - 0.5);
