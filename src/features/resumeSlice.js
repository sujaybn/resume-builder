import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  inputContent: "", // Stores user input
  generatedContent: "", // Stores AI-generated resume content
  template: "basic", // Default template selection
};

export const resumeSlice = createSlice({
  name: "resume",
  initialState,
  reducers: {
    updateInputContent: (state, action) => {
      state.inputContent = action.payload;
    },
    updateGeneratedContent: (state, action) => {
      state.generatedContent = action.payload;
    },
    updateTemplate: (state, action) => {
      state.template = action.payload;
    },
    resetResume: (state) => {
      state.inputContent = "";
      state.generatedContent = "";
      state.template = "basic";
    },
  },
});

export const { updateInputContent, updateGeneratedContent, updateTemplate, resetResume } =
  resumeSlice.actions;

export default resumeSlice.reducer;
