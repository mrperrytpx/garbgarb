import { Dispatch, SetStateAction, ChangeEvent } from "react";

interface ISizeDropdownProps<T> {
    options: T[];
    state: T;
    setState: Dispatch<SetStateAction<T>>;
    getValue: (option: T) => string | number;
    getLabel: (option: T) => string;
}

export const SizeDropdown = <T extends { id: number; inStock: boolean }>({
    options,
    state,
    setState,
    getValue,
    getLabel,
}: ISizeDropdownProps<T>) => {
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
            className="w-full cursor-pointer select-none rounded-lg border border-slate-500 bg-black p-2 text-lg text-gray-200 shadow-sm shadow-slate-500 hover:border-white"
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
