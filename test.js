const obj = {
    code: 200,
    result: {
        product_id: 456,
        available_sizes: ["S", "M", "L", "XL", "2XL"],
        size_tables: [
            {
                type: "measure_yourself",
                unit: "inches",
                description:
                    '<p>Measurements are provided by suppliers.<br /><br />US customers should order a size up as the EU sizes for this supplier correspond to a smaller size in the US market.</p>\n<p>Product measurements may vary by up to 2" (5 cm).&nbsp;</p>',
                image_url:
                    "https://files.cdn.printful.com/upload/measure-yourself/ac/ac08e029e76c284bb44d7feb3a7d6254_t?v=1652962719",
                image_description:
                    '<h6><strong>A Length</strong></h6>\n<p dir="ltr"><span id="docs-internal-guid-a3ac3082-7fff-5f98-2623-3eb38d5f43a1">Place the end of the tape beside the collar at the top of the tee (Highest Point Shoulder). Pull the tape measure t</span><span id="docs-internal-guid-a3ac3082-7fff-5f98-2623-3eb38d5f43a1">o the bottom of the shirt.</span></p>\n<h6>B Chest</h6>\n<p dir="ltr">Measure yourself around the fullest part of your chest. Keep the tape measure horizontal.&nbsp;</p>\n<h6>C Sleeve length</h6>\n<p>Place one end of the tape at the top of the set-in sleeve, then pull the tape down until you reach the hem of the sleeve.</p>',
                measurements: [
                    {
                        type_label: "Length",
                        values: [
                            {
                                size: "S",
                                value: "27.2",
                            },
                            {
                                size: "M",
                                value: "28.3",
                            },
                            {
                                size: "L",
                                value: "29.1",
                            },
                            {
                                size: "XL",
                                value: "29.9",
                            },
                            {
                                size: "2XL",
                                value: "30.7",
                            },
                        ],
                    },
                    {
                        type_label: "Chest",
                        values: [
                            {
                                size: "S",
                                min_value: "31",
                                max_value: "34",
                            },
                            {
                                size: "M",
                                min_value: "35",
                                max_value: "38",
                            },
                            {
                                size: "L",
                                min_value: "39",
                                max_value: "41",
                            },
                            {
                                size: "XL",
                                min_value: "42",
                                max_value: "45",
                            },
                            {
                                size: "2XL",
                                min_value: "46",
                                max_value: "48",
                            },
                        ],
                    },
                    {
                        type_label: "Sleeve length",
                        values: [
                            {
                                size: "S",
                                value: "8.1",
                            },
                            {
                                size: "M",
                                value: "8.5",
                            },
                            {
                                size: "L",
                                value: "8.9",
                            },
                            {
                                size: "XL",
                                value: "8.9",
                            },
                            {
                                size: "2XL",
                                value: "9.3",
                            },
                        ],
                    },
                ],
            },
            {
                type: "product_measure",
                unit: "inches",
                description:
                    '<p dir="ltr">Measurements are provided by our suppliers. Product measurements may vary by up to 2" (5 cm).</p>\n<p dir="ltr">US customers should order a size up as the EU sizes for this supplier correspond to a smaller size in the US market.</p>\n<p dir="ltr">Pro tip! Measure one of your products at home and compare with the measurements you see in this guide.</p>',
                image_url:
                    "https://files.cdn.printful.com/upload/product-measure/71/71f528d988aa07e6525018a92275bc5e_t?v=1652962719",
                image_description:
                    '<h6><strong>A Length</strong></h6>\n<p dir="ltr"><span id="docs-internal-guid-a3ac3082-7fff-5f98-2623-3eb38d5f43a1">Place the end of the tape beside the collar at the top of the tee (Highest Point Shoulder). Pull the tape measure t</span><span id="docs-internal-guid-a3ac3082-7fff-5f98-2623-3eb38d5f43a1">o the bottom of the shirt.</span></p>\n<h6>B Width</h6>\n<p dir="ltr">Place the end of the tape at the seam under the sleeve and pull the tape measure across the shirt to the seam under the opposite sleeve.</p>\n<h6>C Sleeve length</h6>\n<p>Place one end of the tape at the top of the set-in sleeve, then pull the tape down until you reach the hem of the sleeve.</p>',
                measurements: [
                    {
                        type_label: "Length",
                        values: [
                            {
                                size: "S",
                                value: "27.2",
                            },
                            {
                                size: "M",
                                value: "28.3",
                            },
                            {
                                size: "L",
                                value: "29.1",
                            },
                            {
                                size: "XL",
                                value: "29.9",
                            },
                            {
                                size: "2XL",
                                value: "30.7",
                            },
                        ],
                    },
                    {
                        type_label: "Width",
                        values: [
                            {
                                size: "S",
                                value: "19.3",
                            },
                            {
                                size: "M",
                                value: "20.5",
                            },
                            {
                                size: "L",
                                value: "21.7",
                            },
                            {
                                size: "XL",
                                value: "22.8",
                            },
                            {
                                size: "2XL",
                                value: "24",
                            },
                        ],
                    },
                    {
                        type_label: "Sleeve length",
                        values: [
                            {
                                size: "S",
                                value: "8.1",
                            },
                            {
                                size: "M",
                                value: "8.5",
                            },
                            {
                                size: "L",
                                value: "8.9",
                            },
                            {
                                size: "XL",
                                value: "8.9",
                            },
                            {
                                size: "2XL",
                                value: "9.3",
                            },
                        ],
                    },
                ],
            },
        ],
    },
    extra: [],
};

let arrOfObjs = new Array(obj.result.available_sizes.length).fill({});

arrOfObjs = arrOfObjs.map(
    (x, i) =>
        (x = {
            size: obj.result.available_sizes[i],
        })
);

console.log(arrOfObjs);
