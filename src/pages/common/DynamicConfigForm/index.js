import React, { memo, useLayoutEffect } from 'react';
import { Row, Col, Input, Button, Form, Select } from 'antd';
import { isArray } from 'lodash';

import './style.less';

const { Option } = Select;

let dcfForm = {};

const DynamicConfigForm = (props) => {
  const [form] = Form.useForm();
  const {
    children = '',
    list = [],
    onSave = new Function(),
    onCancel,
    onSelect = () => {},
    onDeselect = () => {},
    hideBtns = false,
    style = {},
    onFormValuesChange = new Function(),
    renderBtmValue = () => {},
    leftBtnTxt = '保存',
    hideForm = false,
  } = props;
  const onFinish = (values) => {
    onSave(values);
  };
  const onValuesChange = (changedValues, allValues) => {
    onFormValuesChange(changedValues, allValues);
  };

  const renderValueByType = (item) => {
    if (!item.selectParam) Object.assign(item, { selectParam: {} });
    if (!item.style) Object.assign(item, { style: {} });
    if (!item.inputParam) Object.assign(item, { inputParam: {} });
    if (!item.selectOptKey) Object.assign(item, { selectOptKey: 'key' });
    if (!item.selectOptName) Object.assign(item, { selectOptName: 'name' });
    const valueNodes = {
      text: () => <span style={item.style}>{item.initialValue}</span>,
      input: () => <Input style={item.style} {...item.inputParam} />,
      select: () => (
        <Select
          style={item.style}
          {...item.selectParam}
          showArrow
          onChange={(_, option) => {
            let op = { option: {} };
            if (option) {
              op = option;
            }
            onSelect(item.name, form, op);
          }}
          onDeselect={(_, option) => {
            let op = { option: {} };
            if (option) {
              op = option;
            }
            onDeselect(item.name, form, op);
          }}
          filterOption={(input, option) =>
            option.props.children.toLowerCase().indexOf(input.toLowerCase()) >=
            0
          }
        >
          {props[`${item.name}Options`] &&
            props[`${item.name}Options`].map((option, index) => (
              <Option
                key={option[item.selectOptKey]}
                option={option}
                optionindex={index}
              >
                {option[item.selectOptName]}
              </Option>
            ))}
        </Select>
      ),
      password: () => (
        <Input type="password" style={item.style} {...item.inputParam} />
      ),
    };
    return valueNodes[item.renderType] && valueNodes[item.renderType].call();
  };

  useLayoutEffect(() => {
    // const { getForm = new Function() } = props;
    // getForm(form);
    dcfForm = form;
  }, []);

  if (hideForm) style.display = 'none';

  return (
    <div className="dynamic-config-form fw-border" style={style}>
      <Form onValuesChange={onValuesChange} onFinish={onFinish} form={form}>
        {list.length && (
          <Row className="dynamic-config-form-row">
            {list &&
              list.map((item, index) => {
                return (
                  item.isHide !== true && (
                    <Col key={item.name}>
                      <Form.Item
                        label={item.label}
                        name={item.name}
                        initialValue={item.initialValue}
                        rules={[
                          Object.assign(
                            {
                              required: item.required,
                              message: item.message
                                ? item.message
                                : `${item.label}不能为空`,
                            },
                            item.rule,
                          ),
                        ]}
                      >
                        {item.renderValue
                          ? item.renderValue(index)
                          : renderValueByType(item)}
                      </Form.Item>
                    </Col>
                  )
                );
              })}
            {children}
            <Col
              span={24}
              style={{ textAlign: 'right', display: hideBtns ? 'none' : '' }}
            >
              {renderBtmValue && renderBtmValue()}
              <Button type="primary" htmlType="submit">
                {leftBtnTxt}
              </Button>
              <Button
                type="primary"
                danger
                style={{ marginLeft: '10px' }}
                onClick={onCancel}
              >
                取消
              </Button>
            </Col>
          </Row>
        )}
      </Form>
    </div>
  );
};

function setForm(vcList = []) {
  if (isArray(vcList)) {
    vcList.forEach(({ initialValue, name, renderType, renderValue }) => {
      if (['input', 'select'].includes(renderType) && !renderValue) {
        dcfForm.setFieldsValue({
          [name]: initialValue,
        });
      }
    });
  } else {
    dcfForm.setFieldsValue(vcList);
  }
}
function getFormValue(names = []) {
  return dcfForm.getFieldsValue(names);
}
function resetFormFields(fields = []) {
  return dcfForm.resetFields(fields);
}

DynamicConfigForm.setForm = setForm;
DynamicConfigForm.getFormValue = getFormValue;
DynamicConfigForm.resetFormFields = resetFormFields;
DynamicConfigForm.dcfForm = dcfForm;

export default DynamicConfigForm;
