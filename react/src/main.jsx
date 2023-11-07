import { createRoot } from "react-dom/client";

let element = (
  <div className="A1">
    <div className="B1">
        <div className="C1">C1</div>
        <div className="C2">C2</div>
    </div>
    <div className="B2">B2</div>
  </div>
);
const root = createRoot(document.getElementById("root"));
console.log(element);
console.log(root);

root.render(element);

