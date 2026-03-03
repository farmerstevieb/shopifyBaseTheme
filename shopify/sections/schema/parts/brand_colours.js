module.exports = (identity, label, dflt) => {
  return [
    {
      type: "select",
      id: identity ? identity : "colour",
      label: label ? label : "Colour",
      default: dflt ? dflt : "#F8F8F8",
      options: [
        {
          value: "#161616",
          label: "Black",
        },
        {
          value: "#FFF",
          label: "White",
        },
        {
          value: "#692034",
          label: "Primary Claret",
        },
        {
          value: "#EED5D1",
          label: "Primary Petal",
        },
        {
          value: "#F0EBE6",
          label: "Primary Carrara",
        },
        {
          value: "#FEFFEF",
          label: "Primary Orchid",
        },
        {
          value: "#1C1C1A",
          label: "Primary Sable",
        },
        {
          value: "#4D3C2F",
          label: "Secondary Bramble",
        },
        {
          value: "#A3A861",
          label: "Secondary Moss",
        },
        {
          value: "#C0C781",
          label: "Secondary Sage",
        },
        {
          value: "#E7FC52",
          label: "Secondary KeyLime",
        },
        {
          value: "#111",
          label: "Grey (5)",
        },
        {
          value: "#191919",
          label: "Grey (10)",
        },
        {
          value: "#222",
          label: "Grey (20)",
        },
        {
          value: "#4d4d4d",
          label: "Grey (30)",
        },
        {
          value: "#666",
          label: "Grey (40)",
        },
        {
          value: "#808080",
          label: "Grey (50)",
        },
        {
          value: "#999",
          label: "Grey (60)",
        },
        {
          value: "#b3b3b3",
          label: "Grey (70)",
        },
        {
          value: "#ccc",
          label: "Grey (80)",
        },
        {
          value: "#e6e6e6",
          label: "Grey (90)",
        },
        {
          value: "#f6f6f6",
          label: "Grey (100)",
        },
        {
          value: "#E6417A",
          label: "Brand (1)",
        },
        {
          value: "#e95587",
          label: "Brand (2)",
        },
        {
          value: "#eb6895",
          label: "Brand (3)",
        },
        {
          value: "#f08eaf",
          label: "Brand (4)",
        },
        {
          value: "#f3a1bd",
          label: "Brand (5)",
        },
        {
          value: "#f5b3ca",
          label: "Brand (6)",
        },
        {
          value: "#f8c6d7",
          label: "Brand (7)",
        },
        {
          value: "#fad9e4",
          label: "Brand (8)",
        },
        {
          value: "#fdecf2",
          label: "Brand (9)",
        },
        {
          value: "#F3E1DB",
          label: "Brand (10)",
        },
        {
          value: "#f8ede9",
          label: "Brand (11)",
        },
        {
          value: "#EB80A8",
          label: "Brand (12)",
        },
      ],
    },
  ];
};
