import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import type { TSizes } from "../pages/api/productSizes";
import { useState, useMemo } from "react";

interface ISizesTable {
  sizes: TSizes;
  isCentimeters: boolean;
}

function SizesTable({ sizes, isCentimeters }: ISizesTable) {
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
    <div className="w-full">
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
}

type TConvertedTableData = {
  size: string;
  length: string;
  chest: [string | undefined, string | undefined];
  "sleeve length"?: string | undefined;
};

export function useSizesDataConverter(sizes: TSizes): TConvertedTableData[] {
  let arrOfObjs: TConvertedTableData[] = new Array(sizes.result.available_sizes.length).fill({});

  const objKeys: string[] = [];

  sizes.result.size_tables[0].measurements.forEach((x) => {
    objKeys.push(x.type_label.toLowerCase());
  });

  arrOfObjs = arrOfObjs.map((x, i) => {
    objKeys.forEach((key) => {
      if (key.toLowerCase() !== "chest") {
        x = {
          ...x,
          [`${key}`]: sizes.result.size_tables[0].measurements.find(
            (arr) => arr.type_label.toLowerCase() === key
          )?.values[i].value,
        };
        return;
      } else {
        const chestArr = sizes.result.size_tables[0].measurements.find(
          (arr) => arr.type_label.toLowerCase() === key
        )!;

        x = {
          ...x,
          chest: [chestArr.values[i]?.min_value, chestArr.values[i]?.max_value],
        };
        return;
      }
    });

    return (x = {
      ...x,
      size: sizes.result.available_sizes[i],
    });
  });

  return arrOfObjs;
}

export default SizesTable;
