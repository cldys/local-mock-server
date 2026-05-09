module.exports = {
  raw: true,
  required: {
    body: ["prompt", "count"],
  },
  default: {
    model: "doubao-seedream-5-0-260128",
    created: 1778133093,
    data: [
      {
        size: "1440x2560",
        iobs_url: "",
        bucket: "paas-lcp-sf-stg-pri",
        key: "f355ee4e8d0d402d8c23ed0cc829567c",
      },
      {
        size: "1440x2560",
        iobs_url: "",
        bucket: "paas-lcp-sf-stg-pri",
        key: "7cccb7aa07ad47c1b207823e140bb2d7",
      },
    ],
    usage: {
      generated_images: 2,
      output_tokens: 28800,
      total_tokens: 28800,
    },
  },
};
