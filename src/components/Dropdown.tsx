import { KeyboardEvent, useState } from "react";

const SIZES = ["S", "M", "L", "XL", "XXL"];

const Dropdown = ({ expanded = false }) => {
  const [isExpanded, setIsExpanded] = useState(expanded);

  const handleKeyboardToggle = (e: KeyboardEvent<HTMLSpanElement>) => {
    if (e.code === "Space" || e.code === "Enter") {
      setIsExpanded(!isExpanded);
      return;
    }
    return;
  };

  return (
    <div>
      <span
        onKeyDown={(e) => handleKeyboardToggle(e)}
        tabIndex={0}
        onClick={() => setIsExpanded((prev) => !prev)}
      >
        xd
      </span>
      {isExpanded && SIZES.map((x, i) => <div key={i}>{x}</div>)}
    </div>
  );
};

export default Dropdown;
