import React, { PureComponent } from 'react';
import { Table } from 'antd';
import { FwModal } from '@/components';
import { setRollEffect } from '@/utils/utils';

const { confirm } = FwModal;

import './index.less';

class FwTable extends PureComponent {
  static defaultProps = {
    rowKey: 'key',
    total: 0,
    pageSize: 20,
    pageNumber: 1,
    onCustOperats: () => {},
    surplusHeight: 0,
    dataSource: [],
    rollClass: '',
    locale: {
      emptyText: (
        <img
          className="fw-empty-img"
          src={require('../assets/no_data.png')}
          alt=""
        />
      ),
    },
  };

  isRoll = false;

  componentDidUpdate() {
    const { dataSource, rollClass } = this.props;
    if (dataSource.length && rollClass && !this.isRoll) {
      this.isRoll = true;
      setRollEffect({
        content: `.ant-table-tbody`,
        key: `.${rollClass}`,
        container: '.ant-table-body',
      });
    }
  }

  getConfirmTitle = (mark, msgTitle) => {
    if (msgTitle) return msgTitle;

    const titles = {
      delete: '确定删除?',
      cancel: '确定取消?',
      forbidden: '确定禁用?',
    };

    if (titles[mark]) return titles[mark];

    return '警告!';
  };

  optionItemClick = ({ mark, type, msgTitle }, record, index) => {
    const { onCustOperats } = this.props;

    if (type === 'popconfirm') {
      const modal = confirm({
        title: this.getConfirmTitle(mark, msgTitle),
        content: '',
        okText: '确定',
        cancelText: '取消',
        confirmLoading: false,
        onOk: () => {
          onCustOperats(mark, record, index);
          modal.destroy();
        },
        onCancel: () => {},
      });
      return;
    }

    onCustOperats(mark, record, index);
  };

  /**
   * 获取更多操作的Disabled状态
   */
  operationDisabled = (record, dataIndex, item, index) => {
    const { disabled = false } = item;

    if (typeof disabled === 'function') {
      return disabled(record, dataIndex, item, index);
    }

    return disabled;
  };
  /**
   * 获取更多操作是否展示的状态
   */
  operationShow = (record, dataIndex, item, index) => {
    const { show = true } = item;

    if (typeof show === 'function') {
      return show(record, dataIndex, item, index);
    }

    return show;
  };

  getNewColumns = () => {
    const { columns } = this.props;
    columns.map((columnsItem) => {
      Object.assign(columnsItem, { ellipsis: true });
      if (columnsItem.operations && columnsItem.operations.length) {
        columnsItem.render = (text, record, dataIndex) => {
          return (
            <>
              {columnsItem.operations.map((renderItem = {}, operationIndex) => {
                const optionItem = (
                  <span
                    className={`
                      table-operations-item
                      table-operations-item_${renderItem.mark}
                      table-operations-item_${
                        this.operationDisabled(
                          record,
                          dataIndex,
                          renderItem,
                          operationIndex,
                        )
                          ? 'disable'
                          : ''
                      }
                    `}
                    key={renderItem.mark ?? renderItem.name}
                    style={renderItem.style ?? {}}
                    onClick={(e) => {
                      // disabled 时阻止操作
                      if (this.operationDisabled(record, dataIndex, renderItem))
                        return;
                      // 阻止默认行为，屏蔽事件穿透
                      e.stopPropagation();
                      // 操作事件分发
                      this.optionItemClick(
                        renderItem,
                        record,
                        dataIndex,
                        operationIndex,
                      );
                    }}
                  >
                    <a
                      disabled={this.operationDisabled(
                        record,
                        dataIndex,
                        renderItem,
                        operationIndex,
                      )}
                      style={renderItem.style}
                    >
                      {renderItem.name}
                    </a>
                  </span>
                );
                // 是否展示该选项
                if (
                  this.operationShow(
                    record,
                    dataIndex,
                    renderItem,
                    operationIndex,
                  )
                )
                  return optionItem;

                return <></>;
              })}
            </>
          );
        };
      }
    });
    return columns;
  };

  render() {
    const {
      rowKey,
      total,
      pageSize,
      pageNumber,
      onChange,
      loading,
      rowSelection,
      className,
      locale,
      ...rest
    } = this.props;

    /**
     * 默认关闭分页功能，如果传入分页、排序、筛选的方法onChange
     * 则启用分页功能
     */
    let pagination = false;
    if (onChange) {
      pagination = {
        current: pageNumber,
        total,
        pageSize,
        showSizeChanger: true,
        showQuickJumper: false,
        pageSizeOptions: ['20', '50', '100'],
        size: 'small',
      };
    }

    return (
      <Table
        className={`fw-table ${!onChange ? 'no-pagination' : ''} ${className}`}
        rowKey={rowKey}
        rowSelection={rowSelection}
        onChange={(pagination, filters, sorter) => {
          if (onChange) {
            onChange(
              {
                pageSize: pagination.pageSize,
                pageNumber: pagination.current,
              },
              filters,
              sorter,
            );
          }
        }}
        pagination={pagination}
        locale={locale}
        scroll={{ y: '' }}
        {...rest}
        columns={this.getNewColumns()}
      />
    );
  }
}

export default FwTable;
