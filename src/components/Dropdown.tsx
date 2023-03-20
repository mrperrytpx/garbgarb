import { Dispatch, SetStateAction, ChangeEvent } from "react";
import type { TAvailableSizes } from "../pages/products/[articleId]";

interface IDropdownProps {
  options: TAvailableSizes[];
  state: TAvailableSizes;
  setState: Dispatch<SetStateAction<TAvailableSizes>>;
}

export const Dropdown = ({ options, state, setState }: IDropdownProps) => {
  const handleChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const selectedId = e.target.value;
    const selectedState = options.find((x) => x.id === +selectedId)!;
    setState(selectedState);
  };

  return (
    <select
      value={state.id}
      onChange={handleChange}
      className="w-[200px] select-none border p-2 text-lg"
    >
      {options.map((option) => (
        <option
          disabled={!option.inStock}
          className="inline-block w-full cursor-pointer text-lg hover:bg-slate-300"
          key={option.id}
          value={option.id}
        >
          {option.inStock ? option.size : option.size + "- Out of Stock"}
        </option>
      ))}
    </select>
  );
};
