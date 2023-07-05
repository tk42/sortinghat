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
  const data = props.survey ? props.survey!.student_flavors?.map((studentFlavor: StudentFlavor) => {
    // console.log("HandsonTableStudent", studentFlavor, studentFlavor.student, studentFlavor.flavor)
    return [
      studentFlavor.student.name,
      Sex(studentFlavor.student.sex as SexUnion),
      1,
      studentFlavor.flavor.mi_a,
      studentFlavor.flavor.mi_b,
      studentFlavor.flavor.mi_c,
      studentFlavor.flavor.mi_d,
      studentFlavor.flavor.mi_e,
      studentFlavor.flavor.mi_f,
      studentFlavor.flavor.mi_g,
      studentFlavor.flavor.mi_h,
      Leader(studentFlavor.flavor.leader as LeaderUnion),
      EyeSight(studentFlavor.flavor.eyesight as EyeSightUnion),
      studentFlavor.flavor.dislikes.map((dislike) => { return dislike.student_id }).join(',')
    ]
  }) : []
  const max_previous_team: number = data ? Math.max(...data.map((row) => { return Number(row[2]) })) : 1
  const previous_team_list = [...Array(max_previous_team)].map((_, i) => i + 1)
  return (
    <HotTable
      data={data}
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
          source: previous_team_list,
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
