import React, { useState, useImperativeHandle } from 'react';

import {
  Form,
  Input,
  Select,
  Divider,
  Button,
  Popconfirm,
  InputNumber,
  message,
} from 'antd';

import { FwTable } from '../../components/Table';

import { getTimeStr } from '@/utils/utils';

const { Option } = Select;

const timeTransform = (time) => {
  const hour = 60 * 60 * 1000;
  if (time instanceof Array) {
    // 将天 时 分转换为秒
    return (
      (time[0] ?? 0) * 24 * hour +
      (time[1] ?? 0) * hour +
      (time[2] ?? 0) * 60 * 1000
    );
  } else {
    // 将秒转换为天 时 分
    const day = Math.floor(time / (24 * 60 * 60 * 1000));
    const hour = Math.floor((time % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
    const minute = Math.floor((time % (60 * 60 * 1000)) / (60 * 1000));
    return [day, hour, minute];
  }
};

const EditableCell = ({
  editing,
  dataIndex,
  title,
  required = true,
  inputType,
  record,
  index,
  children,
  properties,
  ...restProps
}) => {
  const nodes = {
    input: () => <Input style={{ maxWidth: '2rem' }} />,
    radio: () => (
      <Select placeholder="请选择" style={{ width: '100%', maxWidth: '2rem' }}>
        <Option key={true} value={true}>
          是
        </Option>
        <Option key={false} value={false}>
          否
        </Option>
      </Select>
    ),
    select: () => (
      <Select placeholder="请选择" style={{ width: '100%', maxWidth: '2rem' }}>
        {properties.map((item) => {
          return <Option key={item.id}>{item.name}</Option>;
        })}
      </Select>
    ),
    inputNumber: () => {
      const time = timeTransform(record[dataIndex]);

      return (
        <>
          <Form.Item
            noStyle
            initialValue={time[0]}
            name={`${dataIndex}day`}
            preserve={false}
          >
            <InputNumber
              style={{ width: 60 }}
              min={0}
              formatter={(value) => Math.abs(value) || 0}
            />
          </Form.Item>
          天
          <Form.Item
            noStyle
            initialValue={time[1]}
            name={`${dataIndex}hour`}
            preserve={false}
          >
            <InputNumber
              style={{ width: 60, marginLeft: '0.05rem' }}
              min={0}
              formatter={(value) => Math.abs(value) || 0}
            />
          </Form.Item>
          时
          <Form.Item
            noStyle
            initialValue={time[2]}
            name={`${dataIndex}minute`}
            preserve={false}
          >
            <InputNumber
              style={{ width: 60, marginLeft: '0.05rem' }}
              min={0}
              formatter={(value) => Math.abs(value) || 0}
            />
          </Form.Item>
          分
        </>
      );
    },
  };
  const errorMsgs = {
    input: '请填写',
    radio: '请选择',
    select: '请选择',
    inputNumber: '请填写',
  };
  return (
    <td {...restProps}>
      {editing ? (
        <Form.Item
          name={dataIndex}
          style={{
            margin: 0,
          }}
          rules={[
            {
              required,
              message: `${errorMsgs[inputType]}${title}`,
            },
          ]}
          initialValue={record[dataIndex]}
          preserve={false}
        >
          {nodes[inputType].call(this)}
        </Form.Item>
      ) : (
        children
      )}
    </td>
  );
};

const EditTable = React.forwardRef((props, ref) => {
  const [form] = Form.useForm();
  const [editingKey, setEditingKey] = useState('');
  const isEditing = (record) => record.key === editingKey;
  const {
    updataDataSource = () => {},
    properties = [],
    dataSource = [],
    scroll,
    timingPlanType,
  } = props;

  useImperativeHandle(ref, () => ({
    setEditingKey,
  }));

  const editRow = (record) => {
    form.setFieldsValue({
      ...record,
    });
    setEditingKey(record.key);
  };

  const deleteRow = (index) => {
    dataSource.splice(index, 1);
    updataDataSource([...dataSource]);
  };

  const cancel = (isNewRow) => {
    if (isNewRow) {
      dataSource.pop();
      updataDataSource([...dataSource]);
    }
    setEditingKey('');
  };

  // 表格操作-保存当前编辑行
  const save = async (key) => {
    try {
      const row = await form.validateFields();
      /**
       * workDuration - 灌溉时长
       * 该值不能为空
       * sleepDuration与下一任务的间隔时长，可为空
       */
      const workDuration = timeTransform([
        row.workDurationday,
        row.workDurationhour,
        row.workDurationminute,
      ]);

      if (!workDuration) {
        message.error('灌溉时长不能小于1分钟');
        return;
      }

      /**
       * sleepDuration - 定时计划中 与下一任务的间隔时长
       * 该值在轮灌计划时可为空，定时计划时不可为空
       * 轮灌计划时后端不会使用该值，这个功能后期可能修改，请保留现有逻辑
       */
      const sleepDuration = timeTransform([
        row.sleepDurationday,
        row.sleepDurationhour,
        row.sleepDurationminute,
      ]);

      /**
       * 轮灌计划：保存行时需要在改行选择分组，定时计划时则不需要
       * 所以表单拿到的数据有分组ID时，为轮灌计划类型
       * 该行为不符合产品最初的要求，只不过现有的方案能实现后端需要的数据，该问题为后端遗留，具体修改需要后端配置，
       */
      let timingPlanGroupName = '';
      /**
       * 轮灌计划时通过分组id和查组装分组名字段
       * 定时计划是，需要在调用接口的位置通过计划类型对表格数据做校验
       */
      if (row.timingPlanGroupId) {
        timingPlanGroupName = properties.find(
          ({ id }) => id === row.timingPlanGroupId,
        ).name;
      } else {
        // 原始需求与下一任务的间隔时间可以为0，后面心系统是刘雷认为不可以为0.该判断暂时保留
        if (!sleepDuration) {
          message.error('与下一个任务的间隔时间不能小于1分钟');
          return;
        }
      }

      /**
       * 数组/对象这样的引用类型的数据这里需要将数据深拷贝一份，
       * 避免用户放弃修改而使原始数据被修改，
       */
      const newData = [...dataSource];
      /**
       * 通过特别添加的key字段，来拿到当前正在操作的任务，
       * 将新的数据更新到列表，等待提交到服务端
       */
      const index = newData.findIndex((item) => key === item.key);

      if (index > -1) {
        const item = newData[index];
        delete item.isNewRow;
        newData.splice(index, 1, {
          ...item,
          ...row,
          workDuration,
          sleepDuration,
          timingPlanGroupName,
        });
      } else {
        newData.push({
          ...dataSource.pop(),
          ...row,
          workDuration,
          sleepDuration,
          timingPlanGroupName,
        });
      }

      updataDataSource(newData);
      setEditingKey('');
    } catch (errInfo) {
      // 。。。
    }
  };

  const addAttRow = () => {
    const { length } = dataSource;
    // if (isEditing(dataSource[length - 1])) return;
    const editNum = length + 1;
    const newRow = {
      key: editNum,
      name: '',
      timingPlanGroupId: '',
      workDuration: 0,
      sleepDuration: 0,
      isNewRow: true,
    };
    form.setFieldsValue({
      ...newRow,
    });
    dataSource.push(newRow);
    updataDataSource([...dataSource]);
    setEditingKey(editNum);
  };

  const getColumns = () => {
    const columns = [
      {
        title: '任务序号',
        width: '1.5rem',
        render: (text, record, index) => (
          <span style={{ color: '#ffffff99' }}>{index + 1}</span>
        ),
      },
      {
        title: '灌区分组',
        dataIndex: 'timingPlanGroupName',
        editable: true,
        type: 'select',
        editIndex: 'timingPlanGroupId',
      },
      {
        title: '灌溉时长',
        render: (row) => getTimeStr(row.workDuration),
        editable: true,
        type: 'inputNumber',
        editIndex: 'workDuration',
        required: false,
      },
      {
        title: '与下一任务的间隔',
        render: (row) => getTimeStr(row.sleepDuration),
        editable: true,
        type: 'inputNumber',
        editIndex: 'sleepDuration',
        required: false,
      },
      {
        title: '操作',
        width: '1.5rem',
        dataIndex: 'operation',
        render: (_, record, index) => {
          const editable = isEditing(record);
          if (editable) {
            return (
              <span>
                <a onClick={() => save(record.key)}>保存</a>
                <Divider type="vertical" />
                <a
                  style={{ marginLeft: '0.1rem' }}
                  onClick={() => cancel(record.isNewRow)}
                >
                  取消
                </a>
              </span>
            );
          }
          return (
            <span>
              <a disabled={editingKey !== ''} onClick={() => editRow(record)}>
                编辑
              </a>
              <Popconfirm title="确定删除?" onConfirm={() => deleteRow(index)}>
                <a
                  style={{ marginLeft: '0.1rem' }}
                  disabled={editingKey !== ''}
                >
                  删除
                </a>
              </Popconfirm>
            </span>
          );
        },
      },
    ];

    if (timingPlanType === 'ROTATION_FLOW_PLAN') columns.splice(3, 1);
    if (timingPlanType === 'IMTING_PLAN') columns.splice(1, 1);

    return columns;
  };

  const mergedColumns = getColumns().map((col) => {
    if (!col.editable) {
      return col;
    }

    return {
      ...col,
      onCell: (record) => ({
        record,
        required: col.required,
        inputType: col.type,
        dataIndex: col.editIndex,
        title: col.title,
        editing: isEditing(record),
        properties: properties,
      }),
    };
  });
  return (
    <Form form={form} component={false}>
      <FwTable
        rowKey="key"
        components={{
          body: {
            cell: EditableCell,
          },
        }}
        dataSource={dataSource}
        columns={mergedColumns}
        rowSelection={null}
        pagination={false}
        locale={{
          emptyText: '请点击添加一行按钮添新增任务',
        }}
      />
      <Button
        style={{
          position: 'absolute',
          top: '-46px',
          right: 0,
        }}
        disabled={editingKey !== ''}
        onClick={addAttRow}
      >
        添加一行
      </Button>
    </Form>
  );
});

export default EditTable;
