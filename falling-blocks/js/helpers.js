export const createState = initialState => {
  let globalState;
  return (globalState = {
    ...initialState,
    update: state => {
      return (globalState = {
        ...globalState,
        ...state,
      });
    },
  });
};
