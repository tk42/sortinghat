import React, { useState } from 'react';
import Select from 'react-select';

export const GridSelect = () => {
  // Define the options for the Select components
  const options = [
    { value: '0', label: '0' },
    { value: '1', label: '1' },
    { value: '2', label: '2' },
    { value: '3', label: '3' },
    { value: '4', label: '4' },
    { value: '5', label: '5' },
    { value: '6', label: '6' },
    { value: '7', label: '7' },
    { value: '8', label: '8' },
  ];

  // State to hold the values for the Select components and the currently focused cell
  const [values, setValues] = useState(Array(3).fill(Array(7).fill('')));
  const [focusedCell, setFocusedCell] = useState({ row: 0, col: 0 });

  // Helper function to find the option based on the value
  const findOption = (value) => options.find(option => option.value === value);

  // Handle the paste event on the table
  const handlePaste = (event) => {
    event.preventDefault();
    const paste = event.clipboardData.getData('text');
    const rows = paste.split(/\r\n|\n|\r/).map(row => row.split(/\t/));

    setValues(currentValues =>
      currentValues.map((row, rIdx) =>
        row.map((cell, cIdx) => {
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

  // Render the table with Select components
  return (
    <table onPaste={handlePaste}>
    <thead className='border-2 text-left'>
        <tr>
          <th className='pr-12'>名前</th>
          <th className='pr-1'>性別</th>
          <th className='pr-1'>A</th>
          <th className='pr-1'>B</th>
          <th className='pr-1'>C</th>
          <th className='pr-1'>D</th>
          <th className='pr-1'>E</th>
          <th className='pr-1'>F</th>
          <th className='pr-1'>G</th>
          <th className='pr-1'>H</th>
          <th className='pr-12'>リーダー</th>
          <th className='pr-12'>視力</th>
          <th className='pr-12'>嫌いな人</th>
        </tr>
      </thead>
      <tbody>
        {values.map((row, rowIndex) => (
          <tr key={`row-${rowIndex}`}>
            {row.map((value, colIndex) => (
              <td key={`col-${colIndex}`}>
                <Select
                  value={findOption(value)}
                  onChange={(selectedOption) => {
                    const newValues = values.map((row, rIdx) =>
                      row.map((cell, cIdx) => {
                        if (rIdx === rowIndex && cIdx === colIndex) {
                          return selectedOption.value;
                        }
                        return cell;
                      })
                    );
                    setValues(newValues);
                  }}
                  onFocus={() => setFocusedCell({ row: rowIndex, col: colIndex })}
                  options={options}
                  className="react-select-container"
                  classNamePrefix="react-select"
                />
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
};
