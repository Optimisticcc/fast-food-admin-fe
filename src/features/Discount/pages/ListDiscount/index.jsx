import React, { useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import {
  Button,
  Drawer,
  Table,
  Form,
  Space,
  Input,
  Select,
  Popconfirm,
  Row,
  Col,
  Switch,
  DatePicker,
  Tag,
  Upload,
  message,
} from "antd";
import { useDispatch, useSelector } from "react-redux";
import { getAllDis, getDisById } from "features/Discount/discountSlice";
import { QuestionCircleOutlined, SearchOutlined } from "@ant-design/icons";
import BraftEditor from "braft-editor";
import "braft-editor/dist/index.css";
import axiosClient from "api/axiosClient";
import moment from "moment";
import { formatPhone } from "app/format";
import { useTranslation } from "react-i18next";
import { removeDiscount, saveDiscount } from "api/discountApi";
ListDiscount.propTypes = {};
function ListDiscount(props) {
  const { t } = useTranslation();
  const { Option } = Select;
  const { TextArea } = Input;
  const data = useSelector((state) => state.discounts.discounts);
  const total = useSelector((state) => state.discounts.totalCount);
  const [submit, setSubmit] = useState(false);
  const dispatch = useDispatch();
  const [visible, setVisible] = useState(false);
  const loading = useSelector((state) => state.discounts.loading);

  const [add, setAdd] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 6,
  });
  const [formValue, setValueForm] = useState({
    id: 0,
    code: "",
    discountPercent: null,
    isActive: true,
    startDate: null,
    expirationDate: null,
  });
  const form = useRef();
  const column = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
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
    },

    {
      title: t && t("discount.code"),
      dataIndex: "code",
      key: "code",
    },
    {
      title: t && t("discount.discountPercent"),
      dataIndex: "discountPercent",
      key: "discountPercent",
    },
    {
      title: t && t("discount.startDate"),
      dataIndex: "startDate",
      key: "startDate",
      render: (record) => <div>{moment(record).format("DD/MM/YYYY")}</div>,
    },
    {
      title: t && t("discount.expirationDate"),
      dataIndex: "expirationDate",
      key: "expirationDate",
      render: (record) => <div>{moment(record).format("DD/MM/YYYY")}</div>,
    },
    {
      title: t && t("discount.isActive"),
      dataIndex: "isActive",
      key: "isActive",
      render: (record) => (
        <>
          {record == true && <Tag color="orange">Active</Tag>}
          {record == false && <Tag color="cyan">InActive</Tag>}
        </>
      ),
    },
    {
      title: t && t("button.action"),
      dataIndex: "",
      key: "x",
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

  const handleOpen = (formValue) => {
    console.log(
      "🚀 ~ file: index.jsx ~ line 186 ~ handleOpen ~ formValue",
      formValue
    );
    if (formValue.id) {
      setAdd(false);
      setValueForm({
        id: formValue.id,
        code: formValue.code,
        discountPercent: formValue.discountPercent,
        isActive: formValue.isActive,
        startDate: formValue.startDate,
        expirationDate: formValue.expirationDate,
      });
    } else {
      setAdd(true);
      form.current?.setFieldsValue({
        id: 0,
        code: "",
        discountPercent: null,
        isActive: true,
        startDate: null,
        expirationDate: null,
      });
      setValueForm({
        id: 0,
        code: "",
        discountPercent: null,
        isActive: true,
        startDate: null,
        expirationDate: null,
      });
    }
    setVisible(true);
  };

  const handleClose = () => {
    setVisible(false);
    setValueForm({
      id: 0,
      code: "",
      discountPercent: null,
      isActive: true,
      startDate: null,
      expirationDate: null,
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
        action = getAllDis({
          pageNo: pagination.current,
          pageSize: pagination.pageSize,
          sort: sort,
          keywords: filters?.id[0],
        });
      } else {
        action = getAllDis({
          pageNo: pagination.current,
          pageSize: pagination.pageSize,
          sort: sort,
        });
      }
    } else {
      if (filters && filters.id) {
        action = getAllDis({
          pageNo: pagination.current,
          pageSize: pagination.pageSize,
          keywords: filters?.id[0],
        });
      } else {
        action = getAllDis({
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

  const handleReloadData = () => {
    const action = getAllDis();
    dispatch(action);
  };

  const handleConfirmDelete = async (id) => {
    const action = await removeDiscount(id)
      .then((res) => message.success("Delete discount success", 0.4))
      .catch((err) => {
        if (
          err &&
          err.response &&
          err.response.data &&
          err.response.data.message
        ) {
          if (err.response.data.message.message)
            message.error(err.response.data.message.message, 1);
          else message.error(err.response.data.message, 1);
        }
      });
    handleReloadData();
  };

  const finishForm = async (data) => {
    if (data.startDate > data.expirationDate) {
      message.error("Date start not be greater than expiration Date", 1);
    } else {
      setSubmit(true);
      console.log("🚀 ~ file: index.jsx ~ line 308 ~ finishForm ~ data", data);
      const action = await saveDiscount({
        ...data,
        id: formValue.id,
      })
        .then((res) => {
          message.success("Success", 0.5);
        })
        .catch((err) => {
          message.error(err.response.data.message, 1);
        });

      setSubmit(false);

      form.current.resetFields();
      setValueForm({
        id: 0,
      });
      handleReloadData();
      setVisible(false);
    }
  };

  useEffect(() => {
    if (!add) {
      form.current?.setFieldsValue({
        id: formValue.id,
        code: formValue.code,
        discountPercent: formValue.discountPercent,
        isActive: formValue.isActive,
        startDate: formValue.startDate && moment(formValue.startDate),
        expirationDate:
          formValue.expirationDate && moment(formValue.expirationDate),
      });
    } else {
      form.current?.setFieldsValue({
        id: formValue?.id,
      });
    }
  }, [formValue]);

  useEffect(() => {
    handleReloadData();
  }, []);

  return (
    <div>
      <Button
        onClick={handleOpen}
        style={{
          margin: "10px 0px",
          backgroundColor: "#40a9ff",
          color: "white",
        }}
      >
        {t("discount.add")}
      </Button>
      <Drawer
        visible={visible}
        placement="right"
        title={t("discount.discountForm")}
        width={window.innerWidth > 900 ? "25%" : "100%"}
        onClose={handleClose}
        footer={
          <Space style={{ float: "right" }}>
            <Button onClick={handleClose}>{t("button.cancel")}</Button>
            <Button
              type="primary"
              form="formdiscount"
              htmlType="submit"
              disabled={submit}
            >
              {t("button.submit")}
            </Button>
          </Space>
        }
      >
        <Form
          id="formdiscount"
          ref={form}
          name="Form discount"
          layout="vertical"
          onFinish={finishForm}
        >
          <Row gutter={10}>
            <Col span={24}>
              <Form.Item
                label={t && t("discount.discountCode")}
                name="code"
                rules={[
                  {
                    required: true,
                    message: t("discount.pleaseEnterdiscountCode"),
                  },
                ]}
              >
                <Input />
              </Form.Item>
              <Form.Item
                label={t && t("discount.discountPercent")}
                name="discountPercent"
                rules={[
                  {
                    required: true,
                    message: t("discount.pleaseEnterdiscountPercent"),
                  },
                ]}
              >
                <Input />
              </Form.Item>
              <Form.Item
                label={t && t("discount.startDate")}
                name="startDate"
                rules={[
                  {
                    required: true,
                    message: t("discount.pleaseChoosestartDate"),
                  },
                ]}
              >
                <DatePicker />
              </Form.Item>

              <Form.Item
                label={t && t("discount.expirationDate")}
                name="expirationDate"
                rules={[
                  {
                    required: true,
                    message: t("discount.pleaseChooseexpirationDate"),
                  },
                ]}
              >
                <DatePicker />
              </Form.Item>
              <Form.Item
                label={t && t("discount.isActive")}
                name="isActive"
                valuePropName="checked"
              >
                <Switch
                  defaultValue="Active"
                  checkedChildren="Active"
                  unCheckedChildren="InActive"
                />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Drawer>

      <Table
        columns={column}
        dataSource={[...data]}
        pagination={{ ...pagination, total: total }}
        onChange={handleTableChange}
        loading={loading}
        scroll={{ x: 1400 }}
      />
    </div>
  );
}

export default ListDiscount;
