import axiosClient from "./axiosClient";
// get tat ca Discount
export const getAllDiscount = (params) => {
  const url = "/giamgias";
  return axiosClient.get(url, { params });
};

export const getDiscountBySlug = (slug) => {
  const url = `/giamgias/${slug}`;
  return axiosClient.get(url);
};

export const getDiscountById = (id) => {
  const url = `/giamgias/${id}`;
  return axiosClient.get(url);
};

export const saveDiscount = (params) => {
  const id = params.id;
  let url = "/giamgias";
  if (id == 0) {
    return axiosClient.post(url, params);
  } else {
    url = url + `/${id}`;
    return axiosClient.put(url, params);
  }
};
export const removeDiscount = (parameter) => {
  const url = `/giamgias/${parameter}`;
  return axiosClient.delete(url);
};
