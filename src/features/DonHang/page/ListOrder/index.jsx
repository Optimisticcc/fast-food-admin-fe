import "braft-editor/dist/index.css";
import { groupBy } from "lodash";
import {
  PlusOutlined,
  QuestionCircleOutlined,
  MinusCircleOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import {
  Button,
  Col,
  Collapse,
  Drawer,
  Form,
  Input,
  InputNumber,
  Popconfirm,
  Row,
  Select,
  Space,
  Table,
  Tag,
  message,
  Divider,
} from "antd";
import { formatCurrency, formatPhone } from "app/format";
import { deleteOrd, getAllOrd, saveOrd } from "features/DonHang/orderSlice";
import { getAllCus } from "features/KhachHang/customerSlice";
import { getAllDis } from "features/Discount/discountSlice";
import { getAll } from "features/Product/productSlice";
import { getAllUs } from "features/User/userSlice";
import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import moment from "moment";
import axios from "axios";
import { useTranslation } from "react-i18next";
import { removeOrder, saveOrder } from "api/orderApi";

ListOrder.propTypes = {};
function ListOrder(props) {
  const { Option } = Select;
  const { TextArea } = Input;
  const { t } = useTranslation();
  const data = useSelector((state) => state.orders.orders);
  const total = useSelector((state) => state.orders.totalCount);
  const loading = useSelector((state) => state.orders.loading);
  const customers = useSelector((state) => state.customers.customers);
  const users = useSelector((state) => state.users.users);
  const discounts = useSelector((state) => state.discounts.discounts);

  const products = useSelector((state) => state.products.products);
  const success = useSelector((state) => state.orders.success);
  const dispatch = useDispatch();
  const [visible, setVisible] = useState(false);
  const [isAdd, setIsAdd] = useState(false);
  const { Panel } = Collapse;
  const [submit, setSubmit] = useState(false);
  const [valueForm, setValueForm] = useState({
    id: 0,
    customerId: 0,
    address: "",
    email: "",
    phoneNumber: "",
    items: [
      {
        product: null,
        quantity: 0,
      },
    ],
    userId: null,
    orderStatus: 0,
    paymentStatus: 0,
    paymentType: "cod",
    discountId: 1,
  });
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 6,
  });
  const form = useRef();
  const column = [
    {
      title: "ID ",
      dataIndex: "id",
      key: "id",
      width: 80,
      sorter: (a, b) => a.id - b.id,
      filterDropdown: ({
        setSelectedKeys,
        selectedKeys,
        confirm,
        clearFilters,
      }) => (
        <div style={{ padding: 8 }}>
          <Input
            placeholder={`Search`}
            value={selectedKeys[0]}
            onChange={(e) =>
              setSelectedKeys(e.target.value ? [e.target.value] : [])
            }
            onPressEnter={() => {
              confirm();
            }}
            style={{ marginBottom: 8, display: "block" }}
          />
          <Space>
            <Button
              type="primary"
              icon={<SearchOutlined />}
              size="small"
              style={{ width: 90 }}
              onClick={() => confirm()}
            >
              Search
            </Button>
            <Button
              size="small"
              style={{ width: 90 }}
              onClick={() => clearFilters()}
            >
              Reset
            </Button>
            {/* <Button
            type="link"
            size="small"
            onClick={() => {
              confirm({ closeDropdown: false });
              
            }}
          >
            Filter
          </Button> */}
          </Space>
        </div>
      ),
      filterIcon: () => {
        return <SearchOutlined />;
      },
      onFilter: (value, record) => {
        return record.id
          .toString()
          .toLowerCase()
          .includes(value.toString().toLowerCase());
      }, //   filterDropdown: ({
      //     setSelectedKeys,
      //     selectedKeys,
      //     confirm,
      //     clearFilters,
      //   }) => (
      //     <div style={{ padding: 8 }}>
      //       <Input
      //         placeholder={`Search`}
      //         value={selectedKeys[0]}
      //         onChange={(e) =>
      //           setSelectedKeys(e.target.value ? [e.target.value] : [])
      //         }
      //         onPressEnter={() => {
      //           confirm();
      //         }}
      //         style={{ marginBottom: 8, display: "block" }}
      //       />
      //       <Space>
      //         <Button
      //           type="primary"
      //           icon={<SearchOutlined />}
      //           size="small"
      //           style={{ width: 90 }}
      //           onClick={() => confirm()}
      //         >
      //           Search
      //         </Button>
      //         <Button
      //           size="small"
      //           style={{ width: 90 }}
      //           onClick={() => clearFilters()}
      //         >
      //           Reset
      //         </Button>
      //         {/* <Button
      //           type="link"
      //           size="small"
      //           onClick={() => {
      //             confirm({ closeDropdown: false });

      //           }}
      //         >
      //           Filter
      //         </Button> */}
      //       </Space>
      //     </div>
      //   ),
      //   filterIcon: () => {
      //     return <SearchOutlined />;
      //   },
    },
    {
      title: t && t("order.items"),
      dataIndex: "orderItems",
      key: "orderItems",
      width: 200,
      render: (record) => (
        <div>
          {record &&
            record.length &&
            record.map((item, index) => (
              <Space key={index} style={{ marginBottom: "10px" }}>
                <img
                  src={item?.Product?.images[0]?.source}
                  style={{ width: "80px" }}
                />
                <Tag>
                  {item?.Product?.name} * {item?.quantity}
                </Tag>
              </Space>
            ))}
        </div>
      ),
    },
    {
      title: t && t("order.customer"),
      dataIndex: "Customer",
      key: "Customer",
      render: (record) => (
        <Tag color="geekblue">{record?.name + " - " + record?.id}</Tag>
      ),
    },
    {
      title: t && t("order.user"),
      dataIndex: "user",
      key: "user",
      render: (record) => (
        <div>
          {record && (
            <Tag color="geekblue">{record?.name + " - " + record?.id}</Tag>
          )}
        </div>
      ),
    },

    {
      title: t && t("order.total"),
      dataIndex: "total",
      key: "total",
      render: (record) => (
        <Tag color="processing">{formatCurrency(record)}</Tag>
      ),
    },
    {
      title: t && t("order.phone"),
      dataIndex: "phoneNumber",
      key: "phoneNumber",
      render: (record) => <Tag color="volcano">{formatPhone(record)}</Tag>,
    },
    {
      title: "Discount",
      dataIndex: "discount",
      key: "discount",
      render: (record) => <Tag color="volcano">{formatPhone(record.code)}</Tag>,
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: t && t("order.address"),
      dataIndex: "address",
      key: "address",
    },
    {
      title: t && t("order.created"),
      dataIndex: "createdAt",
      key: "createdAt",
      render: (record) => (
        <div>{moment(record).format("HH:mm | DD/MM/YYYY")}</div>
      ),
    },
    {
      title: t && t("order.finishedAt"),
      dataIndex: "dateCompleted",
      key: "dateCompleted",
      render: (record) => (
        <div>{record && moment(record).format("HH:mm | DD/MM/YYYY")}</div>
      ),
    },
    // {
    //   title: "Complete day",
    //   dataIndex: "dateCompleted",
    //   key: "dateCompleted",
    //   render: (record) => (
    //     <div>{moment(record).format("HH:mm | DD/MM/YYYY")}</div>
    //   ),
    // },
    {
      title: t && t("order.status"),
      dataIndex: "orderStatus",
      key: "orderStatus",
      render: (record) => (
        <>
          {record == 0 && (
            <Tag color="orange">{t && t("order.incomplete")}</Tag>
          )}
          {record == 1 && <Tag color="cyan">{t && t("order.complete")}</Tag>}
        </>
      ),
    },
    {
      title: t && t("order.statusPayment"),
      dataIndex: "PaymentDetail",
      key: "PaymentDetail",
      render: (record) => (
        <>
          {record.paymentStatus == 0 && (
            <Tag color="red">{t && t("order.unpaid")}</Tag>
          )}
          {record.paymentStatus == 1 && (
            <Tag color="cyan">{t && t("order.paid")}</Tag>
          )}
        </>
      ),
    },
    {
      title: t && t("order.paymentMethod"),
      dataIndex: "PaymentDetail",
      key: "PaymentDetail",
      render: (record) => <Tag color="green">{record.paymentType}</Tag>,
    },
    {
      title: t && t("button.action"),
      dataIndex: "",
      key: "x",
      width: 200,
      render: (record) => (
        <div>
          <Popconfirm
            title="Are you sure？"
            onConfirm={() => handleConfirmDelete(record.id)}
            icon={<QuestionCircleOutlined style={{ color: "red" }} />}
          >
            <Button type="link" danger>
              {t("button.delete")}
            </Button>
          </Popconfirm>
          <Button type="link" onClick={() => handleOpen(record)}>
            {t("button.edit")}
          </Button>
        </div>
      ),
    },
  ];

  const handleOpen = async (formValue) => {
    console.log(
      "🚀 ~ file: index.jsx ~ line 339 ~ handleOpen ~ formValue",
      formValue
    );
    if (formValue.id) {
      setIsAdd(false);
      console.log(formValue);
      //   const getDataCustomer = await axios.get(`${process.env.REACT_APP_API_URL}khachhangs/${}`)
      setValueForm({
        id: formValue?.id,
        customerId: formValue?.Customer?.id,
        address: formValue?.Customer?.address,
        email: formValue?.Customer?.email,
        phoneNumber: formValue?.Customer?.phoneNumber,
        items: formValue?.orderItems.map((p) => ({
          product: p?.productId,
          quantity: p?.quantity,
        })),
        userId:
          formValue?.user && formValue?.user?.id ? formValue.user.id : null,
        orderStatus: formValue?.orderStatus ? 1 : 0,
        paymentStatus: formValue?.PaymentDetail.paymentStatus ? 1 : 0,
        paymentType: formValue?.PaymentDetail.paymentType,
        discountId: formValue?.discount?.id,
      });
    } else {
      setIsAdd(true);
      form.current?.setFieldsValue({
        id: 0,
        customerId: 0,
        address: "",
        email: "",
        phoneNumber: "",
        items: [
          {
            product: null,
            quantity: 1,
          },
        ],
        userId: null,
        orderStatus: 0,
        paymentStatus: 0,
        paymentType: "cod",
        discountId: 1,
      });
      setValueForm({
        id: 0,
        customerId: 0,
        address: "",
        email: "",
        phoneNumber: "",
        items: [
          {
            product: null,
            quantity: 1,
          },
        ],
        userId: null,
        orderStatus: 0,
        paymentStatus: 0,
        paymentType: "cod",
        discountId: 1,
      });
    }
    setVisible(true);
  };
  const handleClose = () => {
    setVisible(false);
    setValueForm({
      id: 0,
      customerId: 0,
      address: "",
      email: "",
      phoneNumber: "",
      items: [
        {
          product: null,
          quantity: 1,
        },
      ],
      userId: null,
      orderStatus: 0,
      paymentStatus: 0,
      paymentType: "cod",
      discountId: 1,
    });
    form?.current.resetFields();
  };

  const handleReloadData = async () => {
    const action = getAllOrd();
    await dispatch(action);
  };

  const handleConfirmDelete = async (id) => {
    const action = await removeOrder(id)
      .then((res) => message.success("Delete order success", 0.4))
      .catch((err) => {
        message.success(err.response.data.message, 1);
      });
    handleReloadData();
    setPagination({
      current: 1,
      pageSize: 5,
    });
  };

  const handleTableChange = (pagination, filters, sorter) => {
    let sort = "";
    console.log(filters);
    if (sorter) {
      sort += sorter.order == "ascend" ? "" : "-";
    }
    sort += sorter.field ? sorter.field : "id";
    let action;
    if (sort != "") {
      if (filters && filters.id) {
        action = getAllOrd({
          pageNo: pagination.current,
          pageSize: pagination.pageSize,
          sort: sort,
          keywords: filters?.id[0],
        });
      } else {
        action = getAllOrd({
          pageNo: pagination.current,
          pageSize: pagination.pageSize,
          sort: sort,
        });
      }
    } else {
      if (filters && filters.id) {
        action = getAllOrd({
          pageNo: pagination.current,
          pageSize: pagination.pageSize,
          keywords: filters?.id[0],
        });
      } else {
        action = getAllOrd({
          pageNo: pagination.current,
          pageSize: pagination.pageSize,
        });
      }
    }
    dispatch(action);
    setPagination({
      ...pagination,
      current: pagination.current,
      pageSize: pagination.pageSize,
    });
  };

  const finishForm = async (data) => {
    console.log("🚀 ~ file: index.jsx ~ line 500 ~ finishForm ~ data", data);
    setSubmit(true);
    const itemsNew = groupBy(data.items, "product");
    const newData = [];
    console.log(itemsNew);
    for (const [item, key] of Object.entries(itemsNew)) {
      newData.push({
        product: item,
        quantity: key.map((p) => p.quantity).reduce((a, b) => a + b, 0),
      });
    }
    let arrayItems = [];
    arrayItems = newData.map((p) => ({
      product: Number.parseInt(p.product),
      quantity: p.quantity,
    }));

    console.log(
      "🚀 ~ file: index.jsx ~ line 531 ~ finishForm ~ arrayItems",
      arrayItems
    );
    if (!isAdd) {
      console.log("update", data);
      const action = await saveOrder({
        ...data,
        items: arrayItems,
        id: valueForm.id,
        dateCompleted: new Date(),
      })
        .then((res) => {
          setSubmit(false);
          message.success("Success", 0.6);
        })
        .catch((err) => {
          message.error(err.response?.data?.message, 1);
          setSubmit(false);
        });
    } else {
      console.log("save", data);
      const action = await saveOrder({
        ...data,
        items: arrayItems,
        id: valueForm.id,
      })
        .then((res) => {
          setSubmit(false);
          message.success("Success", 0.6);
        })
        .catch((err) => {
          message.error(err.response?.data?.message, 1);
          setSubmit(false);
        });
    }
    form.current.resetFields();
    setValueForm({
      id: 0,
      customerId: 0,
      address: "",
      email: "",
      phoneNumber: "",
      items: [
        {
          product: null,
          quantity: 1,
        },
      ],
      userId: null,
      orderStatus: 0,
      paymentStatus: 0,
      paymentType: "cod",
      discountId: 1,
    });
    handleReloadData();
    const actionProduct = getAll();
    dispatch(actionProduct);
    setVisible(false);
  };

  const getCustomer = (value) => {
    try {
      let timeout;
      if (timeout) {
        clearTimeout(timeout);
        timeout = null;
      }
      timeout = setTimeout(() => {
        const action = getAllCus({
          keywords: value,
          pageNo: 1,
          pageSize: 10,
        });
        dispatch(action);
      }, 300);
    } catch (err) {
      console.log(err);
    }
  };
  const getDiscount = (value) => {
    console.log("🚀 ~ file: index.jsx ~ line 621 ~ getUser ~ value", value);
    let timeout;
    if (timeout) {
      clearTimeout(timeout);
      timeout = null;
    }
    timeout = setTimeout(() => {
      const action = getAllDis({
        keywords: value,
        pageNo: 1,
        pageSize: 10,
      });
      dispatch(action);
    }, 300);
  };

  const getUser = (value) => {
    console.log("🚀 ~ file: index.jsx ~ line 621 ~ getUser ~ value", value);
    let timeout;
    if (timeout) {
      clearTimeout(timeout);
      timeout = null;
    }
    timeout = setTimeout(() => {
      const action = getAllUs({
        keywords: value,
        pageNo: 1,
        pageSize: 10,
      });
      dispatch(action);
    }, 300);
  };

  const getProductFilter = (value) => {
    let timeout;
    if (timeout) {
      clearTimeout(timeout);
      timeout = null;
    }
    timeout = setTimeout(() => {
      const action = getAll({
        keywords: value,
        pageNo: 1,
        pageSize: 10,
      });
      dispatch(action);
    }, 300);
  };
  useEffect(() => {
    if (!isAdd) {
      form.current?.setFieldsValue({
        id: valueForm?.id,
        customerId: valueForm?.customerId,
        address: valueForm?.address,
        email: valueForm?.email,
        phoneNumber: valueForm?.phoneNumber,
        userId: valueForm?.userId,
        orderStatus: valueForm?.orderStatus,
        paymentStatus: valueForm?.paymentStatus,
        paymentType: valueForm?.paymentType,
        items: valueForm?.items,
        discountId: valueForm?.discountId,
      });
    } else {
      form.current?.setFieldsValue({
        id: valueForm?.id,
        customerId: valueForm?.Customer?.id,
        address: valueForm?.address,
        email: valueForm?.email,
        phoneNumber: valueForm?.phoneNumber,
        items: [
          {
            product: null,
            quantity: 1,
          },
        ],
        userId: null,
        orderStatus: 0,
        paymentStatus: 0,
        paymentType: "cod",
        discountId: 1,
      });
    }
  }, [valueForm]);

  useEffect(() => {
    handleReloadData();
    const actionCustomer = getAllCus();
    dispatch(actionCustomer);
    const actionProduct = getAll();
    dispatch(actionProduct);
    const actionUser = getAllUs();
    dispatch(actionUser);
    const actionDiscount = getAllDis();
    dispatch(actionDiscount);
  }, []);

  const onChange2 = async (value) => {
    console.log("🚀 ~ file: index.jsx ~ line 706 ~ onChange2 ~ value", value);

    const res = await axios.get(
      `${process.env.REACT_APP_API_URL}/giamgias/${value}`
    );
    if (res && res.data) {
      form?.current?.setFieldsValue({
        code: res.data?.data?.code,
      });
    }
  };

  const onChange1 = async (value) => {
    const res = await axios.get(
      `${process.env.REACT_APP_API_URL}/taikhoans/${value}`
    );
    if (res && res.data) {
      form?.current?.setFieldsValue({
        address: res.data?.data?.address,
        email: res.data?.data?.email,
        phoneNumber: res.data?.data?.phoneNumber,
      });
    }
  };

  const onChange = async (value) => {
    const res = await axios.get(
      `${process.env.REACT_APP_API_URL}/khachhangs/${value}`
    );
    if (res && res.data) {
      form?.current?.setFieldsValue({
        address: res.data?.data?.address,
        email: res.data?.data?.email,
        phoneNumber: res.data?.data?.phoneNumber,
      });
    }
  };

  const onChangeProduct = async (value) => {
    const action = getAll();
    dispatch(action);
  };
  return (
    <div>
      <Button
        onClick={handleOpen}
        type="primary"
        style={{ margin: "10px 0px" }}
      >
        {t("order.add")}
      </Button>
      <Drawer
        visible={visible}
        placement="right"
        title="Order form"
        width={window.innerWidth > 900 ? "50%" : "100%"}
        onClose={handleClose}
        footer={
          <Space style={{ float: "right" }}>
            <Button onClick={handleClose}>{t("button.cancel")}</Button>
            <Button
              type="primary"
              form="formOrder"
              htmlType="submit"
              disabled={submit}
            >
              {t("button.submit")}
            </Button>
          </Space>
        }
      >
        <Form
          id="formOrder"
          ref={form}
          name="Form product"
          onFinish={finishForm}
          layout="vertical"
        >
          <Collapse defaultActiveKey={["1", "2", "3"]}>
            <Panel header={t && t("order.customer")} key="1">
              <Form.Item
                name="customerId"
                label={t && t("order.selectCus")}
                rules={[
                  { required: true, message: t("order.pleaseSelectCustomer") },
                ]}
              >
                <Select
                  showSearch
                  placeholder={t && t("order.SelectAPerson")}
                  onChange={onChange}
                  onSearch={getCustomer}
                  defaultActiveFirstOption={false}
                  filterOption={false}
                >
                  {customers.map((customer, index) => (
                    <Option key={index} value={customer.id}>
                      {customer.name +
                        " | " +
                        customer.phoneNumber +
                        " | " +
                        customer.email}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
              <Form.Item
                label={t && t("order.address")}
                name="address"
                rules={[
                  {
                    required: true,
                    message: t("order.pleaseEnterYourAddress"),
                  },
                ]}
              >
                <Input />
              </Form.Item>
              <Form.Item
                label="Email"
                name="email"
                rules={[
                  {
                    type: "email",
                    message: t("order.theInputIsNotValidEmail"),
                  },
                  {
                    required: true,
                    message: t("order.pleaseInputYourEmail"),
                  },
                ]}
              >
                <Input />
              </Form.Item>
              <Form.Item
                label={t && t("order.phone")}
                name="phoneNumber"
                rules={[
                  {
                    pattern: /((09|03|07|08|05)+([0-9]{8})\b)/g,
                    message: t("order.phoneNumberNotValid"),
                  },
                  {
                    required: true,
                    message: t("order.enterYourPhoneNumber"),
                  },
                ]}
                validateTrigger="onSubmit"
              >
                <Input />
              </Form.Item>
            </Panel>
            <Panel header={t && t("order.items")} key="2">
              <Form.List
                name="items"
                rules={[
                  {
                    validator: async (_, items) => {
                      if (!items || items.length < 1) {
                        return Promise.reject(new Error("At least 1 product"));
                      }
                    },
                  },
                ]}
              >
                {(fields, { add, remove }, { errors }) => (
                  <>
                    {fields.map((field, index) => (
                      <Form.Item
                        key={index}
                        noStyle
                        shouldUpdate={(prevValues, curValues) =>
                          prevValues.product !== curValues.product ||
                          prevValues.quantity !== curValues.quantity
                        }
                      >
                        {() => (
                          <Row
                            style={{ width: "100%" }}
                            align="bottom"
                            gutter="10"
                          >
                            <Divider>
                              {t("order.product") + " " + (index + 1)}
                            </Divider>
                            <Col span="16">
                              <Form.Item
                                {...field}
                                validateTrigger={["onChange", "onBlur"]}
                                name={[field.name, "product"]}
                                fieldKey={[field.fieldKey, "product"]}
                                rules={[
                                  {
                                    required: true,
                                    message:
                                      t("order.pleaseSelectProduct") +
                                      (index + 1),
                                    // message:(t(`order.pleaseSelectProduct ${ index + 1}.))`,
                                    // message: `Please select product ${ index + 1 }`,
                                  },
                                ]}
                              >
                                <Select
                                  showSearch
                                  placeholder={t && t("order.Selectaproduct")}
                                  onChange={onChangeProduct}
                                  onSearch={getProductFilter}
                                  defaultActiveFirstOption={false}
                                  filterOption={false}
                                >
                                  {products.map((product, index) => (
                                    <Option key={index} value={product.id}>
                                      {product.code +
                                        " | " +
                                        product.name +
                                        " | " +
                                        product.quantity}
                                    </Option>
                                  ))}
                                </Select>
                              </Form.Item>
                            </Col>
                            <Col span="8" style={{ display: "flex" }}>
                              <Form.Item
                                {...field}
                                name={[field.name, "quantity"]}
                                fieldKey={[field.fieldKey, "quantity"]}
                                validateTrigger={["onChange", "onBlur"]}
                                rules={[
                                  {
                                    required: true,
                                    message:
                                      t("order.Pleaseinputquantityproduct") +
                                      (index + 1),
                                    // message: `Please input quantity product ${
                                    //   index + 1
                                    // }.`,
                                  },
                                ]}
                              >
                                <InputNumber
                                  placeholder={t && t("order.Quantity")}
                                  style={{ width: "100%" }}
                                  min={1}
                                />
                              </Form.Item>
                              <MinusCircleOutlined
                                style={{
                                  marginTop: "10px",
                                  marginLeft: "10px",
                                }}
                                onClick={() => remove(field.name)}
                              />
                            </Col>
                          </Row>
                        )}
                      </Form.Item>
                    ))}
                    <Form.Item>
                      <Button
                        type="dashed"
                        onClick={() => add()}
                        style={{ width: "100%" }}
                        icon={<PlusOutlined />}
                      >
                        {t && t("product.add")}
                      </Button>
                      <Form.ErrorList errors={errors} />
                    </Form.Item>
                  </>
                )}
              </Form.List>
            </Panel>
            <Panel header={t && t("order.inforOrder")} key="3">
              <Form.Item name="userId" label={t && t("order.selectUsr")}>
                <Select
                  showSearch
                  placeholder={t && t("order.Selectauser")}
                  onChange={onChange1}
                  onSearch={getUser}
                  defaultActiveFirstOption={false}
                  filterOption={false}
                >
                  {users.map((user, index) => (
                    <Option key={index} value={user.id}>
                      {user.id + " | " + user.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
              <Form.Item name="discountId" label="Discount">
                <Select
                  showSearch
                  onChange={onChange2}
                  onSearch={getDiscount}
                  defaultActiveFirstOption={true}
                  filterOption={false}
                >
                  {discounts.map((discount, index) => (
                    <Option key={index} value={discount.id}>
                      {discount.id + " | " + discount.code}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
              <Form.Item
                name="orderStatus"
                label={t && t("order.status")}
                rules={[
                  {
                    required: true,
                    message: t("order.Pleaseselectorderstatus"),
                  },
                ]}
              >
                <Select
                  showSearch
                  placeholder={t && t("order.Selectaorderstatus")}
                >
                  <Option value={0}>{t && t("order.incomplete")}</Option>
                  <Option value={1}>{t && t("order.complete")}</Option>
                </Select>
              </Form.Item>
              <Form.Item
                name="paymentStatus"
                label={t && t("order.statusPayment")}
                rules={[
                  {
                    required: true,
                    message: t("order.Pleaseselectpaymentstatus"),
                  },
                ]}
              >
                <Select
                  showSearch
                  placeholder={t && t("order.Selectapaymentstatus")}
                >
                  <Option value={0}>{t && t("order.unpaid")}</Option>
                  <Option value={1}>{t && t("order.paid")}</Option>
                </Select>
              </Form.Item>
              <Form.Item
                name="paymentType"
                label={t && t("order.paymentMethod")}
                rules={[
                  {
                    required: true,
                    message: t("order.Pleaseselectpaymentmethod"),
                  },
                ]}
              >
                <Select
                  showSearch
                  placeholder={t && t("order.Selectapaymentmethod")}
                >
                  <Option value="cod">Cod</Option>
                  <Option value="momo">Momo</Option>
                </Select>
              </Form.Item>
            </Panel>
          </Collapse>
        </Form>
      </Drawer>

      <Table
        columns={column}
        dataSource={data}
        scroll={{ x: 2000 }}
        onChange={handleTableChange}
        pagination={{ ...pagination, total: total }}
        loading={loading}
        rowKey="id"
      />
    </div>
  );
}

export default ListOrder;
