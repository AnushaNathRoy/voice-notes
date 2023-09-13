const initialState = {
  list: [],
};

export default (state = initialState, action) => {
  let newList = [...state.list];

  switch (action.type) {
    case "ADD_NOTE":
      newList.push({
        key: newList.length,
        title: action.payload.title,
        blocks: action.payload.blocks,
      });

      break;

    case "EDIT_NOTE":
      if (newList[action.payload.key]) {
        newList[action.payload.key] = {
          key: action.payload.key,
          title: action.payload.title,
          blocks: action.payload.blocks,
        };
      }
      break;

    case "DELETE_NOTE":
      console.log("DELETE NOTE")
      console.log(action.payload.key);
      if (newList[action.payload.key]) {
        newList = newList.filter((item, index) => index != action.payload.key);
      }
      break;

    case "SUCCESS_NOTE":
      if (newList[action.payload.key]) {
        newList[action.payload.key] = {
          title: action.payload.title,
          blocks: action.payload.blocks,
        };
      }
      break;

    // case "UNCHECK_NOTE":
    //   if (newList[action.payload.key]) {
    //     newList[action.payload.key] = {
    //       title: action.payload.title,
    //       body: action.payload.body,
    //       done: false,
    //     };
    //   }
    //   break;
  }

  return { ...state, list: newList };
};
