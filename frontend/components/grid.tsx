import Select, { InputActionMeta, SingleValue, MultiValue, ActionMeta } from 'react-select';
import React, { useState , useEffect } from 'react';

const selectClassName = "border-gray-300 min-w-full"
const customControlStyles = (base: any) => ({
  height: 32,
  // minHeight: 24,
  // maxHeight: 48,
});

interface Option {
  readonly value: string;
  readonly label: string;
}

const miScoreOptions: readonly Option[] = [
  { value: '0', label: '0' },
  { value: '1', label: '1' },
  { value: '2', label: '2' },
  { value: '3', label: '3' },
  { value: '4', label: '4' },
  { value: '5', label: '5' },
  { value: '6', label: '6' },
  { value: '7', label: '7' },
  { value: '8', label: '8' }
];

const leaderOptions: readonly Option[] = [
  { value: '8', label: 'リーダー（チームやクラスのために）' },
  { value: '3', label: 'サブリーダー（リーダーを支える）' },
  { value: '1', label: '上の２つ以外' }
];

const eyesightOptions: readonly Option[] = [
  { value: '8', label: 'はい！！目のかんけいで…' },
  { value: '3', label: 'あの、目のかんけいではないけど、できれば前がいいな…' },
  { value: '1', label: 'いいえ、どこでもいいよ' }
];


const make_select = (
  data: string[][],
  setData: React.Dispatch<React.SetStateAction<string[][]>>,
  value: string,
  colIndex: number,
  rowIndex: number,
  setFocusedCell: React.Dispatch<React.SetStateAction<{ row: number; col: number; }>>,
  menuIsOpen: boolean,
  setMenuIsOpen: React.Dispatch<React.SetStateAction<boolean>>,
) => {

  const onInputChange = (inputValue: string, actionMeta: InputActionMeta) => {
    if (actionMeta.action === 'input-blur') {
      setMenuIsOpen(false);
    } else if (actionMeta.action === 'input-change') {
      setMenuIsOpen(true);
    }
  };

  const dislikeOptions: readonly Option[] = data.map((row: string[], rIdx: number) => {
    return { value: rIdx.toString(), label: row[0] } as Option;
  }).filter((option: Option) => option.value !== rowIndex.toString());

  const handleChange = (selectedOption: SingleValue<Option>) => {
    const newValues = data.map((row, rIdx) =>
      row.map((cell, cIdx) => {
        if (rIdx === rowIndex && cIdx === colIndex) {
          return selectedOption!.value;
        }
        return cell;
      })
    );
    setData(newValues);
  }

  // Helper function to find the option based on the value
  const findMIScoreOption = (value: string | number) => miScoreOptions.find((option: Option) => option.value === value);
  const findLeaderOption = (value: string | number) => leaderOptions.find((option: Option) => option.value === value);
  const findEyesightOption = (value: string | number) => eyesightOptions.find((option: Option) => option.value === value);

  switch (colIndex) {
    case 0:
      return (
        <td
          key={`${rowIndex},${colIndex}`}
          data-index={`${rowIndex},${colIndex}`}
          aria-readonly="true"
        >
          {value}
        </td>
      )
    case 1:
      return (
        <td
          key={`${rowIndex},${colIndex}`}
          data-index={`${rowIndex},${colIndex}`}
          aria-readonly="true"
        >
          {value === '0' ? '男' : '女'}
        </td>
      )
    case 2:
    case 3:
    case 4:
    case 5:
    case 6:
    case 7:
    case 8:
    case 9:
        return (
          <td key={`col-${colIndex}`}>
            <Select
              value={findMIScoreOption(value)}
              onChange={handleChange}
              onFocus={() => setFocusedCell({ row: rowIndex, col: colIndex })}
              options={miScoreOptions}
              className={selectClassName}
              styles={{control: customControlStyles}}
              components={{ DropdownIndicator:() => null, IndicatorSeparator:() => null }}
            />
          </td>
        )
    case 10:
      return (
        <td key={`col-${colIndex}`}>
          <Select
            value={findLeaderOption(value)}
            onChange={handleChange}
            onFocus={() => setFocusedCell({ row: rowIndex, col: colIndex })}
            options={leaderOptions}
            name={"leader"}
            className={selectClassName}
            styles={{control: customControlStyles}}
            components={{ DropdownIndicator:() => null, IndicatorSeparator:() => null }}
          />
        </td>
      )
    case 11:
      return (
        <td
          key={`${rowIndex},${colIndex}`}
          data-index={`${rowIndex},${colIndex}`}
        >
          <Select
            value={findEyesightOption(value)}
            onChange={handleChange}
            onFocus={() => setFocusedCell({ row: rowIndex, col: colIndex })}
            options={eyesightOptions}
            name={"eyesight"}
            className={selectClassName}
            styles={{control: customControlStyles}}
            components={{ DropdownIndicator:() => null, IndicatorSeparator:() => null }}
          />
        </td>
      )
    case 12:
      // console.log(value.split(','))
      return (
        <td
          key={`${rowIndex},${colIndex}`}
          data-index={`${rowIndex},${colIndex}`}
          style={{
            width: 320,
            minWidth: 320
          }}
        >
          <Select
            isMulti
            defaultValue={dislikeOptions.filter((option: Option) => value.split(",").includes(option.value))}
            isClearable
            isSearchable
            onInputChange={onInputChange}
            onChange={(newValue: MultiValue<Option>, actionMeta: ActionMeta<Option>) => {
              const newValues = data.map((row, rIdx) =>
                row.map((cell, cIdx) => {
                  if (rIdx === rowIndex && cIdx === colIndex) {
                    return newValue!.map((option: Option) => option.value).join(',');
                  }
                  return cell;
                })
              );
              setData(newValues);
            }}
            name="dislikes"
            options={dislikeOptions}
            className={selectClassName}
            styles={{control: customControlStyles}}
            components={{ DropdownIndicator:() => null, IndicatorSeparator:() => null }}
          />
        </td>
      )
    default:
      <></>
  }
}


