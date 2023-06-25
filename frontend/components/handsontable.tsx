import { HotTable } from '@handsontable/react';
import { registerAllModules } from 'handsontable/registry';
import 'handsontable/dist/handsontable.full.min.css';
import { Survey, Student, StudentFlavor } from 'services/types/interfaces';
import { Sex, Leader, EyeSight, SexUnion, LeaderUnion, EyeSightUnion } from 'services/types/enum';

// register Handsontable's modules
registerAllModules();

export type TableProps = {
  survey?: Survey
}

export const HandsonTable = (props: TableProps) => {
  return (
    <HotTable
      data={
        props.survey?.student_flavors?.map((studentFlavor: StudentFlavor) => {
          console.log("HandsonTableStudent", studentFlavor, studentFlavor.student, studentFlavor.flavor)
          return [
            studentFlavor.student.name,
            Sex(studentFlavor.student.sex as SexUnion),
            1,
            studentFlavor.flavor.mi_a - 1,
            studentFlavor.flavor.mi_b - 1,
            studentFlavor.flavor.mi_c - 1,
            studentFlavor.flavor.mi_d - 1,
            studentFlavor.flavor.mi_e - 1,
            studentFlavor.flavor.mi_f - 1,
            studentFlavor.flavor.mi_g - 1,
            studentFlavor.flavor.mi_h - 1,
            Leader(studentFlavor.flavor.leader as LeaderUnion),
            EyeSight(studentFlavor.flavor.eyesight as EyeSightUnion),
            studentFlavor.flavor.dislikes.map((dislike) => { return dislike.student_id }).join(',')
          ]
        })}
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
