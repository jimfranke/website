export const createStore = initialState => {
  let globalState = { ...initialState };
  return {
    getState: () => globalState,
    setState: state => {
      return (globalState = {
        ...globalState,
        ...state,
      });
    },
  };
};