interface ContainerProps {
  data: string[][];
  setData: React.Dispatch<React.SetStateAction<(string)[][]>>;
}

function Table(props: ContainerProps) {
  const [focusedCell, setFocusedCell] = useState({ row: 0, col: 0 });
  const [menuIsOpen, setMenuIsOpen] = useState(false);

  // Handle the paste event on the table
  const handlePaste = (event: React.ClipboardEvent<HTMLTableElement>) => {
    event.preventDefault();
    const paste = event.clipboardData.getData('text');
    const rows = paste.split(/\r\n|\n|\r/).map(row => row.split(/\t/));

    props.setData(currentValues =>
      currentValues.map((row: string[], rIdx: number) =>
        row.map((cell: string, cIdx: number) => {
          if (rIdx >= focusedCell.row && cIdx >= focusedCell.col) {
            const pasteRow = rows[rIdx - focusedCell.row];
            if (pasteRow && pasteRow[cIdx - focusedCell.col] !== undefined) {
              return pasteRow[cIdx - focusedCell.col];
            }
          }
          return cell;
        })
      )
    );
  };

  return (
    <table
      className="table-auto text-left min-w-max"
      onPaste={handlePaste}
    >
      <thead className='border-2 text-left h-5'>
        <tr>
          <th className='pl-2 pr-8 text-center'>名前</th>
          <th className='pr-1'>性別</th>
          <th className='pr-1 text-center'>A</th>
          <th className='pr-1 text-center'>B</th>
          <th className='pr-1 text-center'>C</th>
          <th className='pr-1 text-center'>D</th>
          <th className='pr-1 text-center'>E</th>
          <th className='pr-1 text-center'>F</th>
          <th className='pr-1 text-center'>G</th>
          <th className='pr-1 text-center'>H</th>
          <th className='pl-2 pr-12'>リーダー</th>
          <th className='pl-2 pr-12'>視力</th>
          <th className='pl-2 pr-12'>嫌いな人</th>
        </tr>
      </thead>
      <tbody className="">
      {(props.data).map((row, rowIndex) => (
          <tr key={`row-${rowIndex}`}>
            {row.map((value: string, colIndex: number) => (
                make_select(props.data, props.setData, value, colIndex, rowIndex, setFocusedCell, menuIsOpen, setMenuIsOpen)
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default Table;
