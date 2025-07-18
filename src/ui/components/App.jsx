import "@spectrum-web-components/theme/express/scale-medium.js";
import "@spectrum-web-components/theme/express/theme-light.js";

import React from "react";
import { Theme } from "@swc-react/theme";
import FeedbackLoopAddOn from "./FeedbackLoopAddOn"; // ⬅️ your UI component
import "./App.css";

const App = ({ addOnUISdk, sandboxProxy }) => {
  return (
    <Theme system="express" scale="medium" color="light">
      <FeedbackLoopAddOn addOnUISdk={addOnUISdk} sandboxProxy={sandboxProxy} />
    </Theme>
  );
};

export default App;
