module.exports = (mobile_sources = false) => {
  return [
    {
      type: "header",
      content: "Video",
    },
    {
      type: "video",
      id: "video_file",
      label: "Hosted video",
      info: "A Shopify-hosted video",
    },
    {
      type: "video_url",
      id: "video_url",
      accept: ["youtube", "vimeo"],
      label: "Youtube/Vimeo hosted video",
    },
    mobile_sources && {
      type: "video",
      id: "video_file_mob",
      label: "Mobile hosted video",
      info: "A Shopify-hosted video for mobile devices",
    },
    mobile_sources && {
      type: "video_url",
      id: "video_url_mob",
      accept: ["youtube", "vimeo"],
      label: "Mobile Youtube/Vimeo hosted video",
    },
    {
      type: "checkbox",
      id: "video_autoplay",
      label: "Autoplay",
      default: true,
    },
    {
      type: "checkbox",
      id: "video_muted",
      label: "Muted",
      default: true,
    },
    mobile_sources && {
      type: "checkbox",
      id: "play_mobile",
      label: "Play video on mobile",
      default: true,
    },
  ].filter(Boolean);
};
