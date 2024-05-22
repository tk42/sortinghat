import { makeStyles } from '@material-ui/core';
import React, { ChangeEvent, useCallback, useMemo, useRef, useState } from 'react';
import { Survey, StudentFlavor } from 'services/types/interfaces';
import { updateStudentFlavor } from 'services/libs/setter';
import { ColumnDefinition, GenerateRowKeyFunction, Table, TableHandles, HeaderProps, PaginationProps } from '@kazunori-kimura/react-awesome-table';

const mi_choices = [
    { name: '0', value: 0 },
    { name: '1', value: 1 },
    { name: '2', value: 2 },
    { name: '3', value: 3 },
    { name: '4', value: 4 },
    { name: '5', value: 5 },
    { name: '6', value: 6 },
    { name: '7', value: 7 },
    { name: '8', value: 8 },
]

function Header<T>({ onInsertRow, onDeleteRows }: HeaderProps<T>): React.ReactElement {
    const classes = useStyles();
    return (
        <div className={classes.root}></div>
    );
}


function Pagination<T>({
    page,
    total,
    lastPage,
    hasPrev,
    hasNext,
    rowsPerPage,
    rowsPerPageOptions,
    onChangePage,
    onChangeRowsPerPage,
}: PaginationProps<T>): React.ReactElement {
    const classes = useStyles();

    const handleClickPageFirst = (event: MouseEvent) => {
        onChangePage(event, 0);
    };
    const handleClickPagePrev = (event: MouseEvent) => {
        onChangePage(event, page - 1);
    };
    const handleClickPageNext = (event: MouseEvent) => {
        onChangePage(event, page + 1);
    };
    const handleClickPageLast = (event: MouseEvent) => {
        onChangePage(event, lastPage);
    };

    return (
        <div className={classes.root}></div>
    );
}

const useStyles = makeStyles({
    root: {
        zIndex: 0
    },
    table: {
        width: '100%',
        flex: 1,
    },
});


interface ContainerProps {
    survey?: Survey;
}

export const Container: React.FC<ContainerProps> = props => {
    const style = useStyles();
    const [studentFlavors, setStudentFlavors] = useState<Partial<StudentFlavor>[]>(props.survey!.student_flavors!);

    const ref = useRef<TableHandles<StudentFlavor>>();

    const getRowKey: GenerateRowKeyFunction<StudentFlavor> = useCallback((item, _, cells) => {
        if (item) {
            return item.student.id;
        }
        return `${cells!.length + 1}`;
    }, []);

    const columns: ColumnDefinition<StudentFlavor>[] = useMemo(
        () => [
            {
                name: 'id',
                displayName: "ID",
                getValue: (item) => item.student.id,
                defaultValue: () => `${studentFlavors.length + 1}`,
                required: true,
                unique: true,
                hidden: true,
            },
            {
                name: 'name',
                displayName: "名前",
                getValue: (item) => item.student.name,
                required: true,
                readonly: true,
                width: 300,
            },
            {
                name: 'sex',
                displayName: "性別",
                getValue: (item) => item.student.sex,
                required: true,
                readonly: true,
                dataList: [
                    {name: '男', value: 0},
                    {name: '女', value: 1},
                ],
                width: 50,
            },
            {
                name: 'mi_a',
                displayName: "A",
                getValue: (item) => item.flavor.mi_a,
                width: 70,
                valueType: 'numeric',
                dataList: mi_choices,
            },
            {
                name: 'mi_b',
                displayName: "B",
                getValue: (item) => item.flavor.mi_b,
                width: 70,
                valueType: 'numeric',
                dataList: mi_choices,
            },
            {
                name: 'mi_c',
                displayName: "C",
                getValue: (item) => item.flavor.mi_c,
                width: 70,
                valueType: 'numeric',
                dataList: mi_choices,
            },
            {
                name: 'mi_d',
                displayName: "D",
                getValue: (item) => item.flavor.mi_d,
                width: 70,
                valueType: 'numeric',
                dataList: mi_choices,
            },
            {
                name: 'mi_e',
                displayName: "E",
                getValue: (item) => item.flavor.mi_e,
                width: 70,
                valueType: 'numeric',
                dataList: mi_choices,
            },
            {
                name: 'mi_f',
                displayName: "F",
                getValue: (item) => item.flavor.mi_f,
                width: 70,
                valueType: 'numeric',
                dataList: mi_choices,
            },
            {
                name: 'mi_g',
                displayName: "G",
                getValue: (item) => item.flavor.mi_g,
                width: 70,
                valueType: 'numeric',
                dataList: mi_choices,
            },
            {
                name: 'mi_h',
                displayName: "H",
                getValue: (item) => item.flavor.mi_h,
                width: 70,
                valueType: 'numeric',
                dataList: mi_choices,
            },
            {
                name: 'leader',
                displayName: "リーダー",
                getValue: (item) => item.flavor.leader,
                width: 150,
                valueType: 'numeric',
                dataList: [
                    { name: 'リーダー', value: 8 },
                    { name: 'サブリーダー', value: 3 },
                    { name: 'それ以外', value: 1 },
                ],
            },
            {
                name: 'eyesight',
                displayName: "視力",
                getValue: (item) => item.flavor.eyesight,
                width: 50,
                valueType: 'numeric',
                dataList: [
                    { name: 'はい！！目のかんけいで…', value: 8 },
                    { name: 'あの、目のかんけいではないけど、できれば前がいいな…', value: 3 },
                    { name: 'いいえ、どこでもいいよ', value: 1 },
                ],
            },
            {
                name: 'dislikes',
                displayName: "嫌いな人",
                getValue: (item) => item.flavor.dislikes.map((dislike) => dislike.student_id).join(', ') || '',
                width: 150,
            },
        ],
        [studentFlavors.length]
    );

    const handleChange = useCallback((new_studentFlavors: Partial<StudentFlavor>[]) => {
        console.log("updated", new_studentFlavors)
        // setStudentFlavors(new_studentFlavors);
    }, []);

    return (
        <div className={style.root}>
            <div className={style.table}>
                <Table<Partial<StudentFlavor>>
                    ref={ref}
                    data={studentFlavors}
                    columns={columns}
                    getRowKey={getRowKey}
                    renderHeader={Header}
                    renderPagination={Pagination}
                    onChange={handleChange}
                    readOnly={false}
                    rowsPerPage={45}
                    classes={style}
                    sticky
                    rowNumber
                    options={{
                        sortable: false,
                        filterable: false
                    }}
                />
            </div>
        </div>
    );
};
