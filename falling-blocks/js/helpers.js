export const createStore = state => {
  let globalState = { ...state };
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
