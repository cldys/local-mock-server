const { getMockAssetUrl } = require("../../utils/assets");

const imageKeys = [
  ["1", "71739708085f491289b28a03a5eee1e2", "generation-1.svg"],
  ["10", "12945016bd77466b93269335f06dad1c", "generation-2.svg"],
  ["2", "6adc40a6daff490b9ceb4ec940fea444", "generation-1.svg"],
  ["3", "7f535b064d5f4bee9fd5f8c13fd71cbf", "generation-2.svg"],
];

function createImageResponse(req, taskId) {
  return {
    requestId: "ac56214a-63d3-4e8a-b022-9bbb6779751d",
    code: "00",
    data: {
      taskId,
      type: "IMAGE_GENERATION",
      status: "COMPLETED",
      createdAt: 1781508524000,
      updatedAt: 1781508582000,
      details: imageKeys.map(([imageIndex, key, assetName]) => ({
        taskDetailId: taskId,
        status: "COMPLETED",
        extData: {
          imageIndex: Number(imageIndex),
          iobsUrl: getMockAssetUrl(req, `images/${assetName}`),
          bucket: "paas-lcp-sf-stg-pri",
          key,
          size: "1440x2560",
        },
      })),
    },
    success: true,
  };
}

function createVideoResponse(req, taskId) {
  return {
    requestId: "c742a646-69e3-42fa-b1e7-8871386487b7",
    code: "00",
    data: {
      taskId,
      type: "VIDEO_GENERATION",
      status: "COMPLETED",
      createdAt: 1781512102000,
      updatedAt: 1781512141000,
      details: [
        {
          taskDetailId: taskId,
          status: "COMPLETED",
          extData: {
            videoIndex: 1,
            taskNo: "cgt-20260615162901-8z4nn",
            video_url: getMockAssetUrl(req, "videos/generation-demo.mp4"),
            iobs_bucket: "paas-lcp-sf-stg-pri",
            iobs_key: "831329185aac482a9382846976c69c24",
          },
        },
      ],
    },
    success: true,
  };
}

module.exports = {
  raw: true,
  required: {
    query: ["taskId"],
  },

  resolve(req) {
    const taskId = req.query.taskId;

    if (String(taskId).startsWith("img-")) {
      return createImageResponse(req, taskId);
    }

    return createVideoResponse(req, taskId);
  },
};
