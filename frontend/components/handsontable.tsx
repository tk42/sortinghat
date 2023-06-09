import { HotTable } from '@handsontable/react';
import { registerAllModules } from 'handsontable/registry';
import 'handsontable/dist/handsontable.full.min.css';

// register Handsontable's modules
registerAllModules();

export const Table = () => {
  return (
    <HotTable
      data={[
        ['こじま ただし', '男', 1, 0, 0, 0, 0, 0, 0, 0, 0, 'メンバー', '前方希望', ''],
      ]}
      colHeaders={['Name', 'Sex', 'Previous Team', 'Score A', 'Score B', 'Score C', 'Score D', 'Score E', 'Score F', 'Score G', 'Score H', 'Role', 'EyeSight', 'Dislikes']}
      columns={[
        {
          type: 'text'
        },
        {
          type: 'dropdown',
          source: ['男', '女']
        },
        {
          type: 'dropdown',
          source: [1, 2, 3, 4, 5, 6, 7, 8, 9]
        },
        {
          type: 'dropdown',
          source: [0, 1, 2, 3, 4, 5, 6, 7, 8]
        },
        {
          type: 'dropdown',
          source: [0, 1, 2, 3, 4, 5, 6, 7, 8]
        },
        {
          type: 'dropdown',
          source: [0, 1, 2, 3, 4, 5, 6, 7, 8]
        },
        {
          type: 'dropdown',
          source: [0, 1, 2, 3, 4, 5, 6, 7, 8]
        },
        {
          type: 'dropdown',
          source: [0, 1, 2, 3, 4, 5, 6, 7, 8]
        },
        {
          type: 'dropdown',
          source: [0, 1, 2, 3, 4, 5, 6, 7, 8]
        },
        {
          type: 'dropdown',
          source: [0, 1, 2, 3, 4, 5, 6, 7, 8]
        },
        {
          type: 'dropdown',
          source: [0, 1, 2, 3, 4, 5, 6, 7, 8]
        },
        {
          type: 'dropdown',
          source: ['メンバー', 'サブリーダー', 'リーダー']
        },
        {
          type: 'dropdown',
          source: ['どこでも', '前方希望', '前方必須']
        },
        {
          type: 'text'
        }
      ]}
      rowHeaders={true}
      contextMenu={['copy', 'cut']}
      licenseKey="non-commercial-and-evaluation"
    />
  );
};
