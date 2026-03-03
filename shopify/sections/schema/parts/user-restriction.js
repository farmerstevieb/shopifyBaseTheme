module.exports = ({ } = {}) => {
  return [
    {
      type: "select",
      id: "user_restriction",
      label: "Display only to customer/visitor",
      options: [
        { value: "", label: "Display all" },
        { value: "customer", label: "Show customer" },
        { value: "visitor", label: "Show visitor" },
      ],
      default: "",
    }
  ].filter(Boolean);
};
