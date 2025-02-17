import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  content: "",
  template: "basic",
};

export const resumeSlice = createSlice({
  name: "resume",
  initialState,
  reducers: {
    updateContent: (state, action) => {
      state.content = action.payload;
    },
    updateTemplate: (state, action) => {
      state.template = action.payload;
    },
  },
});

export const { updateContent, updateTemplate } = resumeSlice.actions;
export default resumeSlice.reducer;