import { Dispatch, SetStateAction, ChangeEvent } from "react";

interface IDropdownProps<T> {
  options: T[];
  state: T;
  setState: Dispatch<SetStateAction<T>>;
  getValue: (option: T) => string | number;
  getLabel: (option: T) => string;
}

export const Dropdown = <T extends { id: number; inStock: boolean }>({
  options,
  state,
  setState,
  getValue,
  getLabel,
}: IDropdownProps<T>) => {
  const handleChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const selectedId = e.target.value;
    const selectedState = options.filter((x) => x.id === +selectedId)[0];

    if (!selectedState) return;

    setState(selectedState);
  };

  return (
    <select
      value={getValue(state)}
      onChange={handleChange}
      className="w-[200px] select-none border p-2 text-lg"
    >
      {options.map((option) => (
        <option
          disabled={!option.inStock}
          className="inline-block w-full cursor-pointer text-lg hover:bg-slate-300"
          key={option.id}
          value={getValue(option)}
        >
          {option.inStock ? getLabel(option) : getLabel(option) + " - Out of Stock"}
        </option>
      ))}
    </select>
  );
};
