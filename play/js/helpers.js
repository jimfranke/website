export const createStore = initialState => {
  let globalState = { ...initialState };
  return {
    getState: () => globalState,
    setState: state => {
      globalState = {
        ...globalState,
        ...state,
      };
      return globalState;
    },
  };
};
