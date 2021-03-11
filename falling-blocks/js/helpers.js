export const deepClone = obj => JSON.parse(JSON.stringify(obj));

export const arrayShuffle = array => [...array].sort(() => Math.random() - 0.5);

export const timeNow = () => performance.now();
