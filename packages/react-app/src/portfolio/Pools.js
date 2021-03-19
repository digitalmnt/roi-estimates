import Table from 'rc-table';
import React, { useEffect, useState } from "react";
import { Container } from 'react-awesome-styled-grid';
import ReactTooltip from 'react-tooltip'
import './styles.css';

function PoolTable({ data, onPoolRowClick }) {

  const [sortColumn, setSortColumn] = useState('Estimated ROI (7d/30d/1y)')
  const [sortAsc, setSortDirection] = useState(false)
  const [sortedData, setSortedData] = useState([])

  const fetchGasValues = (row) => ({
    onClick: (e) => {
      onPoolRowClick(row)
    }
  })

  const sampleData = {
    'Liquidity Pool': "UMA/ETH",
    'Estimated ROI (7d/30d/1y)': "1.56% / 6.68% / 81.32%",
    '24h Volume': "$ 812,851",
    'Address': "0x001b6450083e531a5a7bf310bd2c1af4247e23d4",
  }

  const addOnHeaderCell = (column) => ({
    onClick: () => {
      setSortDirection((currentSortDirection) =>
        currentSortDirection === sortAsc ? !sortAsc : sortAsc
      );
      if (sortColumn !== column) {
        setSortColumn(column);
        //  lil goofy here
        setSortDirection(sortAsc);
      }
    },
  })

  const mappedColumns = Object.keys(sampleData).map((key) => {
    const row = {
      title: key,
      dataIndex: key,
      key: key.Address,
      width: 'auto',
      onHeaderCell: () => addOnHeaderCell(key),
    }

    if (Object.keys(sampleData[key]).length) {
      row.render = sampleData[key].render
    }

    return row
  })


  useEffect(() => {
    if (data) {
      const sortData = (data) => {
        return data.sort((rowA, rowB) => rowB['30 Day ROI - IL'] - rowA['30 Day ROI - IL'])
      }
      const sortedData = sortData(data.response)
      setSortedData(sortedData)
    }
  }, [data, sortedData, sortAsc, sortColumn])

  if (data) {
    // setSortedData(data.response)
    return (
      <Container style={{
        marginTop: '10px',
        display: 'flex',
        justifyContent: 'center',
      }}>
        <ReactTooltip multiline={true} />
        <Table
          data-tip="Click on row to see returns<br /> and impact of impermanent loss and gas fees<br /> on those returns. This data was gathered using "
          columns={mappedColumns}
          data={sortedData}
          onRow={(record) => fetchGasValues(record)}
          rowKey={'Address'}
        />
      </Container>
    )
  }
  return (
    <div>loadinnn....</div>
  )
}

export default PoolTable