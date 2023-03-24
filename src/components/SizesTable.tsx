import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import type { TSizes } from "../pages/api/product/sizes";
import { useState, useMemo } from "react";

interface ISizesTable {
  sizes: TSizes;
  isCentimeters: boolean;
}

export const SizesTable = ({ sizes, isCentimeters }: ISizesTable) => {
  const tableData = useSizesDataConverter(sizes);
  const columnHelper = createColumnHelper<TConvertedTableData>();

  const [data, _setData] = useState(() => [...tableData]);
  const [columnVisibility, setColumnVisibility] = useState({});

  const columns = useMemo(
    () => [
      columnHelper.accessor((row) => row.size, {
        id: "size",
        cell: (info) => <i>{info.getValue()}</i>,
        header: () => <span>Sizes</span>,
      }),
      columnHelper.accessor("length", {
        cell: (info) => (
          <i>{isCentimeters ? Math.round(+info.getValue() * 2.54 * 10) / 10 : info.getValue()}</i>
        ),
        header: () => <span>Length</span>,
      }),
      columnHelper.accessor("chest", {
        id: "chest",
        header: "Chest",
        cell: (info) => (
          <i>
            {isCentimeters
              ? `${Math.round(+info.getValue()[0]! * 2.54 * 10) / 10} - ${
                  Math.round(+info.getValue()[1]! * 2.54 * 10) / 10
                }`
              : `${info.getValue()[0]} - ${info.getValue()[1]}`}
          </i>
        ),
      }),
      columnHelper.accessor((row) => row["sleeve length"], {
        id: "sleeve",
        cell: (info) => (
          <i>{isCentimeters ? Math.round(+info.getValue()! * 2.54 * 10) / 10 : info.getValue()}</i>
        ),
        header: () => <span>Sleeve</span>,
        enableHiding: true,
      }),
    ],
    [sizes, isCentimeters]
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
    <div className="self-start">
      <table>
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr className="border" key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th className="border p-2 text-center" key={header.id}>
                  {header.isPlaceholder
                    ? null
                    : flexRender(header.column.columnDef.header, header.getContext())}
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
  chest: [string | undefined, string | undefined];
  "sleeve length"?: string | undefined;
};

export function useSizesDataConverter(sizes: TSizes): TConvertedTableData[] {
  // get all type_labels that are listed under 'size_tables' measurements[0]
  // example ["chest", "sleeve"]
  const objKeys: string[] = new Array(sizes.result.size_tables[0].measurements.length)
    .fill("")
    .map((_, i) => sizes.result.size_tables[0].measurements[i].type_label.toLowerCase());

  // make an empty array and fill it with an empty object for each size available for the product
  const arrOfObjs: TConvertedTableData[] = new Array(sizes.result.available_sizes.length)
    .fill({})
    .map((x, i) => {
      //map each size to have all of the 'objKeys' available, first pass gets one key, second pass another etc.
      objKeys.forEach((key) => {
        if (key.toLowerCase() !== "chest") {
          // x is old x plus an additional key value pair
          x = {
            ...x,
            [`${key}`]: sizes.result.size_tables[0].measurements.filter(
              (arr) => arr.type_label.toLowerCase() === key
            )[0]?.values[i].value,
          };

          return;
        } else {
          //chest has a min and max value while others have just 1 so it's separate
          const chestArr = sizes.result.size_tables[0].measurements.filter(
            (arr) => arr.type_label.toLowerCase() === key
          )[0];

          x = {
            ...x,
            chest: [chestArr.values[i]?.min_value, chestArr.values[i]?.max_value],
          };

          return;
        }
      });

      // after all the type_labels got their value, add for which size it was.
      // There's measuremenet values for each product size so indexes are the same between them
      return {
        ...x,
        size: sizes.result.available_sizes[i],
      };
    });

  return arrOfObjs;
}

export default SizesTable;
