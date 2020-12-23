export const createState = initialState => {
  const globalState = {
    ...initialState,
    update: state => {
      Object.assign(globalState, state);
    },
  };
  return globalState;
};
