import React from "react";
import StyledForm from "./styles";

const AddDownloadForm = () => {
  return (
    <StyledForm>
      <form>
        <input type="text" placeholder="Full name" />
        <input type="text" placeholder="Email" />
        <input type="text" placeholder="Password" />
        <button> Sign in</button>
      </form>
    </StyledForm>
  );
};

export { AddDownloadForm };
