import api from "./api";

export const createProperty = async (property) => {
  const response = await api.post(
    "/seller/property",
    property
  );

  return response.data;
};