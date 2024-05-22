import React, { useState, useEffect, FC } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { ColDef, GridReadyEvent, CellFocusedEvent } from 'ag-grid-community';

const GridExample: FC = () => {
  const [columnDefs, setColumnDefs] = useState<ColDef[]>([
    { headerName: 'Athlete', field: 'athlete', width: 150 },
    { headerName: 'Age', field: 'age', width: 90 },
    { headerName: 'Country', field: 'country', width: 120 },
    { headerName: 'Year', field: 'year', width: 90 },
    { headerName: 'Date', field: 'date', width: 110 },
    { headerName: 'Sport', field: 'sport', width: 110 },
    { headerName: 'Gold', field: 'gold', width: 100 },
    { headerName: 'Silver', field: 'silver', width: 100 },
    { headerName: 'Bronze', field: 'bronze', width: 100 },
    { headerName: 'Total', field: 'total', width: 100 },
  ]);
  const [rowData, setRowData] = useState<any[]>(null);
  const [defaultColDef, setDefaultColDef] = useState({ editable: true });
  const [gridApi, setGridApi] = useState(null);
  const [gridColumnApi, setGridColumnApi] = useState(null);

  const processDataFromClipboard = (params) => {
    const emptyLastRow = params.data[params.data.length - 1][0] === ''
      && params.data[params.data.length - 1].length === 1;

    if (emptyLastRow) {
      params.data.splice(params.data.length - 1, 1);
    }

    const lastIndex = gridApi.getModel().rowsToDisplay.length - 1;
    const focusedCell = gridApi.getFocusedCell();
    const focusedIndex = focusedCell.rowIndex;

    if (focusedIndex + params.data.length - 1 > lastIndex) {
      const resultLastIndex = focusedIndex + (params.data.length - 1);
      const addRowCount = resultLastIndex - lastIndex;
      let rowsToAdd = [];
      let addedRows = 0;
      let currIndex = params.data.length - 1;
      while (addedRows < addRowCount) {
        rowsToAdd.push(params.data.splice(currIndex, 1)[0]);
        addedRows++;
        currIndex--;
      }
      rowsToAdd = rowsToAdd.reverse();
      let newRowData = [];
      rowsToAdd.map(r => {
        let row = {};
        let currColumn = focusedCell.column;
        r.map(i => {
          row[currColumn.colDef.field] = i;
          currColumn = gridColumnApi.getDisplayedColAfter(currColumn);
        });
        newRowData.push(row);
      });
      gridApi.updateRowData({ add: newRowData });
    }
    return params.data;
  };

  const onGridReady = (params: GridReadyEvent) => {
    setGridApi(params.api);
    setGridColumnApi(params.columnApi);

    const httpRequest = new XMLHttpRequest();
    const updateData = (data) => {
      setRowData(data);
    };

    httpRequest.open(
      'GET',
      'https://raw.githubusercontent.com/ag-grid/ag-grid/master/packages/ag-grid-docs/src/olympicWinnersSmall.json'
    );
    httpRequest.send();
    httpRequest.onreadystatechange = () => {
      if (httpRequest.readyState === 4 && httpRequest.status === 200) {
        updateData(JSON.parse(httpRequest.responseText).slice(0, 10));
      }
    };
  };

  return (
    <div style={{ width: '100%', height: '100%'}}>
      <div
        id="myGrid"
        className="ag-theme-balham"
      >
        <AgGridReact
          columnDefs={columnDefs}
          rowData={rowData}
          enableRangeSelection={true}
          rowSelection='multiple'
          defaultColDef={defaultColDef}
          processDataFromClipboard={processDataFromClipboard}
          onGridReady={onGridReady}
        />
      </div>
    </div>
  );
};


export default GridExample;