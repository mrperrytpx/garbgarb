import { axiosClient } from "../../utils/axiosClient";
import { GetServerSideProps } from "next";
import { InferGetServerSidePropsType } from "next";
import type { TProductDetails } from "../api/product";
import Image from "next/image";
import { Dropdown } from "../../components/Dropdown";
import { useState, useMemo } from "react";
import parse from "html-react-parser";
import {
  useReactTable,
  createColumnHelper,
  getCoreRowModel,
  flexRender,
} from "@tanstack/react-table";
import { TSizes } from "../api/productSizes";

const dropdownOptions = [
  {
    state: "one",
  },
  {
    state: "two",
  },
  {
    state: "three",
  },
];

const ArticlePage = ({ data, sizes }: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const [dropdownValue, setDropdownValue] = useState(dropdownOptions[0].state);
  const [quantity, setQuantity] = useState("1");
  const [isToggledSizes, setIsToggledSizes] = useState(false);

  const splitName = data?.result.sync_product.name.split(" ");
  const whichIndex = splitName.indexOf("Unisex");
  const shirtName = splitName.slice(0, whichIndex).join(" ");
  const defualtShirtName = splitName.slice(whichIndex).join(" ");

  const handleQuantity = () => {
    if (!quantity) setQuantity("1");
    if (+quantity < 1 || +quantity > 999) setQuantity("1");
  };

  return (
    <div className="mb-28 flex flex-col items-center justify-center gap-12 p-6 lg:flex-row">
      <div className="max-w-[500px] border-2">
        <Image
          priority={true}
          width={600}
          height={600}
          alt="Piece of clothing with some words written on it"
          src={data?.result.sync_product.thumbnail_url}
        />
      </div>
      <article className="flex flex-col items-center justify-center gap-4">
        <div className="flex flex-col items-center justify-center">
          <h1 className="text-center text-2xl font-bold">{shirtName}</h1>
          <p className="text-center text-xl">{defualtShirtName}</p>
        </div>
        <div className="flex flex-col items-center justify-center">
          <p className="text-xl">{data?.result.sync_variants[0].retail_price}€*</p>
          <p className="text-xs">*Taxes not included</p>
        </div>
        <p className="text-center text-sm">{data?.result.sync_variants[0].product.name}</p>
        <div className="flex flex-col items-center justify-center">
          <p className="text-md">Size:</p>
          <Dropdown state={dropdownValue} setState={setDropdownValue} options={dropdownOptions} />
        </div>
        <div className="flex flex-col items-center justify-center">
          <p>Quantity:</p>
          <input
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            className="block w-32 border p-4 text-center"
            onBlur={handleQuantity}
            min="1"
            max="999"
            type="number"
          />
        </div>
        <button className="min-w-[8rem] border p-4 hover:bg-slate-600 hover:text-white">
          Add to cart!
        </button>
        <p
          onClick={() => setIsToggledSizes(!isToggledSizes)}
          className="cursor-pointer p-2 text-center text-sm font-bold"
        >
          Click to {isToggledSizes ? "close" : "open"} the sizes guide
        </p>
      </article>
      {isToggledSizes && (
        <div className="flex flex-col items-center justify-center gap-4">
          {/* <div className="flex flex-col items-center justify-center gap-2">
            {parse(measureYourself)}
          </div>
          <div className="flex flex-col items-start justify-center gap-2">
            {parse(measureYourselfGuide)}
          </div> */}
          <SizesTable sizes={sizes} />
        </div>
      )}
    </div>
  );
};

export default ArticlePage;

export const getServerSideProps: GetServerSideProps<{
  data: TProductDetails;
  sizes: TSizes;
}> = async (context) => {
  const { articleId } = context.query;
  const articleRes = await axiosClient.get<TProductDetails>("/api/product", {
    params: { id: articleId },
  });
  const articleData = articleRes.data;

  const sizesRes = await axiosClient.get<TSizes>("/api/productSizes", {
    params: { id: articleData.result.sync_variants[0].product.product_id },
  });
  const sizesData = sizesRes.data;

  return {
    props: {
      data: articleData,
      sizes: sizesData,
    },
  };
};

interface ISizesTable {
  sizes: TSizes;
}

function SizesTable({ sizes }: ISizesTable) {
  const tableData = useSizesDataConverter(sizes);
  const columnHelper = createColumnHelper<TConvertedTableData>();

  const [data, _setData] = useState(() => [...tableData]);

  const columns = useMemo(
    () => [
      columnHelper.accessor((row) => row.size, {
        id: "size",
        cell: (info) => <i>{info.getValue()}</i>,
        header: () => <span>Sizes</span>,
      }),
      columnHelper.accessor("length", {
        cell: (info) => <i>{info.getValue()}</i>,
        header: () => <span>Length</span>,
      }),
      columnHelper.accessor((row) => `${row.chestMin}-${row.chestMax}`, {
        id: "chest",
        header: "Chest",
        cell: (info) => <i>{info.getValue()}</i>,
      }),
      columnHelper.accessor("sleeve length", {
        cell: (info) => <i>{info.getValue()}</i>,
        header: () => <span>Sleeve</span>,
      }),
    ],
    [sizes]
  );

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div>
      <table>
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th key={header.id}>
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
                <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
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
  chestMin: string;
  chestMax: string;
  "sleeve length": string;
};

function useSizesDataConverter(sizes: TSizes): TConvertedTableData[] {
  let arrOfObjs = new Array(sizes.result.available_sizes.length).fill({});

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
        );

        x = {
          ...x,
          chestMin: chestArr?.values[i].min_value,
          chestMax: chestArr?.values[i].max_value,
        };
        return;
      }
    });

    return (x = {
      size: sizes.result.available_sizes[i],
      ...x,
    });
  });

  return arrOfObjs;
}
