const { getMockAssetUrl } = require("../../utils/assets");

module.exports = {
  raw: true,
  required: {
    query: ["task_id"],
  },
  default: {
    id: "cgt-20260507134852-nsb5z",
    model: "doubao-seedance-1-0-pro-250528",
    status: "succeeded",
    content: {
      video_url: "",
    },
    usage: {
      completion_tokens: 246840,
      total_tokens: 246840,
    },
    created_at: 1778132932,
    updated_at: 1778132993,
    seed: 19440,
    resolution: "1080p",
    ratio: "16:9",
    duration: 5,
    framespersecond: 24,
    service_tier: "default",
    execution_expires_after: 172800,
    draft: false,
  },

  resolve(req, { defaultResponse }) {
    return {
      ...defaultResponse,
      id: req.query.task_id || defaultResponse.id,
      content: {
        ...defaultResponse.content,
        video_url: getMockAssetUrl(req, "videos/generation-demo.mp4"),
      },
    };
  },
};
