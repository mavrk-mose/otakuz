export default {
  name: "merchant",
  title: "Merchants",
  type: "document",
  fields: [
    {
      name: "businessName",
      title: "Business Name",
      type: "string",
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: "whatsappNumber",
      title: "WhatsApp Number",
      type: "string",
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: "description",
      title: "Description",
      type: "text",
    },
    {
      name: "logo",
      title: "Business Logo",
      type: "image",
      options: {
        hotspot: true,
      },
    },
    {
      name: "paymentDetails",
      title: "Payment Details",
      type: "text",
    },
    {
      name: "createdAt",
      title: "Created At",
      type: "datetime",
      readOnly: true,
    },
    {
      name: "updatedAt",
      title: "Updated At",
      type: "datetime",
      readOnly: true,
    },
  ],
};
