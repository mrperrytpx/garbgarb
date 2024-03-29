import {
    createColumnHelper,
    flexRender,
    getCoreRowModel,
    useReactTable,
} from "@tanstack/react-table";
import type { TProductSizes } from "../pages/api/product/sizes";
import { useState, useMemo } from "react";

interface ISizesTable {
    sizes: TProductSizes;
    isCentimeters: boolean;
}

export const SizesTable = ({ sizes, isCentimeters }: ISizesTable) => {
    const tableData = useSizesDataConverter(sizes);
    const columnHelper = createColumnHelper<TConvertedTableData>();

    const [data] = useState(() => [...tableData]);
    const [columnVisibility, setColumnVisibility] = useState({});

    const columns = useMemo(
        () => [
            columnHelper.accessor((row) => row.size, {
                id: "size",
                cell: (info) => <p>{info.getValue()}</p>,
                header: () => <span>Sizes</span>,
            }),
            columnHelper.accessor("length", {
                cell: (info) => (
                    <p>
                        {isCentimeters
                            ? Math.round(+info.getValue() * 2.54 * 10) / 10
                            : info.getValue()}
                    </p>
                ),
                header: () => <span>Length</span>,
            }),
            columnHelper.accessor("chest", {
                id: "chest",
                header: "Chest",
                cell: (info) => (
                    <p>
                        {isCentimeters
                            ? `${Math.round(+info.getValue()[0]! * 2.54 * 10) / 10} - ${
                                  Math.round(+info.getValue()[1]! * 2.54 * 10) / 10
                              }`
                            : `${info.getValue()[0]} - ${info.getValue()[1]}`}
                    </p>
                ),
            }),
            columnHelper.accessor((row) => row["sleeve length"], {
                id: "sleeve",
                cell: (info) => (
                    <p>
                        {isCentimeters
                            ? Math.round(+info.getValue()! * 2.54 * 10) / 10
                            : info.getValue()}
                    </p>
                ),
                header: () => <span>Sleeve</span>,
                enableHiding: true,
            }),
        ],
        [isCentimeters, columnHelper]
    );

    const table = useReactTable({
        data,
        columns,
        state: {
            columnVisibility: {
                sleeve: tableData[0].hasOwnProperty("sleeve length"),
            },
        },
        initialState: {
            columnVisibility,
        },
        onColumnVisibilityChange: setColumnVisibility,
        getCoreRowModel: getCoreRowModel(),
    });

    return (
        <div className="self-start bg-black text-gray-200">
            <table className="">
                <thead>
                    {table.getHeaderGroups().map((headerGroup) => (
                        <tr className="border" key={headerGroup.id}>
                            {headerGroup.headers.map((header) => (
                                <th className="border p-2 text-center" key={header.id}>
                                    {header.isPlaceholder
                                        ? null
                                        : flexRender(
                                              header.column.columnDef.header,
                                              header.getContext()
                                          )}
                                </th>
                            ))}
                        </tr>
                    ))}
                </thead>
                <tbody>
                    {table.getRowModel().rows.map((row) => (
                        <tr key={row.id}>
                            {row.getVisibleCells().map((cell) => (
                                <td className="border p-2 text-center text-sm" key={cell.id}>
                                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

type TConvertedTableData = {
    size: string;
    length: string;
    chest: Array<string>;
    "sleeve length"?: string;
};

type DynamicObject = Record<string, string | Array<string | undefined>>;

export function useSizesDataConverter(sizes: TProductSizes): TConvertedTableData[] {
    // get all available sizes for a product
    const tableRows: TConvertedTableData[] = [...sizes.available_sizes].map((size, i) => {
        let obj: DynamicObject = {};
        //for each `type_label` key, assign it a value for that size
        sizes.size_tables[0].measurements.forEach((measure) => {
            const key = measure.type_label.toLowerCase();

            obj[key] = measure.values[i].value || [
                measure.values[i].min_value,
                measure.values[i].max_value,
            ];
        });

        return {
            size: size,
            ...obj,
        } as TConvertedTableData;
    });

    return tableRows;
}

export default SizesTable;
